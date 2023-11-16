import { RxBuilder, Reactable } from '@hub-fx/core';
interface CounterState {
  count: number;
}

interface CounterActions {
  increment: () => void;
  reset: () => void;
}

const counterSlice = RxBuilder.createSlice({
  name: 'counter',
  initialState: { count: 0 } as CounterState,
  reducers: {
    increment: (state) => ({ count: state.count + 1 }),
    reset: () => ({ count: 0 }),
  },
});

export const Counter = (): Reactable<CounterState, CounterActions> => {
  const hub = RxBuilder.createHub();

  const { reducer, actions } = counterSlice;

  return {
    state$: hub.store({ reducer }),
    actions: {
      increment: () => hub.dispatch(actions.increment()),
      reset: () => hub.dispatch(actions.reset()),
    },
  };
};
