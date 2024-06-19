import { Action } from '@reactables/core';
import { BaseForm, BaseFormState } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { getFormKey } from '../../Helpers/getFormKey';
import { controlRefCheck } from '../../Helpers/controlRefCheck';

export const markControlAsUntouched = <T>(
  state: BaseFormState<T>,
  action: Action<ControlRef>,
  mergeChanges = false,
): BaseFormState<T> => {
  const { form } = state;
  const { payload: controlRef } = action;

  controlRefCheck(controlRef);

  let result = getDescendantControls(controlRef, form).reduce(
    (acc, control) => ({
      ...acc,
      [getFormKey(control.controlRef)]: {
        ...control,
        touched: false,
      },
    }),
    {},
  ) as BaseForm<unknown>;

  result = {
    ...form,
    ...result,
  };

  // Update ancestors
  let currentRef = controlRef;
  let key: string;
  while (currentRef.length > 0) {
    currentRef = currentRef.slice(0, -1);

    key = getFormKey(currentRef);
    result = {
      ...result,
      [key]: {
        ...result[key],
        touched: getDescendantControls(currentRef, result, true).some((control) => control.touched),
      },
    };
  }

  const _changedControls = getControlBranch(controlRef, result).reduce(
    (acc, control) => ({ ...acc, [control.key]: control }),
    {},
  );

  return {
    form: result as BaseForm<T>,
    _changedControls: {
      ...(mergeChanges ? state._changedControls || {} : undefined),
      ..._changedControls,
    },
    _removedConrols: mergeChanges ? state._removedConrols || {} : undefined,
  };
};
