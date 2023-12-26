import { Form, Hub2Fields, FormControl, BaseFormState } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { FormErrors } from '../../Models/FormErrors';
import { DEFAULT_HUB2_FIELDS } from '../../Models/Controls';
import { mergeRemoveControl } from './mergeRemoveControl';

const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

export const mergeControls = <T>(
  state: Form<T>,
  { form, changedControls = {}, removedControls }: BaseFormState<unknown>,
) => {
  const controlsRemoved = removedControls
    ? Object.values(removedControls).reduce(
        (acc, { controlRef }) => mergeRemoveControl(acc, form, controlRef),
        state,
      )
    : state;

  const updatedBranch = Object.values(changedControls)
    .reverse()
    .reduce((acc: Form<unknown>, control) => {
      const formKey = getFormKey(control.controlRef);
      const existingControl = controlsRemoved && controlsRemoved[formKey];

      const newControl: FormControl<unknown> = {
        ...(existingControl
          ? existingControl
          : (structuredClone(DEFAULT_HUB2_FIELDS) as Hub2Fields)),
        ...control,
      };

      const errors = {
        ...newControl.validatorErrors,
        ...newControl.asyncValidatorErrors,
      };

      const selfValid = !hasErrors(errors);

      let childrenValid = true;

      if (Array.isArray(control.config.controls)) {
        // If control is a FormArray
        childrenValid = (control.value as unknown[]).every((item, index) => {
          const formKey = getFormKey(control.controlRef.concat(index));
          const valid =
            acc[formKey] === undefined ? controlsRemoved[formKey].valid : acc[formKey].valid;
          return valid;
        });
      } else if (control.config.controls) {
        // If control is a FormGroup
        childrenValid = Object.keys(control.value).every((childKey) => {
          const formKey = getFormKey(control.controlRef.concat(childKey));
          const valid =
            acc[formKey] === undefined ? controlsRemoved[formKey].valid : acc[formKey].valid;
          return valid;
        });
      }

      return {
        ...acc,
        [formKey]: {
          ...newControl,
          errors,
          valid: selfValid && childrenValid,
          childrenValid,
        },
      };
    }, {});

  const result = {
    ...controlsRemoved,
    ...updatedBranch,
  };

  return result;
};
