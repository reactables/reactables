import { Action } from '@reactables/core';
import { Form } from '../../Models/Controls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getFormKey } from '../../Helpers/getFormKey';
import { BaseControl } from '../../Models/Controls';

export const asyncValidation = <T>(
  form: Form<T>,
  { payload: { controlRef } }: Action<BaseControl<unknown>>,
): Form<T> => {
  const updatedSelfAndAncestors = getAncestorControls(controlRef, form).reduce((acc, control) => {
    const isChangedControl = getFormKey(control.controlRef) === getFormKey(controlRef);
    return {
      ...acc,
      [getFormKey(control.controlRef)]: {
        ...control,
        pending: true,
        valid: false,
        asyncValidateInProgress: isChangedControl
          ? {
              ...control.config.asyncValidators.reduce(
                (acc, _, index) => ({ ...acc, [index]: true }),
                {},
              ),
            }
          : control.asyncValidateInProgress,
      },
    };
  }, {});

  return {
    ...form,
    ...updatedSelfAndAncestors,
  };
};
