import { build } from '../RxForm';
import { RxBuilder, combine } from '@reactables/core';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { config } from '../../Testing/config';

const RxCombined = () => {
  const rxToggle = RxBuilder({
    initialState: false,
    reducers: {
      toggle: (state) => !state,
    },
  });

  const rxForm = build(config.controls.firstName);

  return combine({
    toggle: rxToggle,
    form: rxForm,
  });
};

describe('RxForm', () => {
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

  describe('using build and combined with other Reactables', () => {
    it('should emit initial state', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, actions] = RxCombined();

        subscription = cold('-b', { b: actions.toggle.toggle }).subscribe((action) => action());

        expectObservable(state$).toBe('ab', {
          a: {
            toggle: false,
            form: {
              root: {
                value: '',
                pristineValue: '',
                config: config.controls.firstName,
                touched: false,
                validatorErrors: { required: true },
              },
            },
          },
          b: {
            toggle: true,
            form: {
              root: {
                value: '',
                pristineValue: '',
                config: config.controls.firstName,
                touched: false,
                validatorErrors: { required: true },
              },
            },
          },
        });
      });
    });
  });
});
