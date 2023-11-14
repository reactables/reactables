import { BaseForm } from '../../Models/Controls';
import { FormErrors } from '../../Models/FormErrors';
import { getDescendantControls } from '../../Helpers/getDescendantControls';

export const syncValidate = <T>(form: BaseForm<T>): BaseForm<T> => {
  // First check each control for its own validation
  const baseValidation = Object.entries(form).reduce((acc, [key, control]): BaseForm<T> => {
    const validatorErrors: FormErrors =
      control.config.validators?.reduce(
        (acc, validator) => ({ ...acc, ...validator(control.value) }),
        {} as FormErrors,
      ) || {};

    const validatorsValid = !Object.values(validatorErrors).some((err) => err);

    return {
      ...acc,
      [key]: {
        ...control,
        validatorErrors,
        validatorsValid,
      },
    };
  }, {} as BaseForm<T>);
  // Then check each controls children to see if there are errors

  const validated = Object.entries(baseValidation).reduce((acc, [key, control]) => {
    const validatorsValid = getDescendantControls(control.controlRef, baseValidation).every(
      ({ validatorsValid }) => validatorsValid,
    );

    return {
      ...acc,
      [key]: {
        ...control,
        validatorsValid,
      },
    };
  }, {} as BaseForm<T>);

  return validated;
};
