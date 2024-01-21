import { ValidatorFn, FormErrors } from '../Models';
interface FullName {
  firstName: string;
  lastName: string;
}

export const firstNameNotSameAsLast = (value: FullName) => {
  return {
    firstNameNotSameAsLast: value.firstName === value.lastName,
  };
};

export const phoneNumber: ValidatorFn = (value: string): FormErrors =>
  value && !/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(value)
    ? { phoneNumber: true }
    : { phoneNumber: false };
