import { ControlRef } from '../Models/ControlRef';
import { getAncestorControls } from './getAncestorControls';
import { getDescendantControls } from './getDescendantControls';
import { BaseControl, FormControl, BaseForm, Form } from '../Models/Controls';

export const getControlBranch = <T extends BaseForm<unknown> | Form<unknown>>(
  controlRef: ControlRef,
  form: T,
): (T extends Form<unknown>
  ? FormControl<unknown>
  : BaseControl<unknown>)[] => {
  const ancestors = getAncestorControls(controlRef, form);
  const childControls = getDescendantControls(controlRef, form).slice(1);

  return ancestors.concat(childControls);
};
