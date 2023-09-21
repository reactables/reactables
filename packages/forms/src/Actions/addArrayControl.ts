import { Action } from '@hubfx/core';
import { AbstractControl, FormArray } from '../Models/Controls';
import { AddControl } from '../Models/Payloads';
import { getControl } from '../Helpers/getControl';
import { getControlBranch } from '../Helpers/getControlBranch';
import { getValueChangeEffects } from './valueChange';

export const FORMS_ADD_FORM_ARRAY_CONTROL = 'FORMS_ADD_FORM_ARRAY_CONTROL';
export const addFormArrayControl = <T>(
  { controlRef, config }: AddControl,
  state: AbstractControl<T>,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const mainAction: Action<AddControl> = {
    type: FORMS_ADD_FORM_ARRAY_CONTROL,
    payload: { controlRef, config },
  };

  const newState = reducer(state, mainAction);
  const index =
    (<FormArray<unknown>>getControl(controlRef, newState)).controls.length - 1;
  const formControls = getControlBranch(controlRef.concat(index), newState);
  const effects = getValueChangeEffects(formControls);
  const actions = [mainAction, ...effects];

  return actions;
};
