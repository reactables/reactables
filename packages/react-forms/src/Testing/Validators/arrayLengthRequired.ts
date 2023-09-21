import { ValidatorFn } from '@hub-fx/forms';

export const arrayLengthRequired: ValidatorFn = (array: Array<unknown>) => ({
  arrayLengthRequired: !Boolean(array?.length),
});
