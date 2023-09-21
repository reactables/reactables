import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
} from '../Models/Configs';
import { required, email, phoneNumber } from '../Validators/Validators';
import {
  uniqueEmail,
  uniqueFirstAndLastName,
  arrayLengthError,
  blacklistedEmail,
} from './AsyncValidators';

interface FullName {
  firstName: string;
  lastName: string;
}

export const firstNameNotSameAsLast = (value: FullName) => {
  return {
    firstNameNotSameAsLast: value.firstName === value.lastName,
  };
};

export const emergencyContactConfigs: FormGroupConfig[] = [
  {
    validators: [firstNameNotSameAsLast],
    asyncValidators: [uniqueFirstAndLastName],
    controls: {
      firstName: {
        initialValue: 'Homer',
        validators: [required],
      } as FormControlConfig<string>,
      lastName: {
        initialValue: 'Simpson',
        validators: [required],
      } as FormControlConfig<string>,
      email: {
        initialValue: 'homer@homer.com',
        validators: [required, email],
        asyncValidators: [uniqueEmail, blacklistedEmail],
      } as FormControlConfig<string>,
      relation: {
        initialValue: 'friend',
        validators: [required],
      } as FormControlConfig<string>,
    },
  },
  {
    validators: [firstNameNotSameAsLast],
    asyncValidators: [uniqueFirstAndLastName],
    controls: {
      firstName: {
        initialValue: 'moe',
        validators: [required],
      } as FormControlConfig<string>,
      lastName: {
        initialValue: 'syzlak',
        validators: [required],
      } as FormControlConfig<string>,
      email: {
        initialValue: 'moe@moe.com',
        validators: [required, email],
        asyncValidators: [uniqueEmail, blacklistedEmail],
      } as FormControlConfig<string>,
      relation: {
        initialValue: 'friend',
        validators: [required],
      } as FormControlConfig<string>,
    },
  },
];

export const config: FormGroupConfig = {
  validators: [firstNameNotSameAsLast],
  asyncValidators: [uniqueFirstAndLastName],
  controls: {
    firstName: {
      initialValue: '',
      validators: [required],
    } as FormControlConfig<string>,
    lastName: {
      initialValue: '',
      validators: [required],
    } as FormControlConfig<string>,
    email: {
      initialValue: '',
      validators: [required, email],
      asyncValidators: [uniqueEmail],
    } as FormControlConfig<string>,
    phone: {
      initialValue: '',
      validators: [required, phoneNumber],
    } as FormControlConfig<string>,
    emergencyContacts: {
      validators: [required],
      asyncValidators: [arrayLengthError],
      controls: [],
    } as FormArrayConfig,
    doctorInfo: {
      validators: [firstNameNotSameAsLast],
      asyncValidators: [uniqueFirstAndLastName],
      controls: {
        firstName: {
          initialValue: '',
          validators: [required],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: '',
          validators: [required],
        } as FormControlConfig<string>,
        email: {
          initialValue: '',
          validators: [required, email],
          asyncValidators: [uniqueEmail, blacklistedEmail],
        } as FormControlConfig<string>,
      },
    } as FormGroupConfig,
  },
};
