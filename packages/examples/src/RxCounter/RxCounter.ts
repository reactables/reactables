import { RxBuilder, Reactable } from '@reactables/core';

interface CounterState {
  count: number;
}

type CounterActions = {
  increment: () => void;
  reset: () => void;
};

export const RxCounter = (): Reactable<CounterState, CounterActions> =>
  RxBuilder({
    initialState: { count: 0 } as CounterState,
    reducers: {
      increment: (state) => ({ count: state.count + 1 }),
      reset: () => ({ count: 0 }),
    },
  });
