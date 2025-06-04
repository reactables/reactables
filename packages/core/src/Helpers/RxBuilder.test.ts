import { RxBuilder } from './RxBuilder';
import { Action } from '../Models';
import { combine } from './combine';
import { Cases } from './createSlice';

const RxToggle = <T extends Cases<boolean>>(reducers?: T) => {
  return RxBuilder({
    initialState: false,
    reducers: {
      toggle: (state) => !state,
      toggleOn: () => true,
      toggleOff: () => false,
      setToggle: (_, { payload }: Action<boolean>) => payload,
      ...reducers,
    },
  });
};

interface CounterState {
  count: number;
}

const RxCounter = <T extends Cases<CounterState>>(reducers?: T) =>
  RxBuilder({
    initialState: { count: 0 } as CounterState,
    reducers: {
      increment: (state: { count: number }) => ({
        count: state.count + 1,
      }),
      setCounter: (_, action: Action<number>) => ({
        count: action.payload,
      }),
      hi: { reducer: (state) => state },
      'some wierd reducer': (state) => state,
      ...reducers,
    },
  });

describe('RxBuilder', () => {
  it('should generate types for reactables', () => {
    const [, , counterActions$] = RxCounter();

    expect(counterActions$.types).toEqual({
      increment: 'increment',
      setCounter: 'setCounter',
      hi: 'hi',
      'some wierd reducer': 'some wierd reducer',
    });

    const [, , toggleActions$] = RxToggle();

    expect(toggleActions$.types).toEqual({
      toggle: 'toggle',
      toggleOn: 'toggleOn',
      toggleOff: 'toggleOff',
      setToggle: 'setToggle',
    });

    const [, , extendedToggleActions$] = RxToggle({ extendedToggle: (state) => state });

    expect(extendedToggleActions$.types).toEqual({
      toggle: 'toggle',
      toggleOn: 'toggleOn',
      toggleOff: 'toggleOff',
      setToggle: 'setToggle',
      extendedToggle: 'extendedToggle',
    });

    const [, , extendedCounterActions$] = RxCounter({ extendedCounter: (state) => state });

    expect(extendedCounterActions$.types).toEqual({
      increment: 'increment',
      setCounter: 'setCounter',
      hi: 'hi',
      'some wierd reducer': 'some wierd reducer',
      extendedCounter: 'extendedCounter',
    });
  });
});
