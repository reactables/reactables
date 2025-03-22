import { Form, BaseForm, FormControl, Hub2Fields } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlRef } from '../../Models/ControlRef';
import { FormErrors } from '../../Models';
import { DEFAULT_HUB2_FIELDS } from '../../Models/Controls';
import { reverseObjectKeys } from '../../Helpers/reverseObjectKeys';

const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

export const mergeRemoveControl = <T>(
  state: Form<T>,
  form: BaseForm<T>,
  controlRef: ControlRef,
) => {
  const parentRef = controlRef.slice(0, -1);
  const existingBranch = getControlBranch(parentRef, state);

  const updatedControlBranch = getControlBranch(parentRef, form)
    .reverse()
    .reduce((acc: Form<unknown>, baseControl) => {
      const key = getFormKey(baseControl.controlRef);

      const existingControl =
        existingBranch.find((control) => baseControl.key === control.key) ||
        (structuredClone(DEFAULT_HUB2_FIELDS) as Hub2Fields);

      const errors = {
        ...baseControl.validatorErrors,
        ...existingControl.asyncValidatorErrors,
      };

      const selfValid = !hasErrors(errors);

      let childrenValid = true;

      if (Array.isArray(baseControl.config.controls)) {
        // If control is a FormArray
        childrenValid = (baseControl.value as unknown[]).every((item, index) => {
          const formKey = getFormKey(baseControl.controlRef.concat(index));
          const valid = acc[formKey] === undefined ? state[formKey].valid : acc[formKey].valid;
          return valid;
        });
      } else if (baseControl.config.controls) {
        // If control is a FormGroup
        childrenValid = Object.keys(baseControl.value).every((childKey) => {
          const formKey = getFormKey(baseControl.controlRef.concat(childKey));
          const valid = acc[formKey] === undefined ? state[formKey].valid : acc[formKey].valid;
          return valid;
        });
      }

      return {
        ...acc,
        [key]: {
          ...existingControl,
          ...baseControl,
          errors,
          valid: selfValid && childrenValid,
          childrenValid,
        },
      };
    }, {}) as { [key: string]: FormControl<unknown> };

  const updatedControlBranchOrderRestored = reverseObjectKeys(updatedControlBranch);

  const descendants = existingBranch.filter(
    (control) => control.controlRef.length > parentRef.length,
  );

  const _removedControls = { ...state };

  descendants.forEach((control) => {
    delete _removedControls[getFormKey(control.controlRef)];
  });

  delete _removedControls[getFormKey(controlRef)];

  return {
    ..._removedControls,
    ...updatedControlBranchOrderRestored,
  };
};
