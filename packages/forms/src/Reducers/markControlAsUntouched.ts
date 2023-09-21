import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';
import { getChildControls } from '../Helpers/getChildControls';

export const markControlAsUntouched = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const newState = cloneDeep(state);
  const control = getControl(controlRef, newState);
  const childControls = getChildControls(control);

  childControls.forEach((control) => {
    control.touched = false;
  });

  return newState;
};
