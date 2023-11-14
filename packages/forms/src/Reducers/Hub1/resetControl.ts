import { Action } from '@hub-fx/core';
import { BaseForm } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getControl } from '../../Helpers/getControl';
import { updateAncestorValues, UPDATE_ANCESTOR_VALUES } from './updateAncestorValues';
import { syncValidate } from './syncValidate';
import { updateDirty } from './updateDirty';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { buildFormState } from '../../Helpers/buildFormState';

export const resetControl = <T>(form: BaseForm<T>, { payload: controlRef }: Action<ControlRef>) => {
  const controlToReset = getControl(controlRef, form);

  const descendants = getDescendantControls(controlRef, form);

  // Remove all descendants
  const descendantsRemoved = Object.entries(form).reduce((acc, [key, control]) => {
    if (descendants.includes(control)) return acc;

    return {
      ...acc,
      [key]: control,
    };
  }, {} as BaseForm<unknown>);

  const restoredControls = buildFormState(
    controlToReset.config,
    descendantsRemoved,
    controlToReset.controlRef,
  );

  return updateDirty(
    syncValidate(
      updateAncestorValues(restoredControls, {
        type: UPDATE_ANCESTOR_VALUES,
        payload: controlRef,
      }),
    ),
  );
};
