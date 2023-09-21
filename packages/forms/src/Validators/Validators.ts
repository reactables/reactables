import { FormErrors } from '../Models/FormErrors';
import { ValidatorFn } from '../Models/Validators';

export const required: ValidatorFn = (value: unknown) => {
  if (Array.isArray(value)) {
    return { required: !Boolean(value.length) };
  }
  if (typeof value === 'string' || typeof value === 'object') {
    return { required: !Boolean(value) };
  }

  if (typeof value === 'number') {
    return { required: !(value !== undefined && value !== null) };
  }

  return { required: false };
};

export const email: ValidatorFn = (value: string): FormErrors =>
  value &&
  !/^(([^<>()[\]\\.,;:\s@"]{1,64}(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"){1,64})@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    value,
  )
    ? { email: true }
    : { email: false };

export const phoneNumber: ValidatorFn = (value: string): FormErrors =>
  // (XXX) XXX-XXXX
  value && !/^((\([0-9]{3}\)) [0-9]{3}-[0-9]{4})$/.test(value)
    ? { phoneNumber: true }
    : { phoneNumber: false };
