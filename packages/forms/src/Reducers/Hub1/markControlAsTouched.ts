import { Action } from '@hub-fx/core';
import { BaseForm } from '../../Models/Controls';
import { MarkTouched } from '../../Models/Payloads';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getControlBranch } from '../../Helpers/getControlBranch';

export const markControlAsTouched = <T>(
  form: BaseForm<T>,
  { payload: { controlRef, markAll } }: Action<MarkTouched>,
) => {
  const controls = markAll
    ? getControlBranch(controlRef, form)
    : getAncestorControls(controlRef, form);

  return Object.entries(form).reduce(
    (acc, [key, control]) => ({
      ...acc,
      [key]: {
        ...control,
        touched: controls.includes(control) ? true : control.touched,
      },
    }),
    {} as BaseForm<T>,
  );
};
