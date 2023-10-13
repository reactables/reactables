import { Action } from '@hub-fx/core';
import { BaseForm } from '../../Models/Controls';
import { AddControl } from '../../Models/Payloads';
import { ControlRef } from '../../Models';
import { FormArrayConfig } from '../../Models';
import { buildFormState } from '../../Helpers/buildFormState';
import {
  UPDATE_ANCESTOR_VALUES,
  updateAncestorValues,
} from './updateAncestorValues';
import { getControl } from '../../Helpers/getControl';
import { syncValidate } from './syncValidate';
import { updateDirty } from './updateDirty';

export const addControl = <T>(
  form: BaseForm<T>,
  { payload: { config, controlRef } }: Action<AddControl>,
): BaseForm<T> => {
  let newControlRef: ControlRef;

  const existingControl = getControl(controlRef, form);

  // If controlRef exists we are adding control to a Form Array
  if (
    existingControl &&
    Array.isArray((existingControl.config as FormArrayConfig).controls)
  ) {
    newControlRef = controlRef.concat(
      (existingControl.value as Array<unknown>).length,
    );
  } else {
    // If controlRef does not exist we are adding control to a Form Group

    if (!getControl(controlRef.slice(0, -1), form)) {
      throw 'You are attempting to add a control to a non-existent form group';
    }

    newControlRef = controlRef;
  }

  const newForm = buildFormState(config, form, newControlRef);

  const ancestorsUpdated = updateAncestorValues(newForm, {
    type: UPDATE_ANCESTOR_VALUES,
    payload: newControlRef,
  });

  return syncValidate(updateDirty(ancestorsUpdated));
};
