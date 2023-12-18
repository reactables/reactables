import { Form, BaseForm, Hub2Fields } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlRef } from '../../Models/ControlRef';
import { FormErrors } from '../../Models/FormErrors';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getControl } from '../../Helpers/getControl';
import { DEFAULT_HUB2_FIELDS } from '../../Models/Controls';
import { mergeErrors } from './mergeErrors';

const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

export const mergePushControl = <T>(state: Form<T>, form: BaseForm<T>, controlRef: ControlRef) => {
  const baseFormArray = getControl(controlRef, form);
  //If Form Array
  // use the added control  (last index)
  // merge descendants with default stuff

  const newItemIndex = (<unknown[]>baseFormArray.value).length - 1;

  const descendants = getDescendantControls(controlRef.concat(newItemIndex), form);

  const mergedDescendants = mergeErrors(
    descendants.reduce((acc, control) => {
      const formKey = getFormKey(control.controlRef);
      return {
        ...acc,
        [formKey]: {
          ...control,
          ...(structuredClone(DEFAULT_HUB2_FIELDS) as Hub2Fields),
        },
      };
    }, {}) as Form<unknown>,
  );

  const ancestors = getAncestorControls(controlRef, state)
    .reverse()
    .reduce((acc, control, index, arr) => {
      const formKey = getFormKey(control.controlRef);

      const errors = {
        ...form[formKey].validatorErrors,
        ...control.asyncValidatorErrors,
      };

      if (!control.childrenValid)
        // If the ancestor control's children were not valid, pushing an item won't change its valid status
        return {
          ...acc,
          [formKey]: {
            ...control,
            ...form[formKey],
            errors,
          },
        };

      const selfValid = !hasErrors(errors);

      let childrenValid = true;
      if (index === 0) {
        childrenValid =
          control.childrenValid &&
          mergedDescendants[getFormKey(controlRef.concat(newItemIndex))].valid;
      } else {
        childrenValid = control.childrenValid && arr[index - 1].valid;
      }

      return {
        ...acc,
        [formKey]: {
          ...control,
          ...form[formKey],
          errors,
          valid: selfValid && childrenValid,
          childrenValid,
        },
      };
    }, {});

  const controlBranchUpdated = {
    ...ancestors,
    ...mergedDescendants,
  };

  return {
    ...state,
    ...controlBranchUpdated,
  };
};
