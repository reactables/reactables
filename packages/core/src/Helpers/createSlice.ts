import { Reducer, Action } from '../Models';

export type SingleActionReducer<T, S> = (state: T, action: Action<S>) => T;

export type ActionCreator<T> = (payload?: T) => Action<T>;

export interface Slice<T> {
  actions: { [key: string]: ActionCreator<unknown> };
  reducer: Reducer<T>;
}

interface Cases<T> {
  [key: string]: SingleActionReducer<T, unknown>;
}

export interface SliceConfig<T, S extends Cases<T>> {
  name: string;
  initialState: T;
  cases: S;
}

export const createSlice = <T, S extends Cases<T>>(
  config: SliceConfig<T, S>,
) => {
  const { name, initialState, cases } = config;

  const reducer: Reducer<T> = Object.entries(cases).reduce(
    (acc, [key, _case]): Reducer<T> => {
      const newFunc = (state: T, action: Action<unknown>) => {
        if (action && action.type === `${name}/${key}`) {
          return _case(state, action);
        }

        return acc(state, action);
      };

      return newFunc as Reducer<T>;
    },
    (state = initialState) => state,
  );

  const actions = Object.entries(cases).reduce((acc, [key]) => {
    acc[key as keyof S] = (payload: unknown) => ({
      type: `${name}/${key}`,
      payload,
    });
    return acc;
  }, {} as { [K in keyof S]: ActionCreator<unknown> });

  return {
    reducer,
    actions,
  };
};
