import { createSlice, SliceConfig, Cases } from './createSlice';
import {
  Reactable,
  ActionCreatorTypeFromReducer,
  ActionObservableWithTypes,
} from '../Models/Reactable';
import { Effect } from '../Models/Effect';
import { Action, ScopedEffects } from '../Models/Action';
import { Observable, ReplaySubject, Subject, merge } from 'rxjs';
import { filter, tap, map, mergeAll, scan, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { share, shareReplay } from 'rxjs/operators';
import jsonDiff, { Difference } from '../Helpers/jsonDiff';
import { ofTypes } from '../Operators';
import { createActionTypeStringMap } from './createActionTypeStringMap';

export interface DestroyAction {
  destroy: () => void;
}

export interface RxConfig<T, S extends Cases<T>> extends SliceConfig<T, S> {
  debug?: boolean;
  sources?: Observable<Action<any> | Action>[];
}

const getScopedEffectSignature = (actionType: string, key: string | number) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export const RxBuilder = <T, S extends Cases<T>>({
  sources = [],
  debug = false,
  ...sliceConfig
}: RxConfig<T, S>) => {
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
            scopedEffects: effects((action as Action<unknown>).payload),
          };
        }

        return { type: action.type, payload: (action as Action<unknown>).payload };
      }),
    ),
  );

  /**
   * CREATE HUB AND STORE
   */

  // Teardown subject
  const destroy$ = new Subject<void>();

  // Dispatcher for the UI to push state updates
  const dispatcher$ = new ReplaySubject<Action<any> | Action>(1);

  // All incoming actions
  const incomingActions$ = merge(
    dispatcher$,
    ...sources.map((source) => source.pipe(takeUntil(destroy$), shareReplay(1))),
  );

  // Dictionary of effects scoped to actions & key (if provided)
  const scopedEffectsDict: { [key: string]: Effect<unknown, unknown>[] | undefined } = {};

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
        scopedEffects?.effects as Effect<unknown, unknown>[] | undefined;
    }),
    // Once effects are registered, merge them into the `mergeScopedEffects$` stream for the store to receive.
    map(({ type, scopedEffects }) => {
      const signature = getScopedEffectSignature(type, scopedEffects?.key as string);

      const pipedEffects = scopedEffects?.effects.reduce(
        (acc: Observable<Action<any> | Action>[], effect) =>
          acc.concat(
            incomingActions$.pipe(
              filter(
                (initialAction) =>
                  getScopedEffectSignature(
                    initialAction.type,
                    initialAction.scopedEffects?.key as string,
                  ) === signature,
              ),
              effect,
            ),
          ),
        [] as Observable<Action<any> | Action>[],
      ) as Observable<Action<any> | Action>[];

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
    // tap((action) => {
    //   debug &&
    //     console.log(debugName, '[ACTION]', { type: action.type, payload: action.payload }, '\n');
    // }),
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
    map((pair) => pair[1] as T),
  );

  const storedState$ = new ReplaySubject<T>(1);
  stateEvents$.pipe(takeUntil(destroy$)).subscribe((state) => storedState$.next(state));

  // Action methods for the UI to invoke state changes
  const actions = {
    ...(Object.fromEntries(
      Object.entries(actionCreators).map(([key, actionCreator]) => [
        key,
        (payload: unknown) => {
          dispatcher$.next(actionCreator(payload));
        },
      ]),
    ) as { [K in keyof S]: ActionCreatorTypeFromReducer<S[K]> }),
    // Destroy method to teardown reactable
    destroy: () => {
      destroy$.next();
      destroy$.complete();
    },
  };

  const types = createActionTypeStringMap(actions);

  const actions$ = mergedActions$ as ActionObservableWithTypes<typeof types>;
  actions$.types = types;
  actions$.ofTypes = (types) => actions$.pipe(ofTypes(types as string[]));

  return [storedState$, actions, actions$] as Reactable<
    T,
    { [K in keyof S]: ActionCreatorTypeFromReducer<S[K]> } & DestroyAction,
    typeof types
  >;
};
