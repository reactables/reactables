import { Action } from '@reactables/core';
import { BaseForm, BaseFormState } from '../../Models/Controls';
import { MarkTouched } from '../../Models/Payloads';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getControlBranch } from '../../Helpers/getControlBranch';

export const markControlAsTouched = <T>(
  { form }: BaseFormState<T>,
  action: Action<MarkTouched>,
): BaseFormState<T> => {
  const {
    payload: { controlRef, markAll },
  } = action;

  const controls = markAll
    ? getControlBranch(controlRef, form)
    : getAncestorControls(controlRef, form);

  return {
    form: Object.entries(form).reduce(
      (acc, [key, control]) => ({
        ...acc,
        [key]: {
          ...control,
          touched: controls.includes(control) ? true : control.touched,
        },
      }),
      {} as BaseForm<T>,
    ),
    action,
  };
};
