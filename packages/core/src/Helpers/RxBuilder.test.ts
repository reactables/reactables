import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
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
  let testScheduler: TestScheduler;

  const rxCounter = RxBuilder({
    initialState: 0,
    reducers: {
      increment: (state) => state + 1,
    },
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  let subscription: Subscription;

  afterAll(() => {
    subscription?.unsubscribe();
  });

  it('should increment state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const [state$, actions] = rxCounter;
      subscription = cold('-a-b-c', {
        a: actions.increment,
        b: actions.increment,
        c: actions.increment,
      }).subscribe((action) => action());

      expectObservable(state$).toBe('a b-c-d', { a: 0, b: 1, c: 2, d: 3 });
    });
  });

  it('should subscribe to reactable and receive stored value', () => {
    testScheduler.run(({ expectObservable }) => {
      const [state$] = rxCounter;

      expectObservable(state$).toBe('a', { a: 3 });
    });
  });

  it('should generate types for reactables', () => {
    const [, , counterActions$] = RxCounter();

    expect(counterActions$.types).toEqual({
      increment: 'increment',
      setCounter: 'setCounter',
      hi: 'hi',
      'some wierd reducer': 'some wierd reducer',
      destroy: 'destroy',
    });

    const [, , toggleActions$] = RxToggle();

    expect(toggleActions$.types).toEqual({
      toggle: 'toggle',
      toggleOn: 'toggleOn',
      toggleOff: 'toggleOff',
      setToggle: 'setToggle',
      destroy: 'destroy',
    });

    const [, , extendedToggleActions$] = RxToggle({ extendedToggle: (state) => state });

    expect(extendedToggleActions$.types).toEqual({
      toggle: 'toggle',
      toggleOn: 'toggleOn',
      toggleOff: 'toggleOff',
      setToggle: 'setToggle',
      extendedToggle: 'extendedToggle',
      destroy: 'destroy',
    });

    const [, , extendedCounterActions$] = RxCounter({ extendedCounter: (state) => state });

    expect(extendedCounterActions$.types).toEqual({
      increment: 'increment',
      setCounter: 'setCounter',
      hi: 'hi',
      'some wierd reducer': 'some wierd reducer',
      extendedCounter: 'extendedCounter',
      destroy: 'destroy',
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
      '[combined] - [counter] - destroy': '[combined] - [counter] - destroy',
      '[combined] - [counter] - extendedCounter': '[combined] - [counter] - extendedCounter',
      '[combined] - [counter] - increment': '[combined] - [counter] - increment',
      '[combined] - [counter] - setCounter': '[combined] - [counter] - setCounter',
      '[combined] - [counter] - hi': '[combined] - [counter] - hi',
      '[combined] - [counter] - some wierd reducer': '[combined] - [counter] - some wierd reducer',
      '[combined] - [toggle] - destroy': '[combined] - [toggle] - destroy',
      '[combined] - [toggle] - toggle': '[combined] - [toggle] - toggle',
      '[combined] - [toggle] - toggleOn': '[combined] - [toggle] - toggleOn',
      '[combined] - [toggle] - toggleOff': '[combined] - [toggle] - toggleOff',
      '[combined] - [toggle] - setToggle': '[combined] - [toggle] - setToggle',
      '[multiplier] - multiply': '[multiplier] - multiply',
      '[multiplier] - destroy': '[multiplier] - destroy',
    });
  });
});
