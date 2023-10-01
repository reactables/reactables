import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hub-fx/core';
import { AbstractControl } from '../../Models/Controls';
import { ControlAsyncValidationResponse } from '../../Models/Payloads';
import { getAncestorControls } from '../../Helpers/getAncestorControls';

const isControlValidating = (control: AbstractControl<unknown>): boolean => {
  if (!control.asyncValidateInProgress) return false;

  return Object.values(control.asyncValidateInProgress).some(
    (pending) => pending,
  );
};

const isControlAsyncValid = (control: AbstractControl<unknown>): boolean => {
  return !Object.values(control.asyncValidatorErrors).some((error) => error);
};

export const asyncValidationResponseSuccess = <T>(
  state: AbstractControl<T>,
  {
    payload: { controlRef, validatorIndex, errors },
  }: Action<ControlAsyncValidationResponse>,
): AbstractControl<T> => {
  const newState = cloneDeep(state);
  const controlBranch = getAncestorControls(
    controlRef,
    newState,
  ) as AbstractControl<unknown>[];

  controlBranch.reverse().forEach((control, index) => {
    if (index === 0) {
      control.asyncValidateInProgress = {
        ...control.asyncValidateInProgress,
        [validatorIndex]: false,
      };
      control.asyncValidatorErrors = {
        ...control.asyncValidatorErrors,
        ...errors,
      };
    }

    const childControl = controlBranch[index - 1];
    control.pending =
      isControlValidating(control) || Boolean(childControl?.pending);

    control.asyncValidatorsValid =
      isControlAsyncValid(control) &&
      Boolean(childControl?.asyncValidatorsValid);
  });

  return newState;
};
