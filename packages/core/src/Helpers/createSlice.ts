import { Reducer, Action } from '../Models';

type SingleActionReducer<T, S> = (state: T, action: Action<S>) => T;

export interface Slice<T> {
  actions: { [key: string]: Action };
  reducer: Reducer<T>;
}

export interface SliceConfig<T> {
  name: string;
  initialState: T;
  cases: {
    [key: string]: SingleActionReducer<T, unknown>;
  };
}

export const createSlice = <T>(config: SliceConfig<T>) => {
  const { name, initialState, cases } = config;

  const finalReducer: Reducer<T> = Object.entries(cases).reduce(
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

  return finalReducer;
};
