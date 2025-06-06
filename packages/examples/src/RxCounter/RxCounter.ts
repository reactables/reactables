import { RxBuilder } from '@reactables/core';

interface CounterState {
  count: number;
}

export const RxCounter = () =>
  RxBuilder({
    initialState: { count: 0 } as CounterState,
    reducers: {
      increment: (state) => ({ count: state.count + 1 }),
      reset: () => ({ count: 0 }),
    },
  });
