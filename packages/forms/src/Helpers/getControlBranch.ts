import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from './getControl';
import { getAncestorControls } from './getAncestorControls';
import { getChildControls } from './getChildControls';

export const getControlBranch = (
  controlRef: ControlRef,
  form: AbstractControl<unknown>,
): AbstractControl<unknown>[] => {
  const ancestors = getAncestorControls(controlRef, form);
  const childControls = getChildControls(getControl(controlRef, form)).slice(1);

  return ancestors.concat(childControls);
};
