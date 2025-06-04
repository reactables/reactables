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

const RxCombined = () =>
  combine({
    counter: RxCounter({ extendedCounter: (state) => state }),
    toggle: RxToggle(),
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

  it('should generate types for combined reactables', () => {
    const [, , actions$] = RxCombined();

    expect(actions$.types).toEqual({
      '[counter] - extendedCounter': '[counter] - extendedCounter',
      '[counter] - increment': '[counter] - increment',
      '[counter] - setCounter': '[counter] - setCounter',
      '[counter] - hi': '[counter] - hi',
      '[counter] - some wierd reducer': '[counter] - some wierd reducer',
      '[toggle] - toggle': '[toggle] - toggle',
      '[toggle] - toggleOn': '[toggle] - toggleOn',
      '[toggle] - toggleOff': '[toggle] - toggleOff',
      '[toggle] - setToggle': '[toggle] - setToggle',
    });
  });

  it('should generate types for reactables combined multiple times', () => {
    const [, , actions$] = combine({
      combined: RxCombined(),
      multiplier: RxBuilder({
        initialState: 0,
        reducers: {
          multiply: (state, action: Action<number>) => state * action.payload,
        },
      }),
    });

    expect(actions$.types).toEqual({
      '[combined] - [counter] - extendedCounter': '[combined] - [counter] - extendedCounter',
      '[combined] - [counter] - increment': '[combined] - [counter] - increment',
      '[combined] - [counter] - setCounter': '[combined] - [counter] - setCounter',
      '[combined] - [counter] - hi': '[combined] - [counter] - hi',
      '[combined] - [counter] - some wierd reducer': '[combined] - [counter] - some wierd reducer',
      '[combined] - [toggle] - toggle': '[combined] - [toggle] - toggle',
      '[combined] - [toggle] - toggleOn': '[combined] - [toggle] - toggleOn',
      '[combined] - [toggle] - toggleOff': '[combined] - [toggle] - toggleOff',
      '[combined] - [toggle] - setToggle': '[combined] - [toggle] - setToggle',
      '[multiplier] - multiply': '[multiplier] - multiply',
    });
  });
});
