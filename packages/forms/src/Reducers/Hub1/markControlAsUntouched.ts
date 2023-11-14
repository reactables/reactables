import { Action } from '@hub-fx/core';
import { BaseForm } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getFormKey } from '../../Helpers/getFormKey';

export const markControlAsUntouched = <T>(
  form: BaseForm<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const descendants = getDescendantControls(controlRef, form);
  let result = Object.entries(form).reduce(
    (acc, [key, control]) => ({
      ...acc,
      [key]: {
        ...control,
        touched: descendants.includes(control) ? false : control.touched,
      },
    }),
    {} as BaseForm<T>,
  );

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

  return result;
};
