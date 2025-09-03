import { Effect } from '../Models/Effect';
import { Action, ActionCreator, AnyAction, ScopedEffects } from '../Models/Action';

export const addEffects = <T>(
  actionCreator: ActionCreator<T>,
  scopedEffects: (payload: T) => ScopedEffects,
): ActionCreator<T> => {
  return (payload?: T) => ({
    ...actionCreator(payload),
    scopedEffects: scopedEffects(payload as T),
  });
};

export type Reducer<T> = (state?: T, action?: AnyAction) => T;

export type SingleActionReducer<T> = (state: T, action: any) => T;

export interface Cases<T> {
  [key: string]:
    | SingleActionReducer<T>
    | {
        reducer: SingleActionReducer<T>;
        effects?: ((payload?: any) => ScopedEffects) | Effect<unknown, unknown>[];
      };
}

export interface SliceConfig<T, S extends Cases<T>> {
  initialState: T;
  reducers: S;
  name?: string;
}

export const createSlice = <T, S extends Cases<T>>(config: SliceConfig<T, S>) => {
  const { initialState, reducers } = config;

  const reducer: Reducer<T> = Object.entries(reducers).reduce(
    (acc, [key, _case]): Reducer<T> => {
      const _reducer = typeof _case === 'function' ? _case : _case.reducer;

      const newFunc = (state: T, action: Action<unknown>) => {
        if (action && action.type === key) {
          return _reducer(state, action);
        }

        return acc(state, action);
      };

      return newFunc as Reducer<T>;
    },
    (state = initialState) => state,
  );

  const actions = Object.entries(reducers).reduce((acc, [key, _case]) => {
    acc[key as keyof S] = (payload: unknown) => ({
      type: key,
      payload,
    });

    if (typeof _case !== 'function' && _case.effects) {
      const effects =
        typeof _case.effects === 'function'
          ? _case.effects
          : ((() => ({ effects: _case.effects })) as (payload?: unknown) => ScopedEffects);
      acc[key as keyof S] = addEffects(acc[key as keyof S], effects);
    }

    return acc;
  }, {} as { [K in keyof S]: ActionCreator<unknown> });

  return {
    reducer,
    actionCreators: actions,
  };
};
