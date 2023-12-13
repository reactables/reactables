import { BaseControl } from '../../Models/Controls';
import { FormErrors } from '../../Models';

export const getErrors = <T>(control: BaseControl<T>, value: T) =>
  control.config.validators?.reduce(
    (acc, validator) => ({ ...acc, ...validator(value) }),
    {} as FormErrors,
  ) || {};
