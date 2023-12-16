import { Action } from '@reactables/core';
import { BaseFormState } from '../../Models/Controls';
import { MarkTouched } from '../../Models/Payloads';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { getFormKey } from '../../Helpers/getFormKey';

export const markControlAsTouched = <T>(
  { form }: BaseFormState<T>,
  action: Action<MarkTouched>,
): BaseFormState<T> => {
  const {
    payload: { controlRef, markAll },
  } = action;

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

  return {
    form: {
      ...form,
      ...controls,
    },
    action,
  };
};
