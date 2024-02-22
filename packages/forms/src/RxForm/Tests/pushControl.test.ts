import { build, group, array, control } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { FormControlConfig, FormArrayConfig } from '../../Models/Configs';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { required, email } from '../../Validators/Validators';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';
import { asyncConfig } from '../../Testing/asyncConfig';
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

  describe('on pushControl', () => {
    it('should add a control to a Form Array control and update ALL ancestor valid states', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const newControlValue: EmergencyContact = {
          firstName: 'Third',
          lastName: 'Guy',
          email: 'third@guy.com',
          relation: 'third wheel',
        };

        const newControlConfig = group({
          validators: ['firstNameNotSameAsLast'],
          controls: {
            firstName: {
              initialValue: newControlValue.firstName,
              validators: ['required'],
            } as FormControlConfig<string>,
            lastName: {
              initialValue: newControlValue.lastName,
              validators: ['required'],
            } as FormControlConfig<string>,
            email: {
              initialValue: newControlValue.email,
              validators: ['required', 'email'],
            } as FormControlConfig<string>,
            relation: {
              initialValue: newControlValue.relation,
              validators: ['required'],
            } as FormControlConfig<string>,
          },
        });

        const [state$, { pushControl }] = build(
          group({
            controls: {
              emergencyContacts: array({
                validators: ['arrayNotEmpty'],
                controls: [],
              }),
            },
          }),
          { providers: { validators: Validators, asyncValidators: AsyncValidators } },
        );

        subscription = cold('-b', { b: pushControl }).subscribe((pushControl) =>
          pushControl({
            controlRef: ['emergencyContacts'],
            config: newControlConfig,
          }),
        );

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              dirty: false,
              valid: false,
            },
            emergencyContacts: {
              dirty: false,
              valid: false,
            },
          },
          b: {
            root: {
              dirty: true,
              valid: true,
            },
            emergencyContacts: {
              dirty: true,
              valid: true,
            },
          },
        });
      });
    });
    it('should add a control to a Form Array control and update ancestor values', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const nonEmptyConfig = {
          ...(config.controls.emergencyContacts as FormArrayConfig),
          controls: emergencyContactConfigs,
        } as FormArrayConfig;

        const newControlValue: EmergencyContact = {
          firstName: 'Third',
          lastName: 'Guy',
          email: 'thirdguy.com', // Validate to catch invalid email
          relation: 'third wheel',
        };

        const newControlConfig = group({
          validators: ['firstNameNotSameAsLast'],
          controls: {
            firstName: {
              initialValue: newControlValue.firstName,
              validators: ['required'],
            } as FormControlConfig<string>,
            lastName: {
              initialValue: newControlValue.lastName,
              validators: ['required'],
            } as FormControlConfig<string>,
            email: {
              initialValue: newControlValue.email,
              validators: ['required', 'email'],
            } as FormControlConfig<string>,
            relation: {
              initialValue: newControlValue.relation,
              validators: ['required'],
            } as FormControlConfig<string>,
          },
        });

        const [state$, { pushControl }] = build(
          {
            ...config,
            controls: {
              ...config.controls,
              emergencyContacts: nonEmptyConfig,
            },
          },
          { providers: { validators: Validators, asyncValidators: AsyncValidators } },
        );

        subscription = cold('-b', { b: pushControl }).subscribe((pushControl) =>
          pushControl({
            controlRef: ['emergencyContacts'],
            config: newControlConfig,
          }),
        );

        expectObservable(state$).toBe('ab', {
          a: {},
          b: {
            root: {
              dirty: true,
            },
            emergencyContacts: {
              dirty: true,
            },
            'emergencyContacts.2': {
              value: newControlValue,
              dirty: false,
            },
            'emergencyContacts.2.firstName': {},
            'emergencyContacts.2.lastName': {},
            'emergencyContacts.2.relation': {},
            'emergencyContacts.2.email': {},
          },
        });
      });
    });

    it('should emit async validation for an added array control and all ancestors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { pushControl }] = build(asyncConfig, {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

        subscription = cold('-b', {
          b: () =>
            pushControl({
              controlRef: ['emergencyContacts'],
              config: group({
                validators: ['firstNameNotSameAsLast'],
                asyncValidators: ['uniqueFirstAndLastName'],
                controls: {
                  firstName: control(['Barney', 'required']),
                  lastName: control(['Gumble', 'required']),
                  email: control([
                    'barney@gumble.com',
                    ['required', 'email'],
                    ['uniqueEmail', 'blacklistedEmail'],
                  ]),
                  relation: control(['astronaut friend', 'required']),
                },
              }),
            }),
        }).subscribe((action) => action());

        expectObservable(state$).toBe('a(bcdef)  243ms g 49ms h 49ms i 49ms (jk) ', {
          a: {},
          b: {
            root: {
              value: {
                emergencyContacts: [
                  {
                    firstName: 'Barney',
                    lastName: 'Gumble',
                    email: 'barney@gumble.com',
                    relation: 'astronaut friend',
                  },
                ],
              },
              dirty: true,
            },
            emergencyContacts: {
              value: [
                {
                  firstName: 'Barney',
                  lastName: 'Gumble',
                  email: 'barney@gumble.com',
                  relation: 'astronaut friend',
                },
              ],
              dirty: true,
            },
            'emergencyContacts.0': {
              value: {
                firstName: 'Barney',
                lastName: 'Gumble',
                email: 'barney@gumble.com',
                relation: 'astronaut friend',
              },
              dirty: false,
            },
          },
          c: {
            root: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          d: {
            emergencyContacts: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          e: {
            'emergencyContacts.0': { pending: true, asyncValidateInProgress: { 0: true } },
          },
          f: {
            'emergencyContacts.0.email': {
              pending: true,
              asyncValidateInProgress: { 0: true, 1: true },
            },
          },
          g: {
            'emergencyContacts.0.email': {
              pending: true,
              asyncValidateInProgress: { 0: false, 1: true },
              asyncValidatorErrors: { uniqueEmail: true },
            },
          },
          h: {
            'emergencyContacts.0.email': {
              pending: false,
              asyncValidateInProgress: { 0: false, 1: false },
              asyncValidatorErrors: { uniqueEmail: true, blacklistedEmail: true },
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
