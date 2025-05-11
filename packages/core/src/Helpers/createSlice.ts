import { Effect } from '../Models/Effect';
import { Action, ActionCreator, ScopedEffects } from '../Models/Action';

export const addEffects = <T>(
  actionCreator: ActionCreator<T>,
  scopedEffects: (payload: T) => ScopedEffects<T>,
): ActionCreator<T> => {
  return (payload?: T) => ({
    ...actionCreator(payload),
    scopedEffects: scopedEffects(payload),
  });
};

export type Reducer<T> = (state?: T, action?: Action<unknown>) => T;

export type SingleActionReducer<T, S> = (state: T, action: Action<S>) => T;

export interface Cases<T> {
  [key: string]:
    | SingleActionReducer<T, unknown>
    | {
        reducer: SingleActionReducer<T, unknown>;
        effects?: ((payload?: unknown) => ScopedEffects<unknown>) | Effect<unknown, unknown>[];
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
          : ((() => ({ effects: _case.effects })) as (payload?: unknown) => ScopedEffects<unknown>);
      acc[key as keyof S] = addEffects(acc[key as keyof S], effects);
    }

    return acc;
  }, {} as { [K in keyof S]: ActionCreator<unknown> });

  return {
    reducer,
    actionCreators: actions,
  };
};
