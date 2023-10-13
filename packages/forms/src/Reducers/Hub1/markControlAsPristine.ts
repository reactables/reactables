import { Action } from '@hub-fx/core';
import { BaseForm } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import {
  updateAncestorPristineValues,
  UPDATE_ANCESTOR_PRISTINE_VALUES,
} from './updateAncestorPristineValues';
import { updateDirty } from './updateDirty';

export const markControlAsPristine = <T>(
  form: BaseForm<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const descendants = getDescendantControls(controlRef, form);
  let result = Object.entries(form).reduce((acc, [key, control]) => {
    const isDescendant = descendants.includes(control);

    return {
      ...acc,
      [key]: isDescendant
        ? {
            ...control,
            pristineValue: control.value,
            dirty: false,
          }
        : control,
    };
  }, {} as BaseForm<T>);

  if (controlRef.length) {
    result = updateAncestorPristineValues(result, {
      type: UPDATE_ANCESTOR_PRISTINE_VALUES,
      payload: controlRef,
    });
  }

  return updateDirty(result);
};
