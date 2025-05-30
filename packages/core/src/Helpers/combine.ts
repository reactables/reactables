import { combineLatest, Observable, merge, ObservedValueOf } from 'rxjs';
import { ofTypes } from '../Operators';
import { map } from 'rxjs/operators';
import { Action, Reactable } from '../Models';
import { ActionObservableWithTypes } from '../Models/Reactable';
import { combineActionTypeStringMaps } from './createActionTypeStringMap';

export const combine = <T extends Record<string, Reactable<unknown, unknown>>>(
  sourceReactables: T,
) => {
  const { states, actions, actions$ } = Object.entries(sourceReactables).reduce(
    <U, V>(
      acc: {
        states: { [K in keyof T]: T[K][0] };
        actions: { [K in keyof T]: T[K][1] };
        actions$: Observable<Action<unknown>>[];
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
      };
    },
    {
      states: {} as { [K in keyof T]: T[K][0] },
      actions: {} as { [K in keyof T]: T[K][1] },
      actions$: [] as Observable<Action<unknown>>[],
    } as {
      states: { [K in keyof T]: T[K][0] };
      actions: { [K in keyof T]: T[K][1] };
      actions$: Observable<Action<unknown>>[];
    },
  );
  const states$ = combineLatest(states);

  const actionTypes = combineActionTypeStringMaps(sourceReactables);

  const mergedActions$ = merge(...actions$) as ActionObservableWithTypes<typeof actionTypes>;
  mergedActions$.types = actionTypes;
  mergedActions$.ofTypes = (types) => mergedActions$.pipe(ofTypes(types as string[]));

  return [states$, actions, mergedActions$] as [
    Observable<{
      [K in keyof T]: ObservedValueOf<T[K][0]>;
    }>,
    { [K in keyof T]: T[K][1] },
    ActionObservableWithTypes<typeof actionTypes>,
  ];
};
