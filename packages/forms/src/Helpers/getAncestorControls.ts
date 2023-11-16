import { BaseControl, BaseForm, Form, FormControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';
import { getFormKey } from './getFormKey';

// Includes the original control of interest unless excludeSelf === true
export const getAncestorControls = <T extends BaseForm<unknown> | Form<unknown>>(
  controlRef: ControlRef,
  form: T,
  excludeSelf = false,
): (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[] => {
  const formControls = controlRef.reduce(
    (acc, key) => {
      const currentRef = acc.currentRef.concat(key);
      const formControls = acc.formControls.concat(getControl(currentRef, form));
      return {
        currentRef,
        formControls,
      };
    },
    {
      currentRef: [] as ControlRef,
      formControls: [] as BaseControl<unknown>[],
    },
  ).formControls as (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[];

  const root = form['root'] as T extends Form<unknown>
    ? FormControl<unknown>
    : BaseControl<unknown>;

  const result = [root].concat(formControls);

  return result.filter((control) =>
    excludeSelf ? getFormKey(control.controlRef) !== getFormKey(controlRef) : true,
  );
};
