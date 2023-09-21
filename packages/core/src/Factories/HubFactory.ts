import { Hub, HubConfig, StoreConfig } from '../Models/Hub';
import { Observable, ReplaySubject, merge } from 'rxjs';
import {
  filter,
  tap,
  map,
  mergeAll,
  scan,
  pairwise,
  startWith,
} from 'rxjs/operators';
import { Action } from '../Models/Action';
import { share } from 'rxjs/operators';
import { Effect } from '../Models/Effect';

const getScopedEffectSignature = (actionType: string, key: string) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export const HubFactory = ({ effects }: HubConfig = {}): Hub => {
  const dispatcher$ = new ReplaySubject<Action<unknown>>(1);

  const genericEffects =
    effects?.reduce((result: Observable<Action<unknown>>[], effect) => {
      return result.concat(dispatcher$.pipe(effect));
    }, []) || [];

  // Should we keep this in the stream with a scan operator instead?
  const scopedEffectsDict: { [key: string]: Effect<unknown, unknown>[] } = {};

  const mergedScopedeffects = dispatcher$.pipe(
    filter(({ type, scopedEffects }) => {
      const hasEffects = Boolean(scopedEffects && scopedEffects.effects.length);

      return (
        hasEffects &&
        scopedEffectsDict[getScopedEffectSignature(type, scopedEffects.key)] ===
          undefined
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
            dispatcher$.pipe(
              filter(
                (initialAction) =>
                  getScopedEffectSignature(
                    initialAction.type,
                    initialAction.scopedEffects?.key,
                  ) === signature,
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

  const messages$ = merge(
    dispatcher$,
    mergedScopedeffects,
    ...genericEffects,
  ).pipe(share());

  const store = <T>(config: StoreConfig<T>) => {
    const { reducer, name, debug, initialState } = config;
    const debugName = `[Stream Name] ${name || 'undefined'}`;

    const seedState = initialState !== undefined ? initialState : reducer();

    const state$ = messages$.pipe(
      tap((action) => {
        debug && console.log(debugName, '[Message Received]', action);
      }),
      scan(reducer, seedState),
      startWith(null, seedState),
      pairwise(),
      tap(([prevState, newState]) => {
        if (debug) {
          const hasDiff = prevState !== newState;
          if (hasDiff) {
            console.log(
              debugName,
              '[State changed] Prev State:',
              prevState,
              'New State:',
              newState,
            );
          } else {
            console.log(debugName, '[State unchanged] State:', newState);
          }
        }
      }),
      map((pair) => pair[1] as T),
    );

    return state$;
  };

  return {
    messages$,
    store,
    dispatch: (...actions) => {
      actions.forEach((action) => {
        dispatcher$.next(action);
      });
    },
  };
};
