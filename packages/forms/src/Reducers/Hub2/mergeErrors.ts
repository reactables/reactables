import { Form } from '../../Models/Controls';
import { FormErrors } from '../../Models';
import { getFormKey } from '../../Helpers/getFormKey';
import { reverseObjectKeys } from '../../Helpers/reverseObjectKeys';

const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

// TODO: update merge errors to not do the entire form but just a subset of it

// TODO: separation of concern to update validity of control and ancestors

export const mergeErrors = <T>(form: Form<T>): Form<T> => {
  const errorsMerged = Object.entries(form)
    .reverse()
    .reduce((acc, [key, control]) => {
      const errors = {
        ...control.validatorErrors,
        ...control.asyncValidatorErrors,
      };

      const selfValid = !hasErrors(errors);

      let childrenValid = true;

      if (Array.isArray(control.config.controls)) {
        // If control is a FormArray
        childrenValid = (control.value as unknown[]).every(
          (item, index) => acc[getFormKey(control.controlRef.concat(index))].valid,
        );
      } else if (control.config.controls) {
        // If control is a FormGroup
        childrenValid = Object.keys(control.value as unknown[]).every(
          (childKey) => acc[getFormKey(control.controlRef.concat(childKey))].valid,
        );
      }

      return {
        ...acc,
        [key]: {
          ...control,
          errors,
          valid: selfValid && childrenValid,
          childrenValid,
        },
      };
    }, {} as Form<T>);

  const restoredOrder = reverseObjectKeys(errorsMerged);

  return restoredOrder;
};
