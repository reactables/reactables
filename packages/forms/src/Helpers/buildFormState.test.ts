import { buildFormState } from './buildFormState';
import { FormArrayConfig, FormGroupConfig, FormControlConfig } from '../Models';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';
import { config, firstNameNotSameAsLast, emergencyContactConfigs } from '../Testing/config';
import { required, email } from '../Validators/Validators';

describe('buildFormState', () => {
  it('should build the control state for for type field', () => {
    const result = buildFormState(config.controls.firstName);

    expect(result.root.value).toBe('');
    expect(result.root.pristineValue).toBe('');
    expect(result.root.config).toEqual(config.controls.firstName);
    expect(result.root.touched).toEqual(false);
    expect(result.root.validatorErrors).toEqual({});
    expect(result.root.validatorsValid).toBe(null);
  });

  it('should build the control state for type group with empty value', () => {
    const initialValue = {
      firstName: '',
      lastName: '',
      email: '',
    };

    const result = buildFormState(config.controls.doctorInfo);

    expect(result.root.value).toEqual(initialValue);
    expect(result.root.pristineValue).toEqual(initialValue);
    expect(result.root.config).toEqual(config.controls.doctorInfo);
    expect(result.root.touched).toEqual(false);
    expect(result.root.validatorErrors).toEqual({});
    expect(result.root.validatorsValid).toBe(null);
  });

  it('should build the control state for type group with non-empty value', () => {
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

    const result = buildFormState(testConfig);

    expect(result.root.value).toEqual(initialValue);
    expect(result.root.controlRef).toEqual([]);
    expect(result.root.pristineValue).toEqual(initialValue);
    expect(result.root.config).toEqual(testConfig);
    expect(result.root.touched).toEqual(false);
    expect(result.root.validatorErrors).toEqual({});
    expect(result.root.validatorsValid).toBe(null);

    expect(result.firstName.value).toEqual(initialValue.firstName);
    expect(result.firstName.controlRef).toEqual(['firstName']);
    expect(result.firstName.pristineValue).toEqual(initialValue.firstName);
    expect(result.firstName.config).toEqual(testConfig.controls['firstName']);
    expect(result.firstName.touched).toEqual(false);
    expect(result.firstName.validatorErrors).toEqual({});
    expect(result.firstName.validatorsValid).toBe(null);

    expect(result.lastName.value).toEqual(initialValue.lastName);
    expect(result.lastName.controlRef).toEqual(['lastName']);
    expect(result.lastName.pristineValue).toEqual(initialValue.lastName);
    expect(result.lastName.config).toEqual(testConfig.controls['lastName']);
    expect(result.lastName.touched).toEqual(false);
    expect(result.lastName.validatorErrors).toEqual({});
    expect(result.lastName.validatorsValid).toBe(null);

    expect(result.email.value).toEqual(initialValue.email);
    expect(result.email.controlRef).toEqual(['email']);
    expect(result.email.pristineValue).toEqual(initialValue.email);
    expect(result.email.config).toEqual(testConfig.controls['email']);
    expect(result.email.touched).toEqual(false);
    expect(result.email.validatorErrors).toEqual({});
    expect(result.email.validatorsValid).toBe(null);
  });

  it('should build the control state for for type array with empty initial value', () => {
    const result = buildFormState(config.controls.emergencyContacts);

    expect(result.root.value).toEqual([]);
    expect(result.root.controlRef).toEqual([]);
    expect(result.root.pristineValue).toEqual([]);
    expect(result.root.config).toEqual(config.controls.emergencyContacts);
    expect(result.root.touched).toEqual(false);
    expect(result.root.validatorErrors).toEqual({});
    expect(result.root.validatorsValid).toBe(null);
  });

  it('should build the entire form state with non-empty array value form group initial values', () => {
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

    const result = buildFormState(mainConfig);
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

    expect(result.root.value).toEqual(expectedFormValue);
    expect(result.root.controlRef).toEqual([]);
    expect(result.root.pristineValue).toEqual(expectedFormValue);
    expect(result.root.config).toEqual(mainConfig);
    expect(result.root.touched).toEqual(false);
    expect(result.root.validatorErrors).toEqual({});
    expect(result.root.validatorsValid).toBe(null);

    expect(result.emergencyContacts.value).toEqual(expectedFormValue.emergencyContacts);
    expect(result.emergencyContacts.controlRef).toEqual(['emergencyContacts']);
    expect(result.emergencyContacts.pristineValue).toEqual(expectedFormValue.emergencyContacts);
    expect(result.emergencyContacts.config).toEqual(mainConfig.controls['emergencyContacts']);
    expect(result.emergencyContacts.touched).toEqual(false);
    expect(result.emergencyContacts.validatorErrors).toEqual({});
    expect(result.emergencyContacts.validatorsValid).toBe(null);

    expect(result['emergencyContacts.0'].value).toEqual(expectedFormValue.emergencyContacts[0]);
    expect(result['emergencyContacts.0'].controlRef).toEqual(['emergencyContacts', 0]);
    expect(result['emergencyContacts.0'].pristineValue).toEqual(
      expectedFormValue.emergencyContacts[0],
    );
    expect(result['emergencyContacts.0'].config).toEqual(
      mainConfig.controls['emergencyContacts'].controls[0],
    );
    expect(result['emergencyContacts.0'].touched).toEqual(false);
    expect(result['emergencyContacts.0'].validatorErrors).toEqual({});
    expect(result['emergencyContacts.0'].validatorsValid).toBe(null);

    expect(result['emergencyContacts.1'].value).toEqual(expectedFormValue.emergencyContacts[1]);
    expect(result['emergencyContacts.1'].controlRef).toEqual(['emergencyContacts', 1]);
    expect(result['emergencyContacts.1'].pristineValue).toEqual(
      expectedFormValue.emergencyContacts[1],
    );
    expect(result['emergencyContacts.1'].config).toEqual(
      mainConfig.controls['emergencyContacts'].controls[1],
    );
    expect(result['emergencyContacts.1'].touched).toEqual(false);
    expect(result['emergencyContacts.1'].validatorErrors).toEqual({});
    expect(result['emergencyContacts.1'].validatorsValid).toBe(null);
  });
});
