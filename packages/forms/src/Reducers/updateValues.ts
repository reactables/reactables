import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlChange } from '../Models/Payloads';
import { getControl } from '../Helpers/getControl';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';
import { updateChildValues } from './updateChildValues';

export const updateValues = <T>(
  state: AbstractControl<T>,
  { payload: { controlRef, value } }: Action<ControlChange<unknown>>,
): AbstractControl<T> => {
  const newState = cloneDeep(state);
  const newControl = getControl(controlRef, newState);
  newControl.value = value;

  const updatedAncestorsState = updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });

  return updateChildValues(updatedAncestorsState);
};
