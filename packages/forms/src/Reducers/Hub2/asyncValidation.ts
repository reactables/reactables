import { Action } from '@hub-fx/core';
import { Form } from '../../Models/Controls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getFormKey } from '../../Helpers/getFormKey';
import { BaseControl } from '../../Models/Controls';

export const asyncValidation = <T>(
  form: Form<T>,
  { payload: { controlRef } }: Action<BaseControl<unknown>>,
): Form<T> => {
  const ancestors = getAncestorControls(controlRef, form);

  const result = Object.entries(form).reduce((acc, [key, control]) => {
    if (ancestors.includes(control)) {
      const isChangedControl = getFormKey(control.controlRef) === getFormKey(controlRef);

      return {
        ...acc,
        [key]: {
          ...control,
          pending: true,
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
    }

    return {
      ...acc,
      [key]: control,
    };
  }, {} as Form<T>);

  return result;
};
