import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { RxBuilder } from './RxBuilder';
import { combine } from './combine';

const RxToggle = () => RxBuilder({ initialState: false, reducers: { toggle: (state) => !state } });
const RxCounter = () =>
  RxBuilder({ initialState: 0, reducers: { increment: (state) => state + 1 } });

describe('combine', () => {
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

  it('should expose actionMap with per-source typed observables', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const rxToggle = RxToggle();
      const rxCounter = RxCounter();
      const [, actions, actions$] = combine({ toggle: rxToggle, counter: rxCounter });

      subscription = cold('-a-b', {
        a: actions.toggle.toggle,
        b: actions.counter.increment,
      }).subscribe((action) => action());

      expectObservable(actions$.actionMap.toggle.toggle).toBe('-a', {
        a: { type: 'toggle', payload: undefined },
      });

      expectObservable(actions$.actionMap.counter.increment).toBe('---b', {
        b: { type: 'increment', payload: undefined },
      });
    });
  });

  it('should expose a deeply nested actionMap for nested combined reactables', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const inner = combine({ toggle: RxToggle(), counter: RxCounter() });
      const [, actions, actions$] = combine({ inner });

      subscription = cold('-a-b', {
        a: actions.inner.toggle.toggle,
        b: actions.inner.counter.increment,
      }).subscribe((action) => (action as () => void)());

      expectObservable(actions$.actionMap.inner.toggle.toggle).toBe('-a', {
        a: { type: 'toggle', payload: undefined },
      });

      expectObservable(actions$.actionMap.inner.counter.increment).toBe('---b', {
        b: { type: 'increment', payload: undefined },
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

  describe('when combined', () => {
    const rxToggle = RxToggle();
    const rxCounter = RxCounter();
    const combined = combine({ toggle: rxToggle, counter: rxCounter });

    it('should subscribe and receive stored value', () => {
      testScheduler.run(({ expectObservable, cold }) => {
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

    it('should subscribe and receive stored value', () => {
      testScheduler.run(({ expectObservable }) => {
        const [state$] = combined;
        expectObservable(state$).toBe('a', {
          a: { toggle: true, counter: 1 },
        });
      });
    });
  });
});
