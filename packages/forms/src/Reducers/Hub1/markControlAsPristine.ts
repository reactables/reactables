import { Action } from '@reactables/core';
import { BaseFormState } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import {
  updateAncestorPristineValues,
  UPDATE_ANCESTOR_PRISTINE_VALUES,
} from './updateAncestorPristineValues';
import { getFormKey } from '../../Helpers/getFormKey';

export const markControlAsPristine = <T>(
  { form }: BaseFormState<T>,
  action: Action<ControlRef>,
): BaseFormState<T> => {
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

  return { form: result, action };
};
