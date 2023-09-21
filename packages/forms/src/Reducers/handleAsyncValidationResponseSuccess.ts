import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlAsyncValidationResponse } from '../Models/Payloads';
import { getAncestorControls } from '../Helpers/getAncestorControls';

const isControlValidating = (control: AbstractControl<unknown>): boolean => {
  if (!control.asyncValidateInProgress) return false;

  return Object.values(control.asyncValidateInProgress).some(
    (pending) => pending,
  );
};

export const handleAsyncValidationResponseSuccess = <T>(
  state: AbstractControl<T>,
  {
    payload: { controlRef, validatorIndex, errors },
  }: Action<ControlAsyncValidationResponse>,
): AbstractControl<T> => {
  const newState = cloneDeep(state);
  const controlBranch = getAncestorControls(controlRef, newState);

  controlBranch.reverse().forEach((control, index) => {
    if (index === 0) {
      control.asyncValidateInProgress[validatorIndex] = false;
      control.errors = {
        ...control.errors,
        ...errors,
      };
    }
    const pending =
      isControlValidating(control) ||
      Boolean(controlBranch[index - 1]?.pending);
    control.pending = pending;
  });

  return newState;
};
