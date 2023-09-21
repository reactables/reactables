import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getAncestorControls } from '../Helpers/getAncestorControls';
import { getValueChangeEffects } from './valueChange';

export const FORMS_REMOVE_CONTROL = 'FORMS_REMOVE_CONTROL';
export const removeControl = <T>(
  controlRef: ControlRef,
  state: AbstractControl<T>,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const mainAction: Action<ControlRef> = {
    type: FORMS_REMOVE_CONTROL,
    payload: controlRef,
  };
  const newState = reducer(state, mainAction);
  const formControls = getAncestorControls(controlRef.slice(0, -1), newState);
  const effects = getValueChangeEffects(formControls);
  const actions = [mainAction, ...effects];

  return actions;
};
