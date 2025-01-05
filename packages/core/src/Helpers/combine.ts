import { combineLatest, Observable, merge, ObservedValueOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action, Reactable } from '../Models';

export const combine = <T extends Record<string, Reactable<unknown, unknown>>>(
  sourceReactables: T,
) => {
  const { states, actions, actions$ } = Object.entries(sourceReactables).reduce(
    (acc, [key, [state$, actions, actions$]]) => {
      return {
        states: {
          ...acc.states,
          [key as keyof T]: state$,
        },
        actions: {
          ...acc.actions,
          [key as keyof T]: actions as { [K in keyof T]: T[K][1] },
        },
        actions$: actions$ ? acc.actions$.concat(actions$) : acc.actions$,
      };
    },
    {
      states: {} as { [K in keyof T]: T[K][0] },
      actions: {} as { [K in keyof T]: T[K][1] },
      actions$: [] as Observable<Action<unknown>>[],
    },
  );
  const states$ = combineLatest(states);

  return [states$, actions, merge(...actions$)] as [
    Observable<{
      [K in keyof T]: ObservedValueOf<T[K][0]>;
    }>,
    { [K in keyof T]: T[K][1] },
    Observable<Action<unknown>>,
  ];
};
