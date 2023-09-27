import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hub-fx/core';
import { BaseControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getAncestorControls } from '../Helpers/getAncestorControls';

export const markControlAsTouched = <T>(
  state: BaseControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const newState = cloneDeep(state);
  const ancestorControls = getAncestorControls(controlRef, newState);

  ancestorControls.forEach((control) => {
    control.touched = true;
  });

  return newState;
};
