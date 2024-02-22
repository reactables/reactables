import { FormErrors } from '../Models/FormErrors';
import { ValidatorFn } from '../Models/Validators';

export const required: ValidatorFn = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'object') {
    return { required: !Boolean(value) };
  }

  if (typeof value === 'number') {
    return { required: !(value !== undefined && value !== null) };
  }

  if (typeof value === 'boolean') {
    return { required: !value };
  }

  return { required: false };
};

export const arrayNotEmpty: ValidatorFn = (value: unknown[]) => ({
  arrayNotEmpty: !Boolean(value.length),
});

export const email: ValidatorFn = (value: string): FormErrors =>
  value && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value) ? { email: true } : { email: false };
