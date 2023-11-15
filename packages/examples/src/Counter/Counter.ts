import { HubFactory, Reactable, createSlice } from '@hub-fx/core';

interface CounterState {
  count: number;
}

interface CounterActions {
  increment: () => void;
  reset: () => void;
}

const {
  reducer,
  actions: { increment, reset },
} = createSlice({
  name: 'counter',
  initialState: { count: 0 } as CounterState,
  cases: {
    increment: (state) => ({ count: state.count + 1 }),
    reset: () => ({ count: 0 }),
  },
});

export const Counter = (): Reactable<CounterState, CounterActions> => {
  const hub = HubFactory();

  return {
    state$: hub.store({ reducer }),
    actions: {
      increment: () => hub.dispatch(increment()),
      reset: () => hub.dispatch(reset()),
    },
  };
};
