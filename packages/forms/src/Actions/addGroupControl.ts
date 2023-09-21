import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { AddControl } from '../Models/Payloads';
import { getControlBranch } from '../Helpers/getControlBranch';
import { getValueChangeEffects } from './valueChange';

export const FORMS_ADD_GROUP_CONTROL = 'FORMS_ADD_GROUP_CONTROL';
export const addGroupControl = <T>(
  { controlRef, config }: AddControl,
  state: AbstractControl<T>,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
): (Action<AddControl> | Action<ControlRef>)[] => {
  const mainAction: Action<AddControl> = {
    type: FORMS_ADD_GROUP_CONTROL,
    payload: { controlRef, config },
  };
  const newState = reducer(state, mainAction);
  const formControls = getControlBranch(controlRef, newState);
  const effects = getValueChangeEffects(formControls);
  const actions = [mainAction, ...effects];

  return actions;
};
