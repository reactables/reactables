import { Reducer, Action } from '../Models';

type SingleActionReducer<T, S> = (state: T, action: Action<S>) => T;

export interface Slice<T> {
  actions: { [key: string]: Action };
  reducer: Reducer<T>;
}

export interface SliceCaseConfig<T, S> {
  reducer: SingleActionReducer<T, S>;
  prepare: <Q>(payload: Q) => Action<S>;
}

export interface SliceConfig<T> {
  name: string;
  initialState: T;
  reducers: {
    [key: string]:
      | SingleActionReducer<unknown, unknown>
      | SliceCaseConfig<unknown, unknown>;
  };
}
