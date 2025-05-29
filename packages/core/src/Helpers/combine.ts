import { combineLatest, Observable, merge, ObservedValueOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action, Reactable } from '../Models';
import { ObservableWithActionTypes } from '../Models/Reactable';
import { createActionTypeString } from './createActionTypeString';

export const combine = <T extends Record<string, Reactable<unknown, unknown>>>(
  sourceReactables: T,
) => {
  const { states, actions, actions$ } = Object.entries(sourceReactables).reduce(
    <U, V>(
      acc: {
        states: { [K in keyof T]: T[K][0] };
        actions: { [K in keyof T]: T[K][1] };
        actions$: Observable<Action<unknown>>[];
        actionTypes: { [key: string]: string };
      },
      [key, [state$, actions, actions$]]: [string, Reactable<U, V>],
    ) => {
      return {
        states: {
          ...acc.states,
          [key as keyof T]: state$,
        },
        actions: {
          ...acc.actions,
          [key as keyof T]: actions as { [K in keyof T]: T[K][1] },
        },
        actions$: actions$
          ? acc.actions$.concat(
              actions$.pipe(
                map((action) => ({
                  ...action,
                  type: `[${key}] - ${action.type}`,
                })),
              ),
            )
          : acc.actions$,
        actionTypes: {
          ...acc.actionTypes,
          ...createActionTypeString(actions$.types, key),
        },
      };
    },
    {
      states: {} as { [K in keyof T]: T[K][0] },
      actions: {} as { [K in keyof T]: T[K][1] },
      actions$: [] as Observable<Action<unknown>>[],
      actionTypes: {},
    } as {
      states: { [K in keyof T]: T[K][0] };
      actions: { [K in keyof T]: T[K][1] };
      actions$: Observable<Action<unknown>>[];
      actionTypes;
    },
  );
  const states$ = combineLatest(states);

  const mergedActions$ = merge(...actions$);

  return [states$, actions, mergedActions$] as [
    Observable<{
      [K in keyof T]: ObservedValueOf<T[K][0]>;
    }>,
    { [K in keyof T]: T[K][1] },
    ObservableWithActionTypes<Action<unknown>, T>,
  ];
};
