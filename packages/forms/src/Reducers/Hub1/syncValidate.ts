import { BaseForm } from '../../Models/Controls';
import { FormErrors } from '../../Models/FormErrors';

export const syncValidate = <T>(form: BaseForm<T>): BaseForm<T> => {
  // First check each control for its own validation
  const validated = Object.entries(form).reduce((acc, [key, control]): BaseForm<T> => {
    const validatorErrors: FormErrors =
      control.config.validators?.reduce(
        (acc, validator) => ({ ...acc, ...validator(control.value) }),
        {} as FormErrors,
      ) || {};

    return {
      ...acc,
      [key]: {
        ...control,
        validatorErrors,
      },
    };
  }, {} as BaseForm<T>);

  return validated;
};
