import { build } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { FormGroupConfig, FormControlConfig, FormArrayConfig } from '../../Models/Configs';
import { DoctorInfo } from '../../Testing/Models/DoctorInfo';
import { config, emergencyContactConfigs } from '../../Testing/config';
import * as Validators from '../../Testing/Validators';

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
        const [state$] = build(config.controls.firstName);

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
        const [state$] = build(config.controls.doctorInfo, {
          providers: { validators: Validators },
        });

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
          validators: ['firstNameNotSameAsLast'],
          controls: {
            firstName: {
              initialValue: initialValue.firstName,
              validators: ['required'],
            } as FormControlConfig<string>,
            lastName: {
              initialValue: initialValue.lastName,
              validators: ['required'],
            } as FormControlConfig<string>,
            email: {
              initialValue: initialValue.email,
              validators: ['required', 'email'],
            } as FormControlConfig<string>,
          },
        };
        const [state$] = build(testConfig, { providers: { validators: Validators } });

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
        const [state$] = build(config.controls.emergencyContacts);

        subscription = cold('-').subscribe();

        expectObservable(state$).toBe('a', {
          a: {
            root: {
              value: [],
              controlRef: [],
              pristineValue: [],
              config: config.controls.emergencyContacts,
              touched: false,
              validatorErrors: { arrayNotEmpty: true },
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
        const [state$] = build(mainConfig, { providers: { validators: Validators } });

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
});
