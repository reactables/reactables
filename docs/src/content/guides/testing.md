## Testing

Since reactables are not tightly coupled with UI components, we can test our state logic independently without needing to render any UI components.

To test a reactable, we subscribe to its state observable and invoke the action methods being tested. We can assert the sequence of events emitted by the observable matches requirement specs.

This can be done with RxJS's built in <a href="https://rxjs.dev/guide/testing/marble-testing" target="_blank" rel="noreferrer">Marble Testing</a>.

```typescript
import { RxCounter } from './RxCounter';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

describe('RxCounter', () => {
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
      // Create Counter Reactable
      const [
        state$,
        { increment, reset },
      ] = RxCounter();

      // Call actions
      subscription = cold('--b-c', {
        b: increment,
        c: reset,
      }).subscribe((action) => action());

      // Assertions
      expectObservable(state$).toBe('a-b-c', {
        a: { count: 0 },
        b: { count: 1 },
        c: { count: 0 },
      });
    });
  });
});
```
