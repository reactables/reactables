import { ValidatorFn } from '@hubfx/forms';

export const arrayLengthRequired: ValidatorFn = (array: Array<unknown>) => ({
  arrayLengthRequired: !Boolean(array?.length),
});
