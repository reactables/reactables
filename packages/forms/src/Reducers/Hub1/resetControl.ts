import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hub-fx/core';
import {
  BaseArrayControl,
  BaseGroupControl,
  BaseControl,
} from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getControl } from '../../Helpers/getControl';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';

export const resetControl = <T>(
  state: BaseControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  if (!controlRef.length) {
    return {
      pristineControl: state.pristineControl,
      ...state.pristineControl,
    };
  }

  const parentRef = controlRef.slice(0, -1);
  const newState = cloneDeep(state);

  const control = getControl(controlRef, newState);
  const parentControl = getControl(parentRef, newState) as
    | BaseGroupControl<unknown>
    | BaseArrayControl<unknown>;
  parentControl.controls[controlRef.slice(-1)[0]] = {
    pristineControl: control.pristineControl,
    ...control.pristineControl,
  };

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};
