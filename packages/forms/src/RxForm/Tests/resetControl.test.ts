import { build, group } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { config } from '../../Testing/config';
import { asyncConfig, asyncEmergencyContactConfigs } from '../../Testing/asyncConfig';
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

  describe('on resetControl', () => {
    it('should reset a Form Control, and update ancestor values and dirty status', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues, resetControl }] = build(config, {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

        subscription = cold('-bc', {
          b: () => updateValues({ controlRef: ['firstName'], value: 'Changed first name' }),
          c: () => resetControl([]),
        } as { [key: string]: () => void }).subscribe((action) => {
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
        const [state$, { updateValues, resetControl }] = build(config, {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

        subscription = cold('-bc', {
          b: () => updateValues({ controlRef: ['doctorInfo'], value: newValue }),
          c: () => resetControl([]),
        } as { [key: string]: () => void }).subscribe((action) => {
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

    it('should not emit async validation when resetting a control and value has not changed', () => {
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
          {
            providers: { validators: Validators, asyncValidators: AsyncValidators },
          },
        );

        subscription = cold('-b', { b: resetControl }).subscribe((resetControl) =>
          resetControl(['emergencyContacts', 0]),
        );

        expectObservable(state$).toBe('ab', {
          a: {},
          b: {},
        });
      });
    });

    it('should emit async validation when resetting a control and value changed', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues, resetControl }] = build(
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
          {
            providers: { validators: Validators, asyncValidators: AsyncValidators },
          },
        );

        subscription = cold('-b 500ms c', {
          b: () => {
            updateValues({
              controlRef: ['emergencyContacts', 0],
              value: {
                firstName: 'Sideshow',
                lastName: 'Bob',
                email: 'bob@sideshow.com',
                relation: 'bad friend',
              },
            });
          },
          c: () => {
            resetControl(['emergencyContacts', 0]);
          },
        }).subscribe((action) => action());

        expectObservable(state$).toBe(
          'a(zyxwvbcdef) 238ms g 49ms h 49ms i 49ms (jk) 97ms (ABCDElmnop) 238ms q 49ms r 49ms s 49ms (tu)',
          {
            a: {},
            z: {},
            y: {},
            x: {},
            w: {},
            v: {},
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
            A: {},
            B: {},
            C: {},
            D: {},
            E: {},
            l: {},
            m: {
              root: { pending: true, asyncValidateInProgress: { 0: true } },
            },
            n: { emergencyContacts: { pending: true, asyncValidateInProgress: { 0: true } } },
            o: { 'emergencyContacts.0': { pending: true, asyncValidateInProgress: { 0: true } } },
            p: {
              'emergencyContacts.0.email': {
                pending: true,
                asyncValidateInProgress: { 0: true, 1: true },
              },
            },
            q: {
              root: { pending: true },
              emergencyContacts: { pending: true },
              'emergencyContacts.0': { pending: true },
              'emergencyContacts.0.email': {
                pending: true,
                asyncValidateInProgress: { 0: false, 1: true },
                asyncValidatorErrors: { uniqueEmail: true },
              },
            },
            r: {
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
            s: {
              emergencyContacts: {
                pending: true,
                asyncValidateInProgress: { 0: false },
                asyncValidatorErrors: { arrayLengthError: true },
              },
            },
            t: {
              root: {
                pending: true,
                asyncValidateInProgress: { 0: false },
                asyncValidatorErrors: { uniqueFirstAndLastName: true },
              },
            },
            u: {
              root: { pending: false },
              'emergencyContacts.0': {
                pending: false,
                asyncValidateInProgress: { 0: false },
                asyncValidatorErrors: { uniqueFirstAndLastName: true },
              },
            },
          },
        );
      });
    });
  });
});
