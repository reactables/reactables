import { Counter } from './Counter';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

describe('Counter', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });
  afterEach(() => {
    subscription?.unsubscribe();
  });

  it('should increment and reset', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const counter = Counter();

      subscription = cold('--b-c', { b: 'increment', c: 'reset' }).subscribe(
        (action: 'increment' | 'reset') => {
          counter.actions[action]();
        },
      );

      expectObservable(counter.state$).toBe('a-b-c', {
        a: { count: 0 },
        b: { count: 1 },
        c: { count: 0 },
      });
    });
  });
});
