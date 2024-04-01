import { RxBuilder } from '@reactables/core';
import { FlowTest } from '../Models';
import { testFlow } from './testFlow';

const Counter = () =>
  RxBuilder({
    initialState: 0,
    reducers: {
      increment: (state) => state + 1,
      decrement: (state) => state - 1,
    },
  });

describe('testFlow', () => {
  const counterTest: FlowTest<number, { increment: () => void; decrement: () => void }, undefined> =
    {
      description: 'counter should go through flow of incrementing and decrementing',
      factories: {
        reactable: Counter,
        flow: ({ increment, decrement }: { increment: () => void; decrement: () => void }) => [
          () => increment(),
          () => decrement(),
          () => increment(),
          () => decrement(),
          () => increment(),
          () => increment(),
          () => increment(),
          () => increment(),
          () => decrement(),
        ],
      },
      expectedResult: 3,
    };

  testFlow(counterTest);
});
