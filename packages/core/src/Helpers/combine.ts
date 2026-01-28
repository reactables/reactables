import { combineLatest, Observable, merge, ObservedValueOf } from 'rxjs';
import { ofTypes } from '../Operators';
import { map } from 'rxjs/operators';
import { Action, Reactable } from '../Models';
import { DestroyAction } from './RxBuilder';
import { ActionObservableWithTypes, StateObservable } from '../Models/Reactable';
import { combineActionTypeStringMaps } from './createActionTypeStringMap';

export const combine = <T extends Record<string, Reactable<any, any & DestroyAction>>>(
  sourceReactables: T,
) => {
  const { states, actions, actions$ } = Object.entries(sourceReactables).reduce(
    <U, V extends DestroyAction>(
      acc: {
        states: { [K in keyof T]: T[K][0] };
        actions: { [K in keyof T]: T[K][1] } & DestroyAction;
        actions$: Observable<Action<any>>[];
      },
      [key, [state$, actions, actions$]]: [string, Reactable<U, V>],
    ) => {
      const destroy = () => {
        (actions as DestroyAction).destroy();
        acc.actions.destroy();
      };
      return {
        states: {
          ...acc.states,
          [key as keyof T]: state$,
        },
        actions: {
          ...acc.actions,
          [key as keyof T]: actions as { [K in keyof T]: T[K][1] } & DestroyAction,
          destroy,
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
      actions: {
        destroy: () => {
          undefined;
        },
      } as { [K in keyof T]: T[K][1] } & DestroyAction,
      actions$: [] as Observable<Action<any>>[],
    } as {
      states: { [K in keyof T]: T[K][0] };
      actions: { [K in keyof T]: T[K][1] } & DestroyAction;
      actions$: Observable<Action<any>>[];
    },
  );
  const states$ = combineLatest(states);

  const actionTypes = combineActionTypeStringMaps(sourceReactables);

  const mergedActions$ = merge(...actions$) as ActionObservableWithTypes<typeof actionTypes>;

  mergedActions$.types = actionTypes;
  mergedActions$.ofTypes = (types) => mergedActions$.pipe(ofTypes(types));

  return [states$, actions, mergedActions$] as [
    StateObservable<{
      [K in keyof T]: ObservedValueOf<T[K][0]>;
    }>,
    { [K in keyof T]: T[K][1] } & DestroyAction,
    ActionObservableWithTypes<typeof actionTypes>,
  ];
};
