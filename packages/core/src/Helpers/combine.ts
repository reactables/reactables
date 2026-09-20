import { combineLatest, Observable, merge, ObservedValueOf } from 'rxjs';
import { ofTypes } from '../Operators';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { Action, Reactable } from '../Models';
import { DestroyAction } from './RxBuilder';
import {
  ActionObservableWithTypes,
  CombinedActionMapType,
  CombinedState,
  InheritedSelectors,
  ReactableWithSelectors,
  SelectorsFromDefs,
} from '../Models/Reactable';
import { combineActionTypeStringMaps } from './createActionTypeStringMap';

export const combine = <T extends Record<string, Reactable<unknown, unknown & DestroyAction>>>(
  sourceReactables: T,
) => {
  const { states, actions, actions$, actionMap } = Object.entries(sourceReactables).reduce(
    <U, V extends DestroyAction>(
      acc: {
        states: { [K in keyof T]: T[K][0] };
        actions: { [K in keyof T]: T[K][1] } & DestroyAction;
        actions$: Observable<Action<any>>[];
        actionMap: Record<string, unknown>;
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
        actionMap: {
          ...acc.actionMap,
          [key]: actions$.actionMap,
        },
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
      actionMap: {} as Record<string, unknown>,
    } as {
      states: { [K in keyof T]: T[K][0] };
      actions: { [K in keyof T]: T[K][1] } & DestroyAction;
      actions$: Observable<Action<any>>[];
      actionMap: Record<string, unknown>;
    },
  );
  const states$ = combineLatest(states);

  const actionTypes = combineActionTypeStringMaps(sourceReactables);

  const mergedActions$ = merge(...actions$) as ActionObservableWithTypes<
    typeof actionTypes,
    CombinedActionMapType<T>
  >;

  mergedActions$.types = actionTypes;
  mergedActions$.ofTypes = (types) => mergedActions$.pipe(ofTypes(types as string[]));
  mergedActions$.actionMap = actionMap as CombinedActionMapType<T>;

  type ActionsType = { [K in keyof T]: T[K][1] } & DestroyAction;
  type State = CombinedState<T>;

  // Collect .selectors objects from children that have already called .selectors().
  // Children that haven't called .selectors() (their .selectors is still a function)
  // or have no .selectors at all are omitted.
  const inheritedSelectors = Object.fromEntries(
    Object.entries(sourceReactables)
      .filter(([, r]) => {
        const sel = (r as any).selectors;
        return sel != null && typeof sel === 'object';
      })
      .map(([key, r]) => [key, (r as any).selectors]),
  ) as InheritedSelectors<T>;

  const result = [states$, actions, mergedActions$] as [
    Observable<State>,
    ActionsType,
    ActionObservableWithTypes<typeof actionTypes, CombinedActionMapType<T>>,
  ] & {
    selectors<Defs extends Record<string, (state: State) => unknown>>(
      defs: Defs,
    ): ReactableWithSelectors<
      State,
      ActionsType,
      typeof actionTypes,
      CombinedActionMapType<T>,
      InheritedSelectors<T> & SelectorsFromDefs<State, Defs>
    >;
  };

  (result as any).selectors = <Defs extends Record<string, (state: State) => unknown>>(
    defs: Defs,
  ) => {
    const newSelectors = Object.fromEntries(
      Object.entries(defs).map(([key, fn]) => [
        key,
        states$.pipe(
          map(fn as (state: State) => unknown),
          distinctUntilChanged(),
          shareReplay(1),
        ),
      ]),
    ) as SelectorsFromDefs<State, Defs>;

    (result as any).selectors = { ...inheritedSelectors, ...newSelectors };

    return result as unknown as ReactableWithSelectors<
      State,
      ActionsType,
      typeof actionTypes,
      CombinedActionMapType<T>,
      InheritedSelectors<T> & SelectorsFromDefs<State, Defs>
    >;
  };

  return result;
};
