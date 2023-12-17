import { FormControl, Form, BaseForm, BaseControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from './getControl';
import { getFormKey } from './getFormKey';

export const getArrayItems = <T extends BaseForm<unknown> | Form<unknown>>(
  controlRef: ControlRef,
  form: T,
): T extends BaseForm<unknown> ? BaseControl<unknown>[] : FormControl<unknown>[] => {
  const control = getControl(controlRef, form);
  if (!Array.isArray(control.config.controls)) {
    throw `${controlRef.join('.')} is not a Form Array control`;
  }

  const result = (control.value as unknown[]).map(
    (_, index) => form[getFormKey(controlRef.concat(index))],
  );

  return result as T extends BaseForm<unknown> ? BaseControl<unknown>[] : FormControl<unknown>[];
};
