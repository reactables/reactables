import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { RxBuilder } from './RxBuilder';

describe('Reactable', () => {
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
});
