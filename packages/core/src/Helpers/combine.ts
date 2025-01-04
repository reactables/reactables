import { combineLatest, Observable, merge, ObservedValueOf } from 'rxjs';
import { Action, Reactable } from '../Models';

export const combine = <T extends Record<string, Reactable<unknown, unknown>>>(
  reactablesDict: T,
) => {
  const { states, actions, actions$ } = Object.entries(reactablesDict).reduce(
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
      [K in keyof { [K in keyof T]: T[K][0] }]: ObservedValueOf<{ [K in keyof T]: T[K][0] }[K]>;
    }>,
    { [K in keyof T]: T[K][1] },
    Observable<Action<unknown>>,
  ];
};
