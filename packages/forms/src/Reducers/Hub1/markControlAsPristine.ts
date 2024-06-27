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
import { controlRefCheck } from '../../Helpers/controlRefCheck';

export const markControlAsPristine = <T>(
  state: BaseFormState<T>,
  action: Action<ControlRef>,
  mergeChanges = false,
): BaseFormState<T> => {
  const { form } = state;
  const { payload: controlRef } = action;

  controlRefCheck(controlRef);

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

  const _changedControls = getControlBranch(controlRef, result).reduce(
    (acc, control) => ({ ...acc, [control.key]: control }),
    {},
  );

  return {
    form: result,
    _changedControls: {
      ...(mergeChanges ? state._changedControls || {} : undefined),
      ..._changedControls,
    },
    _removedControls: mergeChanges ? state._removedControls || {} : undefined,
  };
};
