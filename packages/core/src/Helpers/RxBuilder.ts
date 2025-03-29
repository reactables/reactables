import { createSlice, SliceConfig, Cases } from './createSlice';
import { Reactable } from '../Models/Reactable';
import { Effect } from '../Models/Effect';
import { Action, ScopedEffects } from '../Models/Action';
import { DestroyAction } from './storeValue';
import { Observable, ReplaySubject, Subject, merge } from 'rxjs';
import { filter, tap, map, mergeAll, scan, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { share, shareReplay } from 'rxjs/operators';
import jsonDiff, { Difference } from '../Helpers/jsonDiff';

const getScopedEffectSignature = (actionType: string, key: string | number) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export interface EffectsAndSources {
  sources?: Observable<Action<unknown>>[] | { [key: string]: Observable<unknown> };
}

export interface RxConfig<T, S extends Cases<T>> extends SliceConfig<T, S>, EffectsAndSources {
  debug?: boolean;
  /**@deprecated Use storeValue modifier instead to add store value behaviour to reactable */
  storeValue?: boolean;
}

export const RxBuilder = <T, S extends Cases<T>>({
  sources = [],
  debug = false,
  ...sliceConfig
}: RxConfig<T, S>) => {
  /**
   * CREATE REDUCERS AND ACTION CREATORS
   */
  const { reducer, actionCreators } = createSlice(sliceConfig);

  // Check sources and see if need to add effects
  if (!Array.isArray(sources)) {
    sources = Object.entries(sources).map(([key, obs$]) =>
      obs$.pipe(map((value) => ({ type: key, payload: value }))),
    );
  }

  sources = sources.map((action$) =>
    action$.pipe(
      map((action) => {
        const _case = sliceConfig.reducers[action.type];

        if (_case && typeof _case !== 'function' && _case.effects) {
          const effects =
            typeof _case.effects === 'function'
              ? _case.effects
              : ((() => ({ effects: _case.effects })) as (
                  payload?: unknown,
                ) => ScopedEffects<unknown>);

          return {
            ...action,
            scopedEffects: effects(action.payload),
          };
        }

        return action;
      }),
    ),
  );

  /**
   * CREATE HUB AND STORE
   */
  const destroy$ = new Subject<void>();

  const dispatcher$ = new ReplaySubject<Action<unknown>>(1);

  const inputStream$ = merge(
    dispatcher$,
    ...sources.map((source) => source.pipe(takeUntil(destroy$), shareReplay(1))),
  );

  // Dictionary of action streams
  const scopedEffectsDict: { [key: string]: Effect<unknown, unknown>[] } = {};

  const mergedScopedEffects = inputStream$.pipe(
    filter(({ type, scopedEffects }) => {
      const hasEffects = Boolean(scopedEffects && scopedEffects.effects.length);

      return (
        hasEffects &&
        scopedEffectsDict[getScopedEffectSignature(type, scopedEffects.key)] === undefined
      );
    }),
    tap(({ type, scopedEffects: { key, effects } }) => {
      scopedEffectsDict[getScopedEffectSignature(type, key)] = effects;
    }),
    map(({ type, scopedEffects: { key, effects } }) => {
      const signature = getScopedEffectSignature(type, key);

      const pipedEffects = effects.reduce(
        (acc: Observable<Action<unknown>>[], effect) =>
          acc.concat(
            inputStream$.pipe(
              filter(
                (initialAction) =>
                  getScopedEffectSignature(initialAction.type, initialAction.scopedEffects?.key) ===
                  signature,
              ),
              effect,
            ),
          ),
        [],
      );

      return merge(...pipedEffects);
    }),
    mergeAll(),
  );

  const actions$ = merge(inputStream$, mergedScopedEffects).pipe(share());

  const debugName = `[RX NAME] ${sliceConfig.name || 'undefined'}\n`;

  const seedState = sliceConfig.initialState !== undefined ? sliceConfig.initialState : reducer();

  const stateEvents$ = actions$.pipe(
    tap((action) => {
      debug && console.log(debugName, '[ACTION]', action, '\n');
    }),
    scan(reducer, seedState),
    startWith(null, seedState),
    pairwise(),
    tap(([prevState, newState]) => {
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

            const difference = reduceDiff(jsonDiff(prevState as object, newState as object));

            console.log(
              debugName,
              '[DIFF]',
              Object.keys(difference).length ? difference : null,
              '\n',
              '[STATE]',
              newState,
              '\n',
            );
          } catch (e) {
            console.log('[ERROR READING DIFF]', e, '\n', '[STATE]', newState);
          }
        } else {
          const hasDiff = prevState !== newState;
          console.log(
            debugName,
            '[DIFF]',
            hasDiff
              ? {
                  oldValue: prevState as unknown,
                  newValue: newState as unknown,
                }
              : null,
            '\n',
            '[STATE]',
            newState,
          );
        }
      }
    }),
    map((pair) => pair[1] as T),
  );
  const storedState$ = new ReplaySubject<T>(1);

  stateEvents$.pipe(takeUntil(destroy$)).subscribe((state) => storedState$.next(state));

  const actions = {
    ...(Object.fromEntries(
      Object.entries(actionCreators).map(([key, actionCreator]) => [
        key,
        (payload: unknown) => {
          dispatcher$.next(actionCreator(payload));
        },
      ]),
    ) as { [K in keyof S]: (payload: unknown) => void }),
    destroy: () => {
      destroy$.next();
      destroy$.complete();
    },
  };

  return [storedState$, actions, actions$] as Reactable<
    T,
    { [K in keyof S]: (payload?: unknown) => void } & DestroyAction
  >;
};
