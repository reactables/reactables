import { firstValueFrom, skip, take, toArray } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { RxBuilder } from './RxBuilder';
import { combine } from './combine';
import { Action } from '../Models';

interface CounterState {
  count: number;
}

const RxCounter = () =>
  RxBuilder({
    initialState: { count: 0 } as CounterState,
    reducers: {
      increment: (state) => ({ count: state.count + 1 }),
      decrement: (state) => ({ count: state.count - 1 }),
      set: (_, action: Action<number>) => ({ count: action.payload }),
    },
  });

const RxToggle = () =>
  RxBuilder({
    initialState: { on: false },
    reducers: {
      toggle: (state) => ({ on: !state.on }),
    },
  });

describe('selectors on RxBuilder', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('exposes selector observables after calling .selectors()', () => {
    const counter = RxCounter().selectors({
      double: (state) => state.count * 2,
      isPositive: (state) => state.count > 0,
    });

    expect(counter.selectors.double).toBeDefined();
    expect(counter.selectors.isPositive).toBeDefined();
  });

  it('infers selector result types correctly', async () => {
    const counter = RxCounter().selectors({
      double: (state) => state.count * 2,
      label: (state) => `count is ${state.count}`,
    });

    // double$ should emit numbers; label$ should emit strings
    const doubleValue = await firstValueFrom(counter.selectors.double);
    const labelValue = await firstValueFrom(counter.selectors.label);

    expect(typeof doubleValue).toBe('number');
    expect(typeof labelValue).toBe('string');
  });

  it('emits the initial selector value immediately on subscription', async () => {
    const counter = RxCounter().selectors({
      double: (state) => state.count * 2,
    });

    const value = await firstValueFrom(counter.selectors.double);
    expect(value).toBe(0); // initialState.count = 0, double = 0
  });

  it('emits updated selector value when state changes', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const counter = RxCounter().selectors({
        double: (state) => state.count * 2,
      });

      const [, actions] = counter;

      cold('-a-b').subscribe(() => actions.increment());

      expectObservable(counter.selectors.double).toBe('a b-c', {
        a: 0,
        b: 2,
        c: 4,
      });
    });
  });

  it('does not re-emit when selector result is unchanged (memoization)', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      // isPositive only changes when crossing zero; two consecutive increments
      // from 0 -> 1 -> 2 should only emit once for isPositive
      const counter = RxCounter().selectors({
        isPositive: (state) => state.count > 0,
      });

      const [, actions] = counter;

      cold('-a-b').subscribe(() => actions.increment());

      expectObservable(counter.selectors.isPositive).toBe('a b', {
        a: false,
        b: true,
        // no third emission even though state changes again on second increment
      });
    });
  });

  it('delivers the last computed value to late subscribers (shareReplay(1))', async () => {
    const counter = RxCounter().selectors({
      double: (state) => state.count * 2,
    });

    const [, actions] = counter;
    actions.increment();
    actions.increment();

    // Subscribe after two increments — should immediately get latest value
    const value = await firstValueFrom(counter.selectors.double);
    expect(value).toBe(4);
  });

  it('still works as a destructurable tuple after .selectors()', async () => {
    const counter = RxCounter().selectors({
      double: (state) => state.count * 2,
    });

    const [state$, actions] = counter;
    actions.increment();

    const state = await firstValueFrom(state$);
    expect(state.count).toBe(1);
  });

  it('supports composed selectors that reference each other via plain functions', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const fns = {
        double: (state: CounterState) => state.count * 2,
        quadruple: (state: CounterState) => fns.double(state) * 2,
      };

      const counter = RxCounter().selectors(fns);
      const [, actions] = counter;

      cold('-a').subscribe(() => actions.set(3));

      expectObservable(counter.selectors.quadruple).toBe('a b', {
        a: 0,
        b: 12, // count=3, double=6, quadruple=12
      });
    });
  });
});

describe('selectors on combine()', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('inherits child selectors nested under their key', async () => {
    const counter = RxCounter().selectors({
      double: (state) => state.count * 2,
    });

    const toggle = RxToggle().selectors({
      label: (state) => (state.on ? 'on' : 'off'),
    });

    const app = combine({ counter, toggle }).selectors({});

    const doubleValue = await firstValueFrom(app.selectors.counter.double);
    const labelValue = await firstValueFrom(app.selectors.toggle.label);

    expect(doubleValue).toBe(0);
    expect(labelValue).toBe('off');
  });

  it('exposes top-level selectors whose state is the combined state', async () => {
    const counter = RxCounter();
    const toggle = RxToggle();

    const app = combine({ counter, toggle }).selectors({
      summary: (state) => `count=${state.counter.count} on=${state.toggle.on}`,
    });

    const value = await firstValueFrom(app.selectors.summary);
    expect(value).toBe('count=0 on=false');
  });

  it('does not re-emit top-level selector when its result is unchanged', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const counter = RxCounter();
      const toggle = RxToggle();

      const app = combine({ counter, toggle }).selectors({
        // only cares about counter, not toggle
        isCountPositive: (state) => state.counter.count > 0,
      });

      const [, actions] = app;

      // increment counter once, then toggle (which does not affect the selector)
      cold('-a-b', {
        a: () => actions.counter.increment(),
        b: () => actions.toggle.toggle(),
      }).subscribe((action) => action());

      expectObservable(app.selectors.isCountPositive).toBe('a b', {
        a: false,
        b: true,
        // toggle action does not change isCountPositive → no third emission
      });
    });
  });

  it('merges inherited and top-level selectors onto the same .selectors object', async () => {
    const counter = RxCounter().selectors({
      double: (state) => state.count * 2,
    });

    const app = combine({ counter }).selectors({
      isReady: (_state) => true,
    });

    expect(app.selectors.counter).toBeDefined();
    expect(app.selectors.counter.double).toBeDefined();
    expect(app.selectors.isReady).toBeDefined();

    const ready = await firstValueFrom(app.selectors.isReady);
    expect(ready).toBe(true);
  });

  it('does not include inherited selectors when child has no .selectors()', async () => {
    const counter = RxCounter(); // no .selectors() called
    const toggle = RxToggle().selectors({ label: (s) => (s.on ? 'on' : 'off') });

    const app = combine({ counter, toggle }).selectors({});

    // counter key should not appear under app.selectors
    expect((app.selectors as any).counter).toBeUndefined();
    // toggle key should appear
    expect(app.selectors.toggle).toBeDefined();
  });

  it('still works as a destructurable tuple after combine().selectors()', async () => {
    const counter = RxCounter().selectors({ double: (s) => s.count * 2 });
    const app = combine({ counter }).selectors({});

    const [state$, actions] = app;
    actions.counter.increment();

    const state = await firstValueFrom(state$);
    expect(state.counter.count).toBe(1);
  });

  it('inherits selectors through nested combine() calls', async () => {
    const counter = RxCounter().selectors({ double: (s) => s.count * 2 });
    const inner = combine({ counter }).selectors({
      innerReady: (_s) => true,
    });
    const outer = combine({ inner }).selectors({});

    // outer.selectors.inner.counter.double should be accessible
    const doubleValue = await firstValueFrom(outer.selectors.inner.counter.double);
    const innerReadyValue = await firstValueFrom(outer.selectors.inner.innerReady);

    expect(doubleValue).toBe(0);
    expect(innerReadyValue).toBe(true);
  });
});
