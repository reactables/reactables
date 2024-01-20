import { FormControlConfig, FormArrayConfig, FormGroupConfig } from '../Models/Configs';

export const emergencyContactConfigs: FormGroupConfig[] = [
  {
    validators: ['firstNameNotSameAsLast'],
    // asyncValidators: [uniqueFirstAndLastName],
    controls: {
      firstName: {
        initialValue: 'Homer',
        validators: ['required'],
      } as FormControlConfig<string>,
      lastName: {
        initialValue: 'Simpson',
        validators: ['required'],
      } as FormControlConfig<string>,
      email: {
        initialValue: 'homer@homer.com',
        validators: ['required', 'email'],
        // asyncValidators: [unique'email', blacklisted'email'],
      } as FormControlConfig<string>,
      relation: {
        initialValue: 'friend',
        validators: ['required'],
      } as FormControlConfig<string>,
    },
  },
  {
    validators: ['firstNameNotSameAsLast'],
    // asyncValidators: [uniqueFirstAndLastName],
    controls: {
      firstName: {
        initialValue: 'moe',
        validators: ['required'],
      } as FormControlConfig<string>,
      lastName: {
        initialValue: 'syzlak',
        validators: ['required'],
      } as FormControlConfig<string>,
      email: {
        initialValue: 'moe@moe.com',
        validators: ['required', 'email'],
        // asyncValidators: [unique'email', blacklisted'email'],
      } as FormControlConfig<string>,
      relation: {
        initialValue: 'friend',
        validators: ['required'],
      } as FormControlConfig<string>,
    },
  },
];

export const config: FormGroupConfig = {
  validators: ['firstNameNotSameAsLast'],
  // asyncValidators: [uniqueFirstAndLastName],
  controls: {
    firstName: {
      initialValue: '',
      validators: ['required'],
    } as FormControlConfig<string>,
    lastName: {
      initialValue: '',
      validators: ['required'],
    } as FormControlConfig<string>,
    email: {
      initialValue: '',
      validators: ['required', 'email'],
      // asyncValidators: [unique'email'],
    } as FormControlConfig<string>,
    phone: {
      initialValue: '',
      validators: ['required', 'phoneNumber'],
    } as FormControlConfig<string>,
    emergencyContacts: {
      validators: ['required'],
      // asyncValidators: [arrayLengthError],
      controls: [],
    } as FormArrayConfig,
    doctorInfo: {
      validators: ['firstNameNotSameAsLast'],
      // asyncValidators: [uniqueFirstAndLastName],
      controls: {
        firstName: {
          initialValue: '',
          validators: ['required'],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: '',
          validators: ['required'],
        } as FormControlConfig<string>,
        email: {
          initialValue: '',
          validators: ['required', 'email'],
          // asyncValidators: [unique'email', blacklisted'email'],
        } as FormControlConfig<string>,
      },
    } as FormGroupConfig,
  },
};
