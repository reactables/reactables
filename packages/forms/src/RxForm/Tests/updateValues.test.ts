import { build, control, group } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { FormArrayConfig } from '../../Models/Configs';
import { config, emergencyContactConfigs } from '../../Testing/config';
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

  describe('on updateValues', () => {
    it('should update value and dirty status for control and its descendants/ancestors for FormGroup control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues }] = build(config, {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

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

        const [state$, { updateValues }] = build(
          {
            ...config,
            controls: {
              ...config.controls,
              emergencyContacts: nonEmptyConfig,
            },
          },
          {
            providers: { validators: Validators, asyncValidators: AsyncValidators },
          },
        );

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
        const [state$, { updateValues }] = build(control(['', null, 'uniqueEmail']), {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

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
        const [state$, { updateValues }] = build(
          {
            ...asyncConfig,
            controls: {
              ...asyncConfig.controls,
              emergencyContacts: {
                ...asyncConfig.controls.emergencyContacts,
                controls: asyncEmergencyContactConfigs,
              },
            },
          },
          {
            providers: { validators: Validators, asyncValidators: AsyncValidators },
          },
        );

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

    it('should normalize a value for a form control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues }] = build(
          group({
            controls: {
              numbersOnly: control({
                initialValue: '',
                normalizers: ['numbersOnly'],
              }),
            },
          }),
          {
            providers: {
              validators: Validators,
              asyncValidators: AsyncValidators,
              normalizers: { numbersOnly: (value: string) => value.replace(/\D/g, '') },
            },
          },
        );

        subscription = cold('-b', {
          b: () =>
            updateValues({
              controlRef: ['numbersOnly'],
              value: 'as12j345',
            }),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('ab', {
          a: { root: { value: { numbersOnly: '' } }, numbersOnly: { value: '' } },
          b: { root: { value: { numbersOnly: '12345' } }, numbersOnly: { value: '12345' } },
        });
      });
    });

    fit('should validate descendant control validators when the group value is set', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { updateValues }] = build(
          group({
            controls: {
              person: group({
                controls: {
                  firstName: control(['Homer', 'required']),
                  lastName: control(['Simpson', 'required']),
                },
              }),
            },
          }),
        );

        subscription = cold('-b', {
          b: () =>
            updateValues({
              controlRef: ['person'],
              value: {
                firstName: '',
                lastName: '',
              },
            }),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('ab', {
          a: {
            root: { value: { person: { firstName: 'Homer', lastName: 'Simpson' } }, valid: true },
            person: { value: { firstName: 'Homer', lastName: 'Simpson' }, valid: true },
            ['person.firstName']: { value: 'Homer', valid: true, errors: { required: false } },
            ['person.lastName']: { value: 'Simpson', valid: true, errors: { required: false } },
          },
          b: {
            root: { value: { person: { firstName: '', lastName: '' } }, valid: false },
            person: { value: { firstName: '', lastName: '' }, valid: false },
            ['person.firstName']: { value: '', valid: false, errors: { required: true } },
            ['person.lastName']: { value: '', valid: false, errors: { required: true } },
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
});
