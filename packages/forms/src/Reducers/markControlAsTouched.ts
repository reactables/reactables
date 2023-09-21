import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getAncestorControls } from '../Helpers/getAncestorControls';

export const markControlAsTouched = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const newState = cloneDeep(state);
  const ancestorControls = getAncestorControls(controlRef, newState);

  ancestorControls.forEach((control) => {
    control.touched = true;
  });

  return newState;
};
