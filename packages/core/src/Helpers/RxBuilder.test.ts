import { RxBuilder } from './RxBuilder';
import { Action } from '../Models';
import { combine } from './combine';

interface CounterState {
  count: number;
}

describe('RxBuilder', () => {
  it('should generate types for reactables', () => {
    const RxCounter = () =>
      RxBuilder({
        initialState: { count: 0 } as CounterState,
        reducers: {
          increment: (state: { count: number }) => ({
            count: state.count + 1,
          }),
          setCounter: (_, action: Action<number>) => ({
            count: action.payload,
          }),
          hi: (state) => state,
          'some wierd reducer': (state) => state,
        },
      });

    const [, , counterActions$] = RxCounter();

    expect(counterActions$.types).toEqual({
      increment: 'increment',
      setCounter: 'setCounter',
      hi: 'hi',
      'some wierd reducer': 'some wierd reducer',
    });

    const RxToggle = () =>
      RxBuilder({
        initialState: false,
        reducers: {
          toggle: (state) => !state,
          toggleOn: () => true,
          toggleOff: () => false,
          setToggle: (_, { payload }: Action<boolean>) => payload,
        },
      });

    const [, , toggleActions$] = RxToggle();

    expect(toggleActions$.types).toEqual({
      toggle: 'toggle',
      toggleOn: 'toggleOn',
      toggleOff: 'toggleOff',
      setToggle: 'setToggle',
    });

    const RxCombined = () => {
      const rxCounter = RxCounter();
      const rxToggle = RxToggle();

      return combine({
        counter: rxCounter,
        toggle: rxToggle,
      });
    };

    const [, , combinedActions$] = RxCombined();

    expect(combinedActions$.types).toEqual({
      '[toggle] - toggle': '[toggle] - toggle',
      '[toggle] - toggleOn': '[toggle] - toggleOn',
      '[toggle] - toggleOff': '[toggle] - toggleOff',
      '[toggle] - setToggle': '[toggle] - setToggle',
      '[counter] - increment': '[counter] - increment',
      '[counter] - setCounter': '[counter] - setCounter',
      '[counter] - hi': '[counter] - hi',
      '[counter] - some wierd reducer': '[counter] - some wierd reducer',
    });

    const RxDoubleCombined = () =>
      combine({
        doubleCombined: RxCombined(),
        counter: RxCounter(),
      });
    const [, , doubleCombinedActions$] = RxDoubleCombined();

    expect(doubleCombinedActions$.types).toEqual({
      '[doubleCombined] - [toggle] - toggle': '[doubleCombined] - [toggle] - toggle',
      '[doubleCombined] - [toggle] - toggleOn': '[doubleCombined] - [toggle] - toggleOn',
      '[doubleCombined] - [toggle] - toggleOff': '[doubleCombined] - [toggle] - toggleOff',
      '[doubleCombined] - [toggle] - setToggle': '[doubleCombined] - [toggle] - setToggle',
      '[doubleCombined] - [counter] - increment': '[doubleCombined] - [counter] - increment',
      '[doubleCombined] - [counter] - setCounter': '[doubleCombined] - [counter] - setCounter',
      '[doubleCombined] - [counter] - hi': '[doubleCombined] - [counter] - hi',
      '[doubleCombined] - [counter] - some wierd reducer':
        '[doubleCombined] - [counter] - some wierd reducer',
      '[counter] - increment': '[counter] - increment',
      '[counter] - setCounter': '[counter] - setCounter',
      '[counter] - hi': '[counter] - hi',
      '[counter] - some wierd reducer': '[counter] - some wierd reducer',
    });

    const [, , tripleCombinedActions$] = combine({
      tripleCombined: RxDoubleCombined(),
      doubleCombined: RxCombined(),
      counter: RxCounter(),
    });
  });
});
