import { Form } from '../../Models/Controls';
import { FormErrors } from '../../Models';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

export const mergeErrors = <T>(form: Form<T>): Form<T> => {
  const errorsMerged = Object.entries(form).reduce((acc, [key, control]) => {
    const errors = {
      ...control.validatorErrors,
      ...control.asyncValidatorErrors,
    };
    return {
      ...acc,
      [key]: {
        ...control,
        errors,
        valid: !hasErrors(errors),
      },
    };
  }, {} as Form<T>);

  const childrenErrorsChecked = Object.entries(errorsMerged).reduce((acc, [key, control]) => {
    return {
      ...acc,
      [key]: {
        ...control,
        valid:
          control.valid &&
          getDescendantControls(control.controlRef, errorsMerged).every((control) => control.valid),
      },
    };
  }, {} as Form<T>);

  return childrenErrorsChecked;
};
