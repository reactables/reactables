import { Action } from '@reactables/core';
import { BaseForm, BaseFormState } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getControl } from '../../Helpers/getControl';
import { updateAncestorValues, UPDATE_ANCESTOR_VALUES } from './updateAncestorValues';
import { syncValidate } from './syncValidate';
import { updateDirty } from './updateDirty';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { buildState } from '../../Helpers/buildFormState';

export const resetControl = <T>(
  { form }: BaseFormState<T>,
  action: Action<ControlRef>,
): BaseFormState<T> => {
  const { payload: controlRef } = action;
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

  const restoredControls = buildState(
    controlToReset.config,
    descendantsRemoved,
    controlToReset.controlRef,
  ) as BaseForm<T>;

  return {
    form: updateDirty(
      syncValidate(
        updateAncestorValues(restoredControls, {
          type: UPDATE_ANCESTOR_VALUES,
          payload: controlRef,
        }),
      ),
    ),
    action,
  };
};
