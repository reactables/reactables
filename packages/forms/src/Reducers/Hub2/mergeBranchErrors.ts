import { Form } from '../../Models/Controls';
import { FormErrors } from '../../Models';
import { getFormKey } from '../../Helpers/getFormKey';
import { ControlRef } from '../../Models';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { reverseObjectKeys } from '../../Helpers/reverseObjectKeys';

const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

export const mergeBranchErrors = <T>(form: Form<T>, controlRef: ControlRef): Form<T> => {
  const controlBranch = getControlBranch(controlRef, form).reduce((acc, ctrl) => {
    return {
      ...acc,
      [getFormKey(ctrl.controlRef)]: ctrl,
    };
  }, {}) as Form<unknown>;

  const errorsMerged = Object.entries(controlBranch)
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
        childrenValid = (control.value as unknown[]).every((item, index) => {
          const formKey = getFormKey(control.controlRef.concat(index));
          const valid = acc[formKey] === undefined ? form[formKey].valid : acc[formKey].valid;
          return valid;
        });
      } else if (control.config.controls) {
        // If control is a FormGroup
        childrenValid = Object.keys(control.value).every((childKey) => {
          const formKey = getFormKey(control.controlRef.concat(childKey));
          const valid = acc[formKey] === undefined ? form[formKey].valid : acc[formKey].valid;
          return valid;
        });
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

  const errorsMergedOrderRestored = reverseObjectKeys(errorsMerged);

  return {
    ...form,
    ...errorsMergedOrderRestored,
  };
};
