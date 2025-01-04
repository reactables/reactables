import { combineLatest, Observable } from 'rxjs';
import { Reactable } from '../Models';
import { RxBuilder } from './RxBuilder';

export const combine = <T extends Record<string, Reactable<unknown, unknown>>>(
  reactablesDict: T,
) => {
  const { states, actions } = Object.entries(reactablesDict).reduce(
    (acc, [key, [state$, actions]]) => {
      return {
        states: {
          ...acc.states,
          [key as keyof T]: state$,
        },
        actions: {
          ...acc.actions,
          [key as keyof T]: actions as { [K in keyof T]: T[K][1] },
        },
      };
    },
    {
      states: {} as { [K in keyof T]: Observable<T[K][0]> },
      actions: {} as { [K in keyof T]: T[K][1] },
    },
  );
  const states$ = combineLatest(states);

  return [states$, actions];
};
