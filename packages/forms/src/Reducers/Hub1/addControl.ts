import { Action } from '@reactables/core';
import { BaseFormState, BaseControl } from '../../Models/Controls';
import { AddControlPayload } from '../../Models/Payloads';
import { buildState } from '../../Helpers/buildFormState';
import { getControl } from '../../Helpers/getControl';
import {
  updateAncestorValuesAddControl,
  UPDATE_ANCESTOR_VALUES_ADD_CONTROL,
} from './updateAncestorValuesAddControl';
import { getControlBranch } from '../../Helpers/getControlBranch';

export const addControl = <T>(
  state: BaseFormState<T>,
  action: Action<AddControlPayload>,
  mergeChanges = false,
): BaseFormState<T> => {
  const {
    payload: { config, controlRef },
  } = action;

  // If controlRef does not exist we are adding control to a Form Group

  if (!getControl(controlRef.slice(0, -1), state.form)) {
    throw 'You are attempting to add a control to a non-existent form group';
  }

  const newForm = buildState(config, state.form, controlRef);
  const newValue = getControl(controlRef, newForm).value;

  const ancestorsUpdated = updateAncestorValuesAddControl(newForm, {
    type: UPDATE_ANCESTOR_VALUES_ADD_CONTROL,
    payload: { controlRef: controlRef, value: newValue },
  });

  const changedControls = getControlBranch(controlRef, ancestorsUpdated).reduce(
    (acc: { [key: string]: BaseControl<unknown> }, control) => ({ ...acc, [control.key]: control }),
    {},
  );

  return {
    form: ancestorsUpdated,
    changedControls: {
      ...(mergeChanges ? state.changedControls || {} : undefined),
      ...changedControls,
    },
    removedControls: mergeChanges ? state.removedControls || {} : undefined,
  };
};
