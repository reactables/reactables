import { createSlice } from './createSlice';
import { Action } from '../Models';

describe('createSlice', () => {
  it('should create the proper reducer and actions', () => {
    const counterSlice = createSlice({
      name: 'counter',
      initialState: { counter: 0 },
      cases: {
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

    const incremented = reducer(initialState);

    expect(incremented);
  });
});
