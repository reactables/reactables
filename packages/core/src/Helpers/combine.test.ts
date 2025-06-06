import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { RxBuilder } from './RxBuilder';
import { combine } from './combine';

const RxToggle = () => RxBuilder({ initialState: false, reducers: { toggle: (state) => !state } });
const RxCounter = () =>
  RxBuilder({ initialState: 0, reducers: { increment: (state) => state + 1 } });

describe('storeValue', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  let subscription: Subscription;

  afterAll(() => {
    subscription?.unsubscribe();
  });

  it('should update the combined state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const rxToggle = RxToggle();
      const rxCounter = RxCounter();
      const combined = combine({ toggle: rxToggle, counter: rxCounter });

      const [state$, actions] = combined;

      subscription = cold('-a-b', {
        a: actions.toggle.toggle,
        b: actions.counter.increment,
      }).subscribe((action) => action());

      expectObservable(state$).toBe('a b-c', {
        a: { toggle: false, counter: 0 },
        b: { toggle: true, counter: 0 },
        c: { toggle: true, counter: 1 },
      });
    });
  });

  it('should emit action events for the combined Reactable', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const rxToggle = RxToggle();
      const rxCounter = RxCounter();
      const combined = combine({ toggle: rxToggle, counter: rxCounter });

      const [, actions, actions$] = combined;

      subscription = cold('-a-b', {
        a: actions.toggle.toggle,
        b: actions.counter.increment,
      }).subscribe((action) => action());

      const { types } = actions$;

      expectObservable(
        actions$
          .ofTypes([types['[toggle] - toggle'], types['[counter] - increment']])
          .pipe(map(({ type }) => type)),
      ).toBe('-a-b', {
        a: '[toggle] - toggle',
        b: '[counter] - increment',
      });
    });
  });
});
