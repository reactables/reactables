import { Action, Reducer } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlChange } from '../Models/Payloads';
import { getAncestorControls } from '../Helpers/getAncestorControls';
import { getValueChangeEffects } from './valueChange';

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const controlChange = <T, S>(
  controlChange: ControlChange<T>,
  state: AbstractControl<S>,
  reducer: Reducer<AbstractControl<S>>,
): (Action<ControlChange<T>> | Action<AbstractControl<unknown>>)[] => {
  const { controlRef } = controlChange;
  const mainAction = {
    type: FORMS_CONTROL_CHANGE,
    payload: controlChange,
  };

  const newState = reducer(state, mainAction);
  const formControls = getAncestorControls(controlRef, newState);
  const effects = getValueChangeEffects(formControls);

  const actions = [mainAction, ...effects];

  return actions;
};
