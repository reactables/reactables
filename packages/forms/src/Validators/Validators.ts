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
  value && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value) ? { email: true } : { email: false };
