import { createSlice } from './createSlice';
import { Action } from '../Models/Action';

describe('createSlice', () => {
  it('should create the proper reducer and actions', () => {
    const counterSlice = createSlice({
      name: 'counter',
      initialState: { counter: 0 },
      reducers: {
        increment: (state) => ({ counter: state.counter + 1 }),
        decrement: (state) => ({ counter: state.counter - 1 }),
        reset: () => ({ counter: 0 }),
        setCounter: (state, action: Action<number>) => ({
          counter: action.payload,
        }),
      },
    });
    const {
      actions: { increment, decrement, reset, setCounter },
      reducer,
    } = counterSlice;
    const initialState = reducer();

    expect(initialState).toEqual({ counter: 0 });

    const incremented = reducer(initialState, increment());
    const incremented2 = reducer(incremented, increment());
    expect(incremented2).toEqual({ counter: 2 });

    const decremented = reducer(incremented2, decrement());
    expect(decremented).toEqual({ counter: 1 });

    const resetted = reducer(incremented2, reset());
    expect(resetted).toEqual(initialState);

    const counterSet = reducer(resetted, setCounter(3));
    expect(counterSet).toEqual({ counter: 3 });
  });
});
