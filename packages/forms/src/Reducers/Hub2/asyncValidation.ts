import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hub-fx/core';
import { AbstractControl, BaseAbstractControl } from '../../Models/Controls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';

export const asyncValidation = <T>(
  state: AbstractControl<T>,
  action: Action<BaseAbstractControl<unknown>>,
): AbstractControl<T> => {
  const newState: AbstractControl<T> = cloneDeep(state);
  const newControlBranch = getAncestorControls(
    action.payload.controlRef,
    newState,
  ) as AbstractControl<unknown>[];

  newControlBranch.forEach((control, index) => {
    control.pending = true;

    if (index === newControlBranch.length - 1) {
      control.config.asyncValidators.forEach((_, j) => {
        control.asyncValidateInProgress = {
          ...control.asyncValidateInProgress,
          [j]: true,
        };
      });
    }
  });

  return newState;
};
