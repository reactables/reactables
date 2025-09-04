import { Action } from '@reactables/core';
import { Form, FormControl } from '../../Models/Controls';
import { ControlAsyncValidationResponse } from '../../Models/Payloads';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { mergeBranchErrors } from './mergeBranchErrors';

const isControlValidating = (control: FormControl<unknown>): boolean => {
  if (!control.asyncValidateInProgress) return false;

  return Object.values(control.asyncValidateInProgress).some((pending) => pending);
};

const getControlByKey = (key: string, form: Form<unknown>) => {
  return Object.values(form).find((control) => control.key === key);
};

export const asyncValidationResponse = (
  form: Form<any> | null,
  { payload: { key, validatorIndex, errors } }: Action<ControlAsyncValidationResponse>,
): Form<any> => {
  const control = getControlByKey(key, form!);

  if (!control) {
    return form!;
  }

  const controlUpdated = {
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
  } as Form<any>;

  const ancestors = getAncestorControls(control.controlRef, controlUpdated);

  const ancestorsUpdated = Object.entries(controlUpdated).reduce((acc, [key, control]) => {
    if (ancestors.includes(control)) {
      const descendants = getDescendantControls(control.controlRef, controlUpdated);
      const pending = descendants.some((control) => isControlValidating(control));

      return {
        ...acc,
        [key]: {
          ...control,
          pending,
        },
      };
    }

    return {
      ...acc,
      [key]: control,
    };
  }, {} as Form<any>);

  return mergeBranchErrors(ancestorsUpdated, control.controlRef);
};
