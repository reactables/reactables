import { build } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { config } from '../../Testing/config';
import * as Validators from '../../Testing/Validators';
import * as AsyncValidators from '../../Testing/AsyncValidators';

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

  describe('on markControlAsTouched and markControlAsUntouched', () => {
    it('should mark control and all anscestors as touched', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { markControlAsTouched, markControlAsUntouched }] = build(config, {
          providers: {
            validators: Validators,
            asyncValidators: AsyncValidators,
          },
        });
        subscription = cold('-bc', {
          b: () =>
            markControlAsTouched({
              controlRef: ['doctorInfo'],
              //TODO: update this test to show that marks children as well if this flag is true
              markAll: true,
            }),
          c: () => markControlAsUntouched(['doctorInfo']),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abc', {
          a: {},
          b: {
            root: { touched: true },
            doctorInfo: { touched: true },
            'doctorInfo.firstName': { touched: true },
          },
          c: {
            root: { touched: false },
            doctorInfo: { touched: false },
            'doctorInfo.firstName': { touched: false },
          },
        });
      });
    });
  });
});
