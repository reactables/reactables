import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { getAncestorControls } from '../Helpers/getAncestorControls';

export const handleAsyncValidation = <T>(
  state: AbstractControl<T>,
  action: Action<AbstractControl<unknown>>,
): AbstractControl<T> => {
  const newState: AbstractControl<T> = cloneDeep(state);
  const newControlBranch = getAncestorControls(
    action.payload.controlRef,
    newState,
  );

  newControlBranch.forEach((control, index) => {
    control.pending = true;

    if (index === newControlBranch.length - 1) {
      control.config.asyncValidators.forEach((_, j) => {
        control.asyncValidateInProgress[j] = true;
      });
    }
  });

  return newState;
};
