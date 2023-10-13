import { BaseForm, Form, BaseControl, FormControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getFormKey } from './getFormKey';

export const getControl = <T extends BaseForm<unknown> | Form<unknown>>(
  controlRef: ControlRef,
  form: T,
): T extends BaseForm<unknown>
  ? BaseControl<unknown>
  : FormControl<unknown> => {
  return form[getFormKey(controlRef)] as T extends BaseForm<unknown>
    ? BaseControl<unknown>
    : FormControl<unknown>;
};
