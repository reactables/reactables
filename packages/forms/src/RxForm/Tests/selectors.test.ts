import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { build, load } from '../RxForm';
import { combine, RxBuilder } from '@reactables/core';
import { config } from '../../Testing/config';
import { initialState } from '../../Testing/Models/initialState';
import * as Validators from '../../Testing/Validators';

// A combined reactable used across the combine() describe block.
// toggle is a primitive boolean reactable; form is a single-field firstName form.
// Both have selectors defined before being combined.
const RxCombined = () => {
  const toggle = RxBuilder({
    initialState: false,
    reducers: { toggle: (state: boolean) => !state },
  }).selectors({
    isOn: (state) => state === true,
  });

  const form = build(config.controls.firstName).selectors({
    isValid: (state) => state.root.valid === true,
    getFieldPrefixed: (state, prefix: string) => `${prefix}:${state.root.value as string}`,
  });

  return combine({ toggle, form });
};

// ─────────────────────────────────────────────────────────────────────────────
// build()
// ─────────────────────────────────────────────────────────────────────────────

describe('selectors on RxForm.build()', () => {
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

  it('exposes selector callables on .select after calling .selectors()', () => {
    const form = build(config.controls.firstName).selectors({
      isValid: (state) => state.root.valid === true,
    });

    expect(form.select.isValid).toBeDefined();
    expect(form.select.isValid).toBeInstanceOf(Function);
  });

  it('emits initial and updated values via no-arg selector', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = build(config.controls.firstName).selectors({
        isValid: (state) => state.root.valid === true,
      });
      const [, actions] = form;

      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: [], value: 'Jane' }),
      }).subscribe((action) => action());

      expectObservable(form.select.isValid()).toBe('ab', {
        a: false, // required validator fails on empty initial value
        b: true,  // passes once a value is set
      });
    });
  });

  it('passes a single extra argument to read a specific control value', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = build(config, { providers: { validators: Validators } }).selectors({
        getControlValue: (state, controlRef: string) => state[controlRef]?.value as string,
      });
      const [, actions] = form;

      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: ['firstName'], value: 'Jane' }),
      }).subscribe((action) => action());

      expectObservable(form.select.getControlValue('firstName')).toBe('ab', {
        a: '',
        b: 'Jane',
      });
    });
  });

  it('passes multiple extra arguments to check a specific error on a specific control', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = build(config, { providers: { validators: Validators } }).selectors({
        hasError: (state, controlRef: string, errorKey: string) =>
          !!(state[controlRef]?.errors?.[errorKey]),
      });
      const [, actions] = form;

      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: ['firstName'], value: 'Jane' }),
      }).subscribe((action) => action());

      expectObservable(form.select.hasError('firstName', 'required')).toBe('ab', {
        a: true,  // required error present on empty initial value
        b: false, // clears once a value is set
      });
    });
  });

  it('does not re-emit when an unrelated control changes (memoization)', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = build(config, { providers: { validators: Validators } }).selectors({
        isFirstNameValid: (state) => state['firstName']?.valid === true,
      });
      const [, actions] = form;

      subscription = cold('-b-c', {
        b: () => actions.updateValues({ controlRef: ['firstName'], value: 'Jane' }),
        c: () => actions.updateValues({ controlRef: ['lastName'], value: 'Doe' }),
      }).subscribe((action) => action());

      expectObservable(form.select.isFirstNameValid()).toBe('ab', {
        a: false, // firstName invalid initially
        b: true,  // firstName valid after update
        // no third emission — lastName change does not affect firstName validity
      });
    });
  });

  it('different argument values produce independent observables', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = build(config, { providers: { validators: Validators } }).selectors({
        getControlValue: (state, controlRef: string) => state[controlRef]?.value as string,
      });
      const [, actions] = form;

      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: ['firstName'], value: 'Jane' }),
      }).subscribe((action) => action());

      // firstName changes, lastName stays the same — two independent observable streams
      expectObservable(form.select.getControlValue('firstName')).toBe('ab', { a: '', b: 'Jane' });
      expectObservable(form.select.getControlValue('lastName')).toBe('a-', { a: '' });
    });
  });

  it('still works as a destructurable tuple after .selectors()', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = build(config.controls.firstName).selectors({
        isValid: (state) => state.root.valid === true,
      });
      const [state$, actions] = form;

      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: [], value: 'Jane' }),
      }).subscribe((action) => action());

      expectObservable(state$).toBe('ab', {
        a: { root: { value: '', valid: false } },
        b: { root: { value: 'Jane', valid: true } },
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// load()
// ─────────────────────────────────────────────────────────────────────────────

describe('selectors on RxForm.load()', () => {
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

  it('emits initial selector value from loaded state and suppresses unchanged re-emissions', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = load(initialState, { providers: { validators: Validators } }).selectors({
        isValid: (state) => state.root.valid === true,
      });
      const [, actions] = form;

      // Updating only firstName leaves root still invalid (lastName, email, phone
      // still fail their validators), so the selector value does not change.
      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: ['firstName'], value: 'Homer' }),
      }).subscribe((action) => action());

      expectObservable(form.select.isValid()).toBe('a-', {
        a: false, // root has firstNameNotSameAsLast + child errors in initialState
        // no second emission — root validity does not change after partial update
      });
    });
  });

  it('passes a single extra argument to read a control value from loaded state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = load(initialState, { providers: { validators: Validators } }).selectors({
        getControlValue: (state, controlRef: string) => state[controlRef]?.value as unknown,
      });
      const [, actions] = form;

      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: ['firstName'], value: 'Homer' }),
      }).subscribe((action) => action());

      expectObservable(form.select.getControlValue('firstName')).toBe('ab', {
        a: '',       // firstName empty in loaded initialState
        b: 'Homer',  // updated value
      });
    });
  });

  it('passes multiple extra arguments to check errors on loaded state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const form = load(initialState, { providers: { validators: Validators } }).selectors({
        hasError: (state, controlRef: string, errorKey: string) =>
          !!(state[controlRef]?.errors?.[errorKey]),
      });
      const [, actions] = form;

      subscription = cold('-b', {
        b: () => actions.updateValues({ controlRef: ['firstName'], value: 'Homer' }),
      }).subscribe((action) => action());

      // firstName starts empty so required error is present; clears after update
      expectObservable(form.select.hasError('firstName', 'required')).toBe('ab', {
        a: true,
        b: false,
      });

      // root-level firstNameNotSameAsLast: firstName '' === lastName '' initially;
      // after setting firstName to 'Homer' the names differ so the error clears
      expectObservable(form.select.hasError('root', 'firstNameNotSameAsLast')).toBe('ab', {
        a: true,
        b: false,
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// combine() with RxForm
// ─────────────────────────────────────────────────────────────────────────────

describe('selectors on combine() with RxForm', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toMatchObject(expected);
    });
  });

  afterEach(() => {
    subscription?.unsubscribe();
  });

  it('inherits form selectors nested under their key', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const app = RxCombined().selectors({});
      const [, actions] = app;

      subscription = cold('-b', {
        b: () => actions.form.updateValues({ controlRef: [], value: 'Jane' }),
      }).subscribe((action) => action());

      expectObservable(app.select.form.isValid()).toBe('ab', { a: false, b: true });
    });
  });

  it('inherits primitive reactable selectors nested under their key', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const app = RxCombined().selectors({});
      const [, actions] = app;

      subscription = cold('-b', {
        b: () => actions.toggle.toggle(),
      }).subscribe((action) => action());

      expectObservable(app.select.toggle.isOn()).toBe('ab', { a: false, b: true });
    });
  });

  it('exposes a combined-level no-arg selector over form and toggle state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const app = RxCombined().selectors({
        isFormValidAndToggleOn: (state) =>
          state.form.root.valid === true && state.toggle === true,
      });
      const [, actions] = app;

      subscription = cold('-b-c', {
        b: () => actions.form.updateValues({ controlRef: [], value: 'Jane' }),
        c: () => actions.toggle.toggle(),
      }).subscribe((action) => action());

      // At b: form becomes valid but toggle is still off → still false.
      // distinctUntilChanged suppresses that emission.
      // At c: toggle turns on → both true.
      expectObservable(app.select.isFormValidAndToggleOn()).toBe('a--b', {
        a: false,
        b: true,
      });
    });
  });

  it('passes a single extra argument through an inherited form selector', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const app = RxCombined().selectors({});
      const [, actions] = app;

      subscription = cold('-b', {
        b: () => actions.form.updateValues({ controlRef: [], value: 'Jane' }),
      }).subscribe((action) => action());

      expectObservable(app.select.form.getFieldPrefixed('value')).toBe('ab', {
        a: 'value:',
        b: 'value:Jane',
      });
    });
  });

  it('exposes a combined-level selector with multiple extra arguments', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const app = RxCombined().selectors({
        // Returns a formatted summary string, gated on toggle being on
        summary: (state, label: string, showToggle: boolean) =>
          `${label}:${state.form.root.value as string}` +
          (showToggle ? `|on:${state.toggle}` : ''),
      });
      const [, actions] = app;

      subscription = cold('-b', {
        b: () => actions.form.updateValues({ controlRef: [], value: 'Jane' }),
      }).subscribe((action) => action());

      expectObservable(app.select.summary('name', true)).toBe('ab', {
        a: 'name:|on:false',
        b: 'name:Jane|on:false',
      });

      expectObservable(app.select.summary('name', false)).toBe('ab', {
        a: 'name:',
        b: 'name:Jane',
      });
    });
  });
});
