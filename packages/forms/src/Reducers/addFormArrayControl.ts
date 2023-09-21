import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { FormArray, AbstractControl } from '../Models/Controls';
import { AddControl } from '../Models/Payloads';
import { buildControlState } from '../Helpers/buildControlState';
import { getControl } from '../Helpers/getControl';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';

export const addFormArrayControl = <T>(
  state: AbstractControl<T>,
  { payload: { config, controlRef } }: Action<AddControl>,
) => {
  const newState = cloneDeep(state);

  const arrayControl = getControl(controlRef, newState) as FormArray<unknown>;

  const newIndex = arrayControl.controls.length
    ? arrayControl.controls.length
    : 0;

  arrayControl.controls = arrayControl.controls.concat(
    buildControlState(config, controlRef.concat(newIndex)),
  );

  arrayControl.value = arrayControl.controls.map(({ value }) => value);

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};
