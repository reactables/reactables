import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { initialState } from '../../Testing/Models/initialState';
import { load } from '../RxForm';
import * as Validators from '../../Testing/Validators';

describe('load', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  afterEach(() => {
    subscription?.unsubscribe();
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
