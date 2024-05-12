import { Action } from '@reactables/core';
import { BaseFormState } from '../../Models/Controls';
import { MarkTouchedPayload } from '../../Models/Payloads';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { getFormKey } from '../../Helpers/getFormKey';
import { controlRefCheck } from '../../Helpers/controlRefCheck';

export const markControlAsTouched = <T>(
  state: BaseFormState<T>,
  action: Action<MarkTouchedPayload>,
  mergeChanges = false,
): BaseFormState<T> => {
  const { form } = state;
  const {
    payload: { controlRef, markAll },
  } = action;

  controlRefCheck(controlRef);

  const controls = (
    markAll ? getControlBranch(controlRef, form) : getAncestorControls(controlRef, form)
  ).reduce(
    (acc, control) => ({
      ...acc,
      [getFormKey(control.controlRef)]: {
        ...control,
        touched: true,
      },
    }),
    {},
  );

  const result = {
    form: {
      ...form,
      ...controls,
    },
    action,
  };

  const changedControls = getControlBranch(controlRef, result.form).reduce(
    (acc, control) => ({ ...acc, [control.key]: control }),
    {},
  );

  return {
    form: {
      ...form,
      ...controls,
    },
    changedControls: {
      ...(mergeChanges ? state.changedControls || {} : undefined),
      ...changedControls,
    },
    removedControls: mergeChanges ? state.removedControls || {} : undefined,
  };
};
