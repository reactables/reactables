import { build, group } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { config } from '../../Testing/config';
import { asyncConfig, asyncEmergencyContactConfigs } from '../../Testing/asyncConfig';

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

  describe('on resetControl', () => {
    it('should reset a Form Control, and update ancestor values and dirty status', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues, resetControl }] = build(config);

        subscription = cold('-bc', {
          b: () => updateValues({ controlRef: ['firstName'], value: 'Changed first name' }),
          c: () => resetControl([]),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abc', {
          a: {},
          b: {
            root: { value: { firstName: 'Changed first name' }, dirty: true },
          },
          c: {
            root: { value: { firstName: '' }, dirty: false },
          },
        });
      });
    });

    it('should reset a Form Group control, all of its descendants and update ancestor values and dirty status', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const newValue = {
          firstName: 'Dr',
          lastName: 'Ho',
          email: 'dr@ho.com',
        };
        const [state$, { updateValues, resetControl }] = build(config);

        subscription = cold('-bc', {
          b: () => updateValues({ controlRef: ['doctorInfo'], value: newValue }),
          c: () => resetControl([]),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abc', {
          a: {},
          b: {
            root: { value: { doctorInfo: newValue }, dirty: true },
            doctorInfo: { value: newValue, dirty: true },
          },
          c: {
            root: {
              value: {
                doctorInfo: {
                  firstName: '',
                  lastName: '',
                  email: '',
                },
              },
              dirty: false,
            },
            doctorInfo: {
              value: {
                firstName: '',
                lastName: '',
                email: '',
              },
              dirty: false,
            },
          },
        });
      });
    });

    it('should emit async validation when resetting a control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { resetControl }] = build(
          group({
            ...asyncConfig,
            controls: {
              ...asyncConfig.controls,
              emergencyContacts: {
                ...asyncConfig.controls.emergencyContacts,
                controls: asyncEmergencyContactConfigs,
              },
            },
          }),
        );

        subscription = cold('-b', { b: resetControl }).subscribe((resetControl) =>
          resetControl(['emergencyContacts', 0]),
        );

        expectObservable(state$).toBe('a(bcdef) 243ms g 49ms h 49ms i 49ms (jk)', {
          a: {},
          b: {},
          c: {
            root: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          d: { emergencyContacts: { pending: true, asyncValidateInProgress: { 0: true } } },
          e: { 'emergencyContacts.0': { pending: true, asyncValidateInProgress: { 0: true } } },
          f: {
            'emergencyContacts.0.email': {
              pending: true,
              asyncValidateInProgress: { 0: true, 1: true },
            },
          },
          g: {
            root: { pending: true },
            emergencyContacts: { pending: true },
            'emergencyContacts.0': { pending: true },
            'emergencyContacts.0.email': {
              pending: true,
              asyncValidateInProgress: { 0: false, 1: true },
              asyncValidatorErrors: { uniqueEmail: true },
            },
          },
          h: {
            root: { pending: true },
            emergencyContacts: { pending: true },
            'emergencyContacts.0': { pending: true },
            'emergencyContacts.0.email': {
              pending: false,
              asyncValidateInProgress: { 0: false, 1: false },
              asyncValidatorErrors: {
                uniqueEmail: true,
                blacklistedEmail: true,
              },
            },
          },
          i: {
            emergencyContacts: {
              pending: true,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { arrayLengthError: true },
            },
          },
          j: {
            root: {
              pending: true,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { uniqueFirstAndLastName: true },
            },
          },
          k: {
            root: { pending: false },
            'emergencyContacts.0': {
              pending: false,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { uniqueFirstAndLastName: true },
            },
          },
        });
      });
    });
  });
});
