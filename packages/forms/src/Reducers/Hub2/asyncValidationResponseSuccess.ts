import { Action } from '@reactables/core';
import { Form, FormControl } from '../../Models/Controls';
import { ControlAsyncValidationResponse } from '../../Models/Payloads';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { mergeErrors } from './mergeErrors';

const isControlValidating = (control: FormControl<unknown>): boolean => {
  if (!control.asyncValidateInProgress) return false;

  return Object.values(control.asyncValidateInProgress).some((pending) => pending);
};

const isControlAsyncValid = (control: FormControl<unknown>): boolean => {
  return !Object.values(control.asyncValidatorErrors).some((error) => error);
};

const getControlByKey = (key: string, form: Form<unknown>) => {
  return Object.values(form).find((control) => control.key === key);
};

export const asyncValidationResponseSuccess = <T>(
  form: Form<T>,
  { payload: { key, validatorIndex, errors } }: Action<ControlAsyncValidationResponse>,
): Form<T> => {
  const control = getControlByKey(key, form);

  if (!control) {
    return form;
  }

  const controlUpdated: Form<T> = {
    ...form,
    [getFormKey(control.controlRef)]: {
      ...control,
      asyncValidateInProgress: {
        ...control.asyncValidateInProgress,
        [validatorIndex]: false,
      },
      asyncValidatorErrors: {
        ...control.asyncValidatorErrors,
        ...errors,
      },
    },
  };

  const ancestors = getAncestorControls(control.controlRef, controlUpdated);

  const ancestorsUpdated = Object.entries(controlUpdated).reduce((acc, [key, control]) => {
    if (ancestors.includes(control)) {
      const descendants = getDescendantControls(control.controlRef, controlUpdated);

      return {
        ...acc,
        [key]: {
          ...control,
          pending: descendants.some((control) => isControlValidating(control)),
        },
      };
    }

    return {
      ...acc,
      [key]: control,
    };
  }, {} as Form<T>);

  return mergeErrors(ancestorsUpdated);
};
