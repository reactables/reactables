import { Action } from '@reactables/core';
import { BaseForm, BaseFormState } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getFormKey } from '../../Helpers/getFormKey';

export const markControlAsUntouched = <T>(
  { form }: BaseFormState<T>,
  action: Action<ControlRef>,
): BaseFormState<T> => {
  const { payload: controlRef } = action;

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

  return { form: result as BaseForm<T>, action };
};
