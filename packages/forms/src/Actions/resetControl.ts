import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControlBranch } from '../Helpers/getControlBranch';
import { getValueChangeEffects } from './valueChange';

export const FORMS_RESET_CONTROL = 'FORMS_RESET_CONTROL';
export const resetControl = <T>(
  controlRef: ControlRef,
  state: AbstractControl<T>,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const mainAction: Action<ControlRef> = {
    type: FORMS_RESET_CONTROL,
    payload: controlRef,
  };

  const newState = reducer(state, mainAction);
  const formControls = getControlBranch(controlRef, newState);
  const effects = getValueChangeEffects(formControls);

  const actions = [mainAction, ...effects];

  return actions;
};
