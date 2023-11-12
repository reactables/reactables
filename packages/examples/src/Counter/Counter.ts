import { Reducer, Action, HubFactory, Reactable } from '@hub-fx/core';

// Actions
const INCREMENT = 'INCREMENT';
const increment = (): Action => ({ type: INCREMENT });

const RESET = 'RESET';
const reset = (): Action => ({ type: RESET });

// Reducer function to handle state updates
interface CounterState {
  count: number;
}
const reducer: Reducer<CounterState> = (state = { count: 0 }, action) => {
  switch (action?.type) {
    case INCREMENT:
      return { count: state.count + 1 };
    case RESET:
      return { count: 0 };
    default:
      return state;
  }
};

export const Counter = (): Reactable<CounterState> => {
  const hub = HubFactory();

  return {
    state$: hub.store({ reducer }),
    actions: {
      increment: () => hub.dispatch(increment()),
      reset: () => hub.dispatch(reset()),
    },
  };
};
