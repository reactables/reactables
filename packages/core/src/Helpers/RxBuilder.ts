import { createSlice, SliceConfig, Cases } from './createSlice';
import {
  Reactable,
  StateObservable,
  ActionCreatorTypeFromReducer,
  ActionObservableWithTypes,
  Selectors,
} from '../Models/Reactable';
import { Effect } from '../Models/Effect';
import { Action, ScopedEffects, AnyAction } from '../Models/Action';
import { Observable, OperatorFunction, ReplaySubject, Subject, merge } from 'rxjs';
import { filter, tap, map, mergeAll, scan, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { share, shareReplay } from 'rxjs/operators';
import jsonDiff, { Difference } from '../Helpers/jsonDiff';
import { ofTypes } from '../Operators';
import { createActionTypeStringMap } from './createActionTypeStringMap';

export interface DestroyAction {
  destroy: () => void;
}

type AnyActionStream = Observable<AnyAction>;

export interface RxConfig<
  State,
  Actions extends Cases<State>,
  SelectorsDict extends Selectors<State> | undefined = undefined,
> extends SliceConfig<State, Actions> {
  debug?: boolean;
  sources?: Array<AnyActionStream>;
  selectors?: SelectorsDict;
}

const getScopedEffectSignature = (actionType: string, key: string | number) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export const RxBuilder = <
  State,
  Actions extends Cases<State>,
  SelectorsDict extends Selectors<State> | undefined = undefined,
>({
  sources = [],
  debug = false,
  selectors,
  ...sliceConfig
}: RxConfig<State, Actions, SelectorsDict>) => {
  /**
   * CREATE MAIN REDUCER AND ACTION CREATORS
   */
  const { reducer, actionCreators } = createSlice(sliceConfig);

  // Add effects to incoming source actions
  sources = sources.map((action$) =>
    action$.pipe(
      map((action) => {
        const _case = sliceConfig.reducers[action.type];

        if (_case && typeof _case !== 'function' && _case.effects) {
          const effects =
            typeof _case.effects === 'function'
              ? _case.effects
              : ((() => ({ effects: _case.effects })) as (payload?: unknown) => ScopedEffects);

          return {
            ...action,
            scopedEffects: effects((action as Action<any>).payload),
          };
        }

        return { type: action.type, payload: action.payload as unknown };
      }),
    ),
  );

  /**
   * CREATE HUB AND STORE
   */

  // Teardown subject
  const destroy$ = new Subject<void>();

  // Dispatcher for the UI to push state updates
  const dispatcher$ = new ReplaySubject<AnyAction>(1);

  // All incoming actions
  const incomingActions$ = merge(
    dispatcher$,
    ...sources.map((source) => source.pipe(takeUntil(destroy$), shareReplay(1))),
  );

  // Dictionary of effects scoped to actions & key (if provided)
  const scopedEffectsDict: { [key: string]: Effect[] | undefined } = {};

  // Registers scoped effects to the dictionary.
  const mergedScopedEffects$ = incomingActions$.pipe(
    // Listen for scoped effects not yet registered in "scopedEffectsDict"
    filter(({ type, scopedEffects }) => {
      const hasEffects = Boolean(scopedEffects && scopedEffects.effects.length);

      return (
        hasEffects &&
        scopedEffectsDict[getScopedEffectSignature(type, scopedEffects?.key as string)] ===
          undefined
      );
    }),
    // Register the new scoped effect
    tap(({ type, scopedEffects }) => {
      scopedEffectsDict[getScopedEffectSignature(type, scopedEffects?.key as string)] =
        scopedEffects?.effects as Effect[];
    }),
    // Once effects are registered, merge them into the `mergeScopedEffects$` stream for the store to receive.
    map(({ type, scopedEffects }) => {
      const signature = getScopedEffectSignature(type, scopedEffects?.key as string);

      const pipedEffects = (scopedEffects?.effects as Effect[]).reduce(
        (acc: Array<AnyActionStream>, effect) =>
          acc.concat(
            incomingActions$.pipe(
              filter(
                (initialAction) =>
                  getScopedEffectSignature(
                    initialAction.type,
                    initialAction.scopedEffects?.key as string,
                  ) === signature,
              ),
              effect as OperatorFunction<AnyAction, AnyAction>,
            ),
          ),
        [],
      );

      return merge(...(pipedEffects || []));
    }),
    mergeAll(),
  );

  const debugName = `[RX NAME] ${sliceConfig.name || 'undefined'}\n`;
  const seedState = sliceConfig.initialState !== undefined ? sliceConfig.initialState : reducer();

  // All actions received by the store
  const mergedActions$ = merge(incomingActions$, mergedScopedEffects$).pipe(share());

  // State updates
  const stateEvents$ = mergedActions$.pipe(
    tap((action) => {
      debug &&
        console.log(
          debugName,
          '[ACTION]',
          { type: action.type, payload: action.payload as unknown },
          '\n',
        );
    }),
    scan(reducer, seedState),
    startWith(null, seedState),
    pairwise(),
    tap(([prevState, newState]) => {
      // Debug Logging
      if (debug) {
        if (
          prevState &&
          typeof prevState === 'object' &&
          newState &&
          typeof newState === 'object'
        ) {
          try {
            const reduceDiff = (diff: Difference[]) =>
              diff.reduce((acc, change) => ({ ...acc, [change.path.join('|')]: change }), {});

            const difference = reduceDiff(
              jsonDiff(prevState as Record<string, any>, newState as object),
            );

            console.log(
              debugName,
              '[STATE]',
              newState,
              '\n',
              '[DIFF]',
              Object.keys(difference).length ? difference : null,
              '\n',
            );
          } catch (e) {
            console.log('[ERROR READING DIFF]', e, '\n', '[STATE]', newState);
          }
        } else {
          const hasDiff = prevState !== newState;
          try {
            console.log(
              debugName,
              '\n',
              '[STATE]',
              newState,
              '[DIFF]',
              hasDiff
                ? {
                    oldValue: prevState as unknown,
                    newValue: newState as unknown,
                  }
                : null,
            );
          } catch (e) {
            console.log('[ERROR READING DIFF]', e, '\n', '[STATE]', newState);
          }
        }
      }
    }),
    map((pair) => pair[1] as State),
  );

  const storedState$ = new ReplaySubject<State>(1) as StateObservable<State, SelectorsDict>;
  storedState$.selectors = selectors;

  stateEvents$
    .pipe(takeUntil(destroy$))
    .subscribe((state) => (storedState$ as ReplaySubject<State>).next(state));

  // Action methods for the UI to invoke state changes
  const actions = {
    ...(Object.fromEntries(
      Object.entries(actionCreators).map(([key, actionCreator]) => [
        key,
        (payload: unknown) => {
          dispatcher$.next(actionCreator(payload));
        },
      ]),
    ) as { [K in keyof Actions]: ActionCreatorTypeFromReducer<Actions[K]> }),
    // Destroy method to teardown reactable
    destroy: () => {
      destroy$.next();
      destroy$.complete();
    },
  };

  const types = createActionTypeStringMap(actions);

  const actions$ = mergedActions$ as ActionObservableWithTypes<typeof types>;
  actions$.types = types;
  actions$.ofTypes = (types) => actions$.pipe(ofTypes(types));

  return [storedState$, actions, actions$] as Reactable<
    State,
    { [K in keyof Actions]: ActionCreatorTypeFromReducer<Actions[K]> } & DestroyAction,
    typeof types,
    SelectorsDict
  >;
};
