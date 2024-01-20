import { build } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { DoctorInfo } from '../../Testing/Models/DoctorInfo';
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

  describe('on markControlAsPristine', () => {
    const newValue: DoctorInfo = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
    };

    it('should mark a control as pristine for a FC -> FG', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues, markControlAsPristine }] = build(config, {
          providers: {
            validators: Validators,
            asyncValidators: AsyncValidators,
          },
        });

        subscription = cold('-bc', {
          b: () => updateValues({ controlRef: ['doctorInfo'], value: newValue }),
          c: () => markControlAsPristine(['doctorInfo', 'firstName']),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abc', {
          a: {},
          b: {
            root: { value: { doctorInfo: newValue }, dirty: true },
            doctorInfo: { value: newValue, dirty: true },
            'doctorInfo.firstName': { value: newValue.firstName, dirty: true },
            'doctorInfo.lastName': { value: newValue.lastName, dirty: true },
            'doctorInfo.email': {
              value: newValue.email,
              dirty: true,
            },
          },
          c: {
            'doctorInfo.firstName': {
              pristineValue: 'Dr',
              dirty: false,
            },
          },
        });
      });
    });

    it('should mark a control as pristine for a FG -> FG', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues, markControlAsPristine }] = build(config, {
          providers: {
            validators: Validators,
            asyncValidators: AsyncValidators,
          },
        });
        subscription = cold('-bc', {
          b: () => updateValues({ controlRef: ['doctorInfo'], value: newValue }),
          c: () => markControlAsPristine(['doctorInfo']),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abc', {
          a: {},
          b: {
            root: { value: { doctorInfo: newValue }, dirty: true },
            doctorInfo: { value: newValue, dirty: true },
            'doctorInfo.firstName': { value: newValue.firstName, dirty: true },
            'doctorInfo.lastName': { value: newValue.lastName, dirty: true },
            'doctorInfo.email': {
              value: newValue.email,
              dirty: true,
            },
          },
          c: {
            doctorInfo: {
              pristineValue: newValue,
              dirty: false,
            },
            'doctorInfo.firstName': {
              pristineValue: newValue.firstName,
              dirty: false,
            },
            'doctorInfo.lastName': {
              pristineValue: newValue.lastName,
              dirty: false,
            },
            'doctorInfo.email': {
              pristineValue: newValue.email,
              dirty: false,
            },
          },
        });
      });
    });
  });
});
