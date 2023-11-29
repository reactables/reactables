import { ValidatorFn } from '@reactables/forms';

export const arrayLengthRequired: ValidatorFn = (array: Array<unknown>) => ({
  arrayLengthRequired: !Boolean(array?.length),
});
