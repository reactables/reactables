import { Action } from '@reactables/core';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { initialState } from '../../Testing/Models/initialState';
import { load, FormReducers } from '../RxForm';
import { BaseFormState } from '../../Models/Controls';
import * as Validators from '../../Testing/Validators';

describe('load', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  afterEach(() => {
    subscription?.unsubscribe();
  });

  it('should expose actionMap with built-in action observables', () => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toMatchObject(expected);
    });

    testScheduler.run(({ expectObservable, cold }) => {
      const [, actions, actions$] = load(initialState, { providers: { validators: Validators } });

      subscription = cold('-a-b', {
        a: () => actions.updateValues({ controlRef: ['firstName'], value: 'Homer' }),
        b: () => actions.markControlAsTouched({ controlRef: ['firstName'] }),
      }).subscribe((action) => action());

      expectObservable(actions$.actionMap.updateValues).toBe('-a', {
        a: { type: 'updateValues', payload: { controlRef: ['firstName'], value: 'Homer' } },
      });

      expectObservable(actions$.actionMap.markControlAsTouched).toBe('---b', {
        b: { type: 'markControlAsTouched', payload: { controlRef: ['firstName'] } },
      });
    });
  });

  it('should expose actionMap with typed observables for custom reducers', () => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toMatchObject(expected);
    });

    const customReducers = {
      resetField: (
        { updateValues }: FormReducers,
        state: BaseFormState<any>,
        { payload }: Action<string>,
      ) => updateValues(state, { controlRef: [payload], value: '' }),
    };

    testScheduler.run(({ expectObservable, cold }) => {
      const [, actions, actions$] = load<any, typeof customReducers>(initialState, {
        providers: { validators: Validators },
        reducers: customReducers,
      });

      subscription = cold('-a', {
        a: () => actions.resetField('firstName'),
      }).subscribe((action) => action());

      expectObservable(actions$.actionMap.resetField).toBe('-a', {
        a: { type: 'resetField', payload: 'firstName' },
      });
    });
  });

  it('should load the state', () => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
    testScheduler.run(({ expectObservable, cold }) => {
      const [state$] = load(initialState, { providers: { validators: Validators } });

      subscription = cold('-').subscribe();

      expectObservable(state$).toBe('a', {
        a: initialState,
      });
    });
  });

  it('should load the state and response to update values', () => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toMatchObject(expected);
    });

    testScheduler.run(({ expectObservable, cold }) => {
      const [state$, { updateValues }] = load(initialState, {
        providers: { validators: Validators },
      });

      const newValue = {
        firstName: 'Homer Changed',
        lastName: 'Simpson Changed',
        email: 'homer@c.com',
        relation: 'friend',
      };

      subscription = cold('-b', {
        b: () =>
          updateValues({
            controlRef: ['emergencyContacts', 0],
            value: newValue,
          }),
      }).subscribe((action) => {
        action();
      });

      expectObservable(state$).toBe('ab', {
        a: initialState,
        b: {
          root: {
            value: {
              emergencyContacts: [newValue, initialState.root.value.emergencyContacts[1]],
            },
          },
          'emergencyContacts.0': {
            value: newValue,
          },
        },
      });
    });
  });
});
