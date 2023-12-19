import { build, group, array, control } from './RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { FormGroupConfig, FormControlConfig, FormArrayConfig } from '../Models/Configs';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';
import { config, firstNameNotSameAsLast, emergencyContactConfigs } from '../Testing/config';
import { required, email } from '../Validators/Validators';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import {
  uniqueEmail,
  blacklistedDoctorType,
  uniqueFirstAndLastName,
  blacklistedEmail,
} from '../Testing/AsyncValidators';
import { asyncConfig, asyncEmergencyContactConfigs } from '../Testing/asyncConfig';

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

  describe('on initialization', () => {
    it('should build the control state for for type field', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const { state$ } = build(config.controls.firstName);

        subscription = cold('-').subscribe();

        expectObservable(state$).toBe('a', {
          a: {
            root: {
              value: '',
              pristineValue: '',
              config: config.controls.firstName,
              touched: false,
              validatorErrors: { required: true },
            },
          },
        });
      });
    });

    it('should build the control state for type group with empty value', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const { state$ } = build(config.controls.doctorInfo);

        subscription = cold('-').subscribe();
        const initialValue = {
          firstName: '',
          lastName: '',
          email: '',
        };

        expectObservable(state$).toBe('a', {
          a: {
            root: {
              value: initialValue,
              pristineValue: initialValue,
              config: config.controls.doctorInfo,
              touched: false,
              validatorErrors: {},
            },
            firstName: {
              value: initialValue.firstName,
              pristineValue: initialValue.firstName,
              config: (config.controls.doctorInfo as FormGroupConfig).controls.firstName,
              touched: false,
              validatorErrors: { required: true },
            },
            lastName: {
              value: initialValue.lastName,
              pristineValue: initialValue.lastName,
              config: (config.controls.doctorInfo as FormGroupConfig).controls.lastName,
              touched: false,
              validatorErrors: { required: true },
            },
            email: {
              value: initialValue.email,
              pristineValue: initialValue.email,
              config: (config.controls.doctorInfo as FormGroupConfig).controls.email,
              touched: false,
              validatorErrors: { required: true },
            },
          },
        });
      });
    });

    it('should build the control state for type group with non-empty value', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const initialValue: DoctorInfo = {
          firstName: 'Dr',
          lastName: 'Bob',
          email: 'DrBobbob.com',
        };

        const testConfig: FormGroupConfig = {
          validators: [firstNameNotSameAsLast],
          controls: {
            firstName: {
              initialValue: initialValue.firstName,
              validators: [required],
            } as FormControlConfig<string>,
            lastName: {
              initialValue: initialValue.lastName,
              validators: [required],
            } as FormControlConfig<string>,
            email: {
              initialValue: initialValue.email,
              validators: [required, email],
            } as FormControlConfig<string>,
          },
        };
        const { state$ } = build(testConfig);

        subscription = cold('-').subscribe();

        expectObservable(state$).toBe('a', {
          a: {
            root: {
              value: initialValue,
              pristineValue: initialValue,
              config: testConfig,
              touched: false,
              validatorErrors: {},
            },
            firstName: {
              value: initialValue.firstName,
              pristineValue: initialValue.firstName,
              config: testConfig.controls.firstName,
              touched: false,
              validatorErrors: { required: false },
            },
            lastName: {
              value: initialValue.lastName,
              pristineValue: initialValue.lastName,
              config: testConfig.controls.lastName,
              touched: false,
              validatorErrors: { required: false },
            },
            email: {
              value: initialValue.email,
              pristineValue: initialValue.email,
              config: testConfig.controls.email,
              touched: false,
              validatorErrors: { required: false, email: true },
            },
          },
        });
      });
    });

    it('should build the control state for for type array with empty initial value', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const { state$ } = build(config.controls.emergencyContacts);

        subscription = cold('-').subscribe();

        expectObservable(state$).toBe('a', {
          a: {
            root: {
              value: [],
              controlRef: [],
              pristineValue: [],
              config: config.controls.emergencyContacts,
              touched: false,
              validatorErrors: { required: true },
            },
          },
        });
      });
    });

    it('should build the entire form state with non-empty array value form group initial values', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const nonEmptyConfig = {
          ...(config.controls.emergencyContacts as FormArrayConfig),
          controls: emergencyContactConfigs,
        } as FormArrayConfig;

        const mainConfig = {
          ...config,
          controls: {
            ...config.controls,
            emergencyContacts: nonEmptyConfig,
          },
        };
        const { state$ } = build(mainConfig);

        subscription = cold('-').subscribe();

        const expectedFormValue = {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          emergencyContacts: [
            {
              firstName: 'Homer',
              lastName: 'Simpson',
              email: 'homer@homer.com',
              relation: 'friend',
            },
            {
              firstName: 'moe',
              lastName: 'syzlak',
              email: 'moe@moe.com',
              relation: 'friend',
            },
          ],
          doctorInfo: {
            firstName: '',
            lastName: '',
            email: '',
          },
        };

        expectObservable(state$).toBe('a', {
          a: {
            root: {
              value: expectedFormValue,
              controlRef: [],
              pristineValue: expectedFormValue,
              config: mainConfig,
              touched: false,
              validatorErrors: {},
            },
            emergencyContacts: {
              value: expectedFormValue.emergencyContacts,
              controlRef: ['emergencyContacts'],
              pristineValue: expectedFormValue.emergencyContacts,
              config: mainConfig.controls['emergencyContacts'],
              touched: false,
              validatorErrors: {},
            },
            'emergencyContacts.0': {
              value: expectedFormValue.emergencyContacts[0],
              controlRef: ['emergencyContacts', 0],
              pristineValue: expectedFormValue.emergencyContacts[0],
              config: mainConfig.controls['emergencyContacts'].controls[0],
              touched: false,
              validatorErrors: {},
            },
            'emergencyContacts.1': {
              value: expectedFormValue.emergencyContacts[1],
              controlRef: ['emergencyContacts', 1],
              pristineValue: expectedFormValue.emergencyContacts[1],
              config: mainConfig.controls['emergencyContacts'].controls[1],
              touched: false,
              validatorErrors: {},
            },
          },
        });
      });
    });
  });

  describe('on pushControl', () => {
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
          validators: [firstNameNotSameAsLast],
          controls: {
            firstName: {
              initialValue: newControlValue.firstName,
              validators: [required],
            } as FormControlConfig<string>,
            lastName: {
              initialValue: newControlValue.lastName,
              validators: [required],
            } as FormControlConfig<string>,
            email: {
              initialValue: newControlValue.email,
              validators: [required, email],
            } as FormControlConfig<string>,
            relation: {
              initialValue: newControlValue.relation,
              validators: [required],
            } as FormControlConfig<string>,
          },
        });

        const {
          state$,
          actions: { pushControl },
        } = build({
          ...config,
          controls: {
            ...config.controls,
            emergencyContacts: nonEmptyConfig,
          },
        });

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
        const {
          state$,
          actions: { pushControl },
        } = build(asyncConfig);

        subscription = cold('-b', {
          b: () =>
            pushControl({
              controlRef: ['emergencyContacts'],
              config: group({
                validators: [firstNameNotSameAsLast],
                asyncValidators: [uniqueFirstAndLastName],
                controls: {
                  firstName: control(['Barney', required]),
                  lastName: control(['Gumble', required]),
                  email: control([
                    'barney@gumble.com',
                    [required, email],
                    [uniqueEmail, blacklistedEmail],
                  ]),
                  relation: control(['astronaut friend', required]),
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

  describe('on addControl', () => {
    it('should add a control to a Form Group control and update ancestor values', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { addControl },
        } = build(config);

        subscription = cold('-b', { b: addControl }).subscribe((addControl) =>
          addControl({
            controlRef: ['doctorInfo', 'type'],
            config: control({
              initialValue: 'proctologist',
            }),
          }),
        );

        expectObservable(state$).toBe('ab', {
          a: {},
          b: {
            root: {
              value: {
                doctorInfo: {
                  type: 'proctologist',
                },
              },
              dirty: true,
            },
            doctorInfo: {
              dirty: true,
              value: { type: 'proctologist' },
            },
            'doctorInfo.type': {
              value: 'proctologist',
              dirty: false,
            },
          },
        });
      });
    });

    it('should emit async validation for an added group control and all ancestors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { addControl },
        } = build(asyncConfig);

        subscription = cold('-b', {
          b: () =>
            addControl({
              controlRef: ['doctorInfo', 'type'],
              config: {
                initialValue: 'proctologist',
                validators: [required],
                asyncValidators: [blacklistedDoctorType],
              },
            }),
        }).subscribe((action) => action());

        expectObservable(state$).toBe('a(bcde) 394ms (fg) 96ms h', {
          a: {},
          b: {
            root: {
              value: {
                doctorInfo: {
                  type: 'proctologist',
                },
              },
              dirty: true,
            },
            doctorInfo: {
              value: { type: 'proctologist' },
              dirty: true,
            },
            'doctorInfo.type': { value: 'proctologist', dirty: false },
          },
          c: {
            root: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          d: { doctorInfo: { pending: true, asyncValidateInProgress: { 0: true } } },
          e: { 'doctorInfo.type': { pending: true, asyncValidateInProgress: { 0: true } } },
          f: {
            root: {
              pending: true,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          g: {
            doctorInfo: {
              pending: true,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          h: {
            root: { pending: false },
            doctorInfo: { pending: false },
            'doctorInfo.type': {
              pending: false,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { blacklistedDoctorType: true },
            },
          },
        });
      });
    });
  });

  describe('on removeControl', () => {
    it('should remove a formGroup control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { removeControl },
        } = build({
          controls: {
            firstName: control({ initialValue: '' }),
            lastName: control({ initialValue: '' }),
            emergencyContact: group({
              controls: {
                nextOfKin: control({ initialValue: '' }),
              },
            }),
          },
        });

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContact', 'nextOfKin']),
        );

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              value: {
                firstName: '',
                lastName: '',
                emergencyContact: {
                  nextOfKin: '',
                },
              },
              dirty: false,
            },
            emergencyContact: {
              value: {
                nextOfKin: '',
              },
              dirty: false,
            },
            'emergencyContact.nextOfKin': {
              value: '',
              dirty: false,
            },
          },
          b: {
            root: {
              value: {
                firstName: '',
                lastName: '',
                emergencyContact: {},
              },
              dirty: true,
            },
            emergencyContact: {
              value: {},
              dirty: true,
            },
          },
        });
      });
    });

    it('should remove a formGroup control and its descendants', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { removeControl },
        } = build({
          controls: {
            firstName: control({ initialValue: '' }),
            lastName: control({ initialValue: '' }),
            emergencyContact: group({
              controls: {
                nextOfKin: control({ initialValue: '' }),
              },
            }),
          },
        });

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContact']),
        );

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              value: {
                firstName: '',
                lastName: '',
                emergencyContact: {
                  nextOfKin: '',
                },
              },
              dirty: false,
            },
            emergencyContact: {
              value: {
                nextOfKin: '',
              },
              dirty: false,
            },
            'emergencyContact.nextOfKin': {
              value: '',
              dirty: false,
            },
          },
          b: {
            root: {
              value: {
                firstName: '',
                lastName: '',
              },
              dirty: true,
            },
          },
        });
      });
    });

    it('should remove an array control item', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { removeControl },
        } = build(
          group({
            controls: {
              emergencyContacts: array({
                controls: [
                  control({ initialValue: 'Homer' }),
                  control({ initialValue: 'Moe' }),
                  control({ initialValue: 'Barney' }),
                ],
              }),
            },
          }),
        );

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContacts', 1]),
        );

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              value: {
                emergencyContacts: ['Homer', 'Moe', 'Barney'],
              },
              dirty: false,
            },
            emergencyContacts: { value: ['Homer', 'Moe', 'Barney'], dirty: false },
            'emergencyContacts.0': { value: 'Homer', dirty: false },
            'emergencyContacts.1': { value: 'Moe', dirty: false },
            'emergencyContacts.2': { value: 'Barney', dirty: false },
          },
          b: {
            root: {
              value: {
                emergencyContacts: ['Homer', 'Barney'],
              },
              dirty: true,
            },
            emergencyContacts: { value: ['Homer', 'Barney'], dirty: true },
            'emergencyContacts.0': { value: 'Homer', dirty: false },
            'emergencyContacts.1': { value: 'Barney', dirty: false },
          },
        });
      });
    });

    it('should emit async validation when removing a control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { removeControl },
        } = build(
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

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContacts', 0]),
        );

        expectObservable(state$).toBe('a(bcd) 345ms e 49ms f', {
          a: {},
          b: {},
          c: {
            root: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          d: {
            emergencyContacts: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          e: {
            root: {
              pending: true,
              asyncValidateInProgress: { 0: true },
            },
            emergencyContacts: {
              pending: false,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { arrayLengthError: true },
            },
          },
          f: {
            root: {
              pending: false,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { uniqueFirstAndLastName: true },
            },
          },
        });
      });
    });
  });

  describe('on resetControl', () => {
    it('should reset a Form Control, and update ancestor values and dirty status', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { updateValues, resetControl },
        } = build(config);

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
        const {
          state$,
          actions: { updateValues, resetControl },
        } = build(config);

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
        const {
          state$,
          actions: { resetControl },
        } = build(
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

  describe('on updateValues', () => {
    it('should update value and dirty status for control and its descendants/ancestors for FormGroup control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { updateValues },
        } = build(config);

        const newValue = {
          firstName: 'Dr',
          lastName: 'Ho',
          email: 'drhoe.com', // Validate to catch invalid email
        };

        subscription = cold('-b', {
          b: () => updateValues({ controlRef: ['doctorInfo'], value: newValue }),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('ab', {
          a: {},
          b: {
            root: { value: { doctorInfo: newValue }, dirty: true },
            doctorInfo: { value: newValue, dirty: true },
            'doctorInfo.firstName': { value: newValue.firstName, dirty: true },
            'doctorInfo.lastName': { value: newValue.lastName, dirty: true },
            'doctorInfo.email': {
              value: newValue.email,
              dirty: true,
              validatorErrors: { email: true },
              errors: { email: true },
            },
          },
        });
      });
    });

    it('should update value and dirty status for control and its descendants/ancestors for a FormArray control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const nonEmptyConfig = {
          ...(config.controls.emergencyContacts as FormArrayConfig),
          controls: emergencyContactConfigs,
        } as FormArrayConfig;

        const {
          state$,
          actions: { updateValues },
        } = build({
          ...config,
          controls: {
            ...config.controls,
            emergencyContacts: nonEmptyConfig,
          },
        });

        const value = 'Moe first name changed';
        subscription = cold('-b', {
          b: () =>
            updateValues({
              controlRef: ['emergencyContacts', 1, 'firstName'],
              value,
            }),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('ab', {
          a: {},
          b: {
            root: {
              value: { emergencyContacts: [{}, { firstName: value }] },
              dirty: true,
            },
            emergencyContacts: { value: [{}, { firstName: value }], dirty: true },
            'emergencyContacts.1': { value: { firstName: value }, dirty: true },
            'emergencyContacts.1.firstName': { value, dirty: true },
          },
        });
      });
    });

    it('should perform async validation on FC', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { updateValues },
        } = build(control(['', null, uniqueEmail]));

        subscription = cold('-b', {
          b: () =>
            updateValues({
              value: 'new@email.com',
              controlRef: [],
            }),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('a(bc) 246ms d', {
          a: {},
          b: {
            root: {
              value: 'new@email.com',
              dirty: true,
              pending: false,
            },
          },
          c: {
            root: {
              asyncValidateInProgress: { 0: true },
              pending: true,
            },
          },
          d: {
            root: {
              asyncValidateInProgress: { 0: false },
              pending: false,
            },
          },
        });
      });
    });

    it('should emit async validation actions for multiple form controls and all ancestors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { updateValues },
        } = build({
          ...asyncConfig,
          controls: {
            ...asyncConfig.controls,
            emergencyContacts: {
              ...asyncConfig.controls.emergencyContacts,
              controls: asyncEmergencyContactConfigs,
            },
          },
        });

        subscription = cold('-b', {
          b: () =>
            updateValues({
              controlRef: ['emergencyContacts', 1, 'email'],
              value: 'moechanged@email.com',
            }),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('a(bcdef) 243ms g 49ms h 49ms i 49ms (jk)', {
          a: {},
          b: { 'emergencyContacts.1.email': { value: 'moechanged@email.com' } },
          c: {
            root: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          d: {
            emergencyContacts: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          e: {
            'emergencyContacts.1': { pending: true, asyncValidateInProgress: { 0: true } },
          },
          f: {
            'emergencyContacts.1.email': {
              pending: true,
              asyncValidateInProgress: { 0: true, 1: true },
            },
          },
          g: {
            'emergencyContacts.1.email': {
              pending: true,
              asyncValidateInProgress: { 0: false, 1: true },
            },
          },
          h: {
            'emergencyContacts.1.email': {
              pending: false,
              asyncValidateInProgress: { 0: false, 1: false },
            },
          },
          i: {
            emergencyContacts: { pending: true, asyncValidateInProgress: { 0: false } },
          },
          j: {
            root: { pending: true, asyncValidateInProgress: { 0: false } },
          },
          k: {
            'emergencyContacts.1': { pending: false, asyncValidateInProgress: { 0: false } },
          },
        });
      });
    });

    // TODO: More cases to handle
    // it('should throw an error if trying to update a FG key that does not exist', () => {
    //   const initialState: BaseForm<Contact> = buildFormState(config);
    //   const value = {
    //     firstName: 'Dr',
    //     lastName: 'Ho',
    //     email: 'dr@hoe.com',
    //     xyz: 'not here',
    //   };

    //   const newStateFunc = () => {
    //     updateValues(
    //       initialState,
    //       controlChange({ controlRef: ['doctorInfo'], value }),
    //     );
    //   };

    //   expect(newStateFunc).toThrowError(
    //     `The number of keys do not match form group: doctorInfo`,
    //   );
    // });

    // it('should throw an error if trying to update a FA index that does not exist', () => {
    //   expect(newStateFunc).toThrowError(
    //     `The number of value items does not match the number of controls in array: emergencyContacts`,
    //   );
    // });
  });

  describe('on markControlAsPristine', () => {
    const newValue: DoctorInfo = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
    };

    it('should mark a control as pristine for a FC -> FG', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { updateValues, markControlAsPristine },
        } = build(config);

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
        const {
          state$,
          actions: { updateValues, markControlAsPristine },
        } = build(config);
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

  describe('on markControlAsTouched and markControlAsUntouched', () => {
    it('should mark control and all anscestors as touched', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const {
          state$,
          actions: { markControlAsTouched, markControlAsUntouched },
        } = build(config);
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
