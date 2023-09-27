import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hub-fx/core';
import { BaseControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';
import { getChildControls } from '../Helpers/getChildControls';

export const markControlAsPristine = <T>(
  state: BaseControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const newState = cloneDeep(state);
  const control = getControl(controlRef, newState);
  const controls = getChildControls(control);

  controls.forEach((control) => {
    const pristineControl: BaseControl<unknown> = cloneDeep(control);
    delete pristineControl.pristineControl;
    control.pristineControl = pristineControl;
  });

  return newState;
};
