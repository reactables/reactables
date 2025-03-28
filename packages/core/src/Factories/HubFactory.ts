import { Hub, HubConfig, StoreConfig } from '../Models/Hub';
import { Observable, ReplaySubject, Subject, merge } from 'rxjs';
import { filter, tap, map, mergeAll, scan, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { share, shareReplay } from 'rxjs/operators';
import { Effect } from '../Models/Effect';
import jsonDiff, { Difference } from '../Helpers/jsonDiff';

const getScopedEffectSignature = (actionType: string, key: string | number) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export const HubFactory = ({ effects, sources = [] }: HubConfig = {}): Hub => {
  const destroy$ = new Subject<void>();

  const dispatcher$ = new ReplaySubject<Action<unknown>>(1);
  const inputStream$ = merge(
    dispatcher$,
    // We need to hook this up to the destory action
    ...sources.map((source) => source.pipe(takeUntil(destroy$), shareReplay(1))),
  );

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
    const replaySubject = new ReplaySubject<T>(1);

    state$.pipe(takeUntil(destroy$)).subscribe((state) => replaySubject.next(state));

    return {
      state$: replaySubject,
      destroy: () => {
        destroy$.next();
        destroy$.complete();
      },
    };
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
