import { Action } from '@reactables/core';
import { BaseFormState } from '../../Models/Controls';
import { AddControl } from '../../Models/Payloads';
import { ControlRef } from '../../Models';
import { FormArrayConfig } from '../../Models';
import { buildState } from '../../Helpers/buildFormState';
import { getControl } from '../../Helpers/getControl';
import {
  updateAncestorValuesAddControl,
  UPDATE_ANCESTOR_VALUES_ADD_CONTROL,
} from './updateAncestorValuesAddControl';

export const addControl = <T>(
  state: BaseFormState<T>,
  action: Action<AddControl>,
): BaseFormState<T> => {
  let newControlRef: ControlRef;

  const {
    payload: { config, controlRef },
  } = action;

  const existingControl = getControl(controlRef, state.form);

  // If controlRef exists we are adding control to a Form Array
  if (existingControl && Array.isArray((existingControl.config as FormArrayConfig).controls)) {
    newControlRef = controlRef.concat((existingControl.value as Array<unknown>).length);
  } else {
    // If controlRef does not exist we are adding control to a Form Group

    if (!getControl(controlRef.slice(0, -1), state.form)) {
      throw 'You are attempting to add a control to a non-existent form group';
    }

    newControlRef = controlRef;
  }

  const newForm = buildState(config, state.form, newControlRef);
  const newValue = getControl(newControlRef, newForm).value;

  const ancestorsUpdated = updateAncestorValuesAddControl(newForm, {
    type: UPDATE_ANCESTOR_VALUES_ADD_CONTROL,
    payload: { controlRef: newControlRef, value: newValue },
  });

  return { form: ancestorsUpdated, action };
};
