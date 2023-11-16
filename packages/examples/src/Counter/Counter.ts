import { RxBuilder, Reactable, ActionMap } from '@hub-fx/core';
interface CounterState {
  count: number;
}

interface CounterActions extends ActionMap {
  increment: () => void;
  reset: () => void;
}

export const Counter = (): Reactable<CounterState, CounterActions> => {
  // Create Slice to generate actions and reducers
  const { reducer, actions } = RxBuilder.createSlice({
    name: 'counter',
    initialState: { count: 0 } as CounterState,
    reducers: {
      increment: (state) => ({ count: state.count + 1 }),
      reset: () => ({ count: 0 }),
    },
  });

  // Create hub and initialize store
  const hub = RxBuilder.createHub();

  return {
    state$: hub.store({ reducer }),
    actions: {
      increment: () => hub.dispatch(actions.increment()),
      reset: () => hub.dispatch(actions.reset()),
    },
  };
};
