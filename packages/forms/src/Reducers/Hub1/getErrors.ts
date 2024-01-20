import { BaseControl } from '../../Models/Controls';
import { FormErrors } from '../../Models';
import { RxFormProviders } from '../../RxForm/RxForm';

export const getErrors = <T>(control: BaseControl<T>, value: T, { validators }: RxFormProviders) =>
  control.config.validators?.reduce((acc, validator) => {
    if (!validators[validator]) {
      throw `You have not provided a validator for "${validator}"`;
    }
    return { ...acc, ...validators[validator](value) };
  }, {} as FormErrors) || {};
