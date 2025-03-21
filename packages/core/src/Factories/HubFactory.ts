import { Hub, HubConfig, StoreConfig } from '../Models/Hub';
import { Observable, ReplaySubject, merge } from 'rxjs';
import { filter, tap, map, mergeAll, scan, pairwise, startWith } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { share, shareReplay } from 'rxjs/operators';
import { Effect } from '../Models/Effect';
import jsonDiff, { Difference } from '../Helpers/jsonDiff';

const getScopedEffectSignature = (actionType: string, key: string | number) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export const HubFactory = ({ effects, sources = [] }: HubConfig = {}): Hub => {
  const dispatcher$ = new ReplaySubject<Action<unknown>>(1);
  const inputStream$ = merge(dispatcher$, ...sources.map((source) => source.pipe(shareReplay(1))));

  const genericEffects =
    effects?.reduce((result: Observable<Action<unknown>>[], effect) => {
      return result.concat(inputStream$.pipe(effect));
    }, []) || [];

  // Should we keep this in the stream with a scan operator instead?
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

  const messages$ = merge(inputStream$, mergedScopedEffects, ...genericEffects).pipe(share());

  const store = <T>({ reducer, name, debug, initialState }: StoreConfig<T>) => {
    const debugName = `[RX NAME] ${name || 'undefined'}\n`;

    const seedState = initialState !== undefined ? initialState : reducer();

    const state$ = messages$.pipe(
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
