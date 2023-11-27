import { FormControl, Form, BaseForm, BaseControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from './getControl';

export const getArrayItems = <T extends BaseForm<unknown> | Form<unknown>>(
  controlRef: ControlRef,
  form: T,
): T extends BaseForm<unknown> ? BaseControl<unknown>[] : FormControl<unknown>[] => {
  if (!Array.isArray(getControl(controlRef, form).config.controls)) {
    throw `${controlRef.join('.')} is not a Form Array control`;
  }

  return Object.values(form)
    .filter((control) => {
      const isItem =
        controlRef.every((key, index) => key === control.controlRef[index]) &&
        control.controlRef.length === controlRef.length + 1 &&
        typeof control.controlRef[controlRef.length] === 'number';

      return isItem;
    })
    .sort(
      (a, b) => +a.controlRef.slice(-1) - +b.controlRef.slice(-1),
    ) as T extends BaseForm<unknown> ? BaseControl<unknown>[] : FormControl<unknown>[];
};
