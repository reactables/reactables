import { BaseControl, FormControl, BaseForm, Form } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getFormKey } from './getFormKey';

// Includes the original control of interest unless excludeSelf === true
export const getDescendantControls = <T extends BaseForm<unknown> | Form<unknown>>(
  controlRef: ControlRef,
  form: T,
  excludeSelf = false,
): (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[] => {
  const result = Object.entries(form)
    .filter(([key]) => {
      if (!controlRef.length) return true;

      const childRef = key.split('.');

      return controlRef.every((refKey, index) => {
        return refKey == childRef[index];
      });
    })
    .map((entry) => entry[1]) as (T extends Form<unknown>
    ? FormControl<unknown>
    : BaseControl<unknown>)[];

  return result.filter((control) =>
    excludeSelf ? getFormKey(control.controlRef) !== getFormKey(controlRef) : true,
  );
};
