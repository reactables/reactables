import { Form, BaseForm, Hub2Fields, FormControl } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlRef } from '../../Models/ControlRef';
import { FormErrors } from '../../Models/FormErrors';
import { DEFAULT_HUB2_FIELDS } from '../../Models/Controls';

const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

export const mergeValueUpdated = <T>(state: Form<T>, form: BaseForm<T>, controlRef: ControlRef) => {
  const controlBranch = getControlBranch(controlRef, form)
    .reverse()
    .reduce((acc: Form<unknown>, control) => {
      const key = getFormKey(control.controlRef);

      const existingControl = state[key] || (structuredClone(DEFAULT_HUB2_FIELDS) as Hub2Fields);

      const errors = {
        ...control.validatorErrors,
        ...existingControl.asyncValidatorErrors,
      };

      const selfValid = !hasErrors(errors);

      let childrenValid = true;

      if (Array.isArray(control.config.controls)) {
        // If control is a FormArray
        childrenValid = (control.value as unknown[]).every((item, index) => {
          const formKey = getFormKey(control.controlRef.concat(index));
          const valid = acc[formKey] === undefined ? state[formKey].valid : acc[formKey].valid;
          return valid;
        });
      } else if (control.config.controls) {
        // If control is a FormGroup
        childrenValid = Object.keys(control.value).every((childKey) => {
          const formKey = getFormKey(control.controlRef.concat(childKey));
          const valid = acc[formKey] === undefined ? state[formKey].valid : acc[formKey].valid;
          return valid;
        });
      }

      return {
        ...acc,
        [key]: {
          ...existingControl,
          ...control,
          errors,
          valid: selfValid && childrenValid,
        },
      };
    }, {}) as { [key: string]: FormControl<unknown> };

  return {
    ...state,
    ...controlBranch,
  };
};
