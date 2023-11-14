import { Reducer, Action } from '../Models';

type SingleActionReducer<T, S> = (state: T, action: Action<S>) => T;

type ActionCreator = (payload: unknown) => Action<unknown>;

export interface Slice<T> {
  actions: { [key: string]: ActionCreator };
  reducer: Reducer<T>;
}

export interface SliceConfig<T> {
  name: string;
  initialState: T;
  cases: {
    [key: string]: SingleActionReducer<T, unknown>;
  };
}

export const createSlice = <T>(config: SliceConfig<T>): Slice<T> => {
  const { name, initialState, cases } = config;

  const reducer: Reducer<T> = Object.entries(cases).reduce(
    (acc, [key, _case]): Reducer<T> => {
      const newFunc = <S>(state: T, action: Action<S>) => {
        if (action.type === `${name}/${key}`) {
          return _case(state, action);
        }

        return acc(state, action);
      };

      return newFunc as Reducer<T>;
    },
    (state = initialState) => state,
  );

  const actions: { [key: string]: ActionCreator } = Object.entries(
    cases,
  ).reduce(
    <S>(
      acc: { [key: string]: ActionCreator },
      [key]: [string, SingleActionReducer<T, S>],
    ) => {
      acc[key] = (payload: S) => ({ type: `${name}/${key}`, payload });
      return acc;
    },
    {},
  );

  return {
    reducer,
    actions,
  };
};
