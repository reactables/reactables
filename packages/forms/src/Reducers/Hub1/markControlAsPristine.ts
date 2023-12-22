import { Action } from '@reactables/core';
import { BaseFormState } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import {
  updateAncestorPristineValues,
  UPDATE_ANCESTOR_PRISTINE_VALUES,
} from './updateAncestorPristineValues';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';

export const markControlAsPristine = <T>(
  state: BaseFormState<T>,
  action: Action<ControlRef>,
  mergeChanges = false,
): BaseFormState<T> => {
  const { form } = state;
  const { payload: controlRef } = action;

  const descendants = getDescendantControls(controlRef, form).reduce(
    (acc, control) => ({
      ...acc,
      [getFormKey(control.controlRef)]: {
        ...control,
        dirty: false,
        pristineValue: control.value,
      },
    }),
    {},
  );
  let result = {
    ...form,
    ...descendants,
  };

  if (controlRef.length) {
    result = updateAncestorPristineValues(result, {
      type: UPDATE_ANCESTOR_PRISTINE_VALUES,
      payload: controlRef,
    });
  }

  const changedControls = getControlBranch(controlRef, result).reduce(
    (acc, control) => ({ ...acc, [control.key]: control }),
    {},
  );

  return {
    form: result,
    changedControls: {
      ...(mergeChanges ? state.changedControls || {} : undefined),
      ...changedControls,
    },
    removedControls: mergeChanges ? state.removedControls || {} : undefined,
  };
};
