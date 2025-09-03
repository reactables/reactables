import { BaseControl, FormControl, BaseForm, Form } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from './getControl';

// Includes the original control of interest unless excludeSelf === true
export const getDescendantControls = <T extends BaseForm<unknown> | Form<unknown>>(
  controlRef: ControlRef,
  form: T,
  excludeSelf = false,
): (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[] => {
  if (!controlRef.length) {
    return Object.values(form).filter(({ controlRef }) =>
      excludeSelf ? controlRef.length !== 0 : true,
    ) as (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[];
  }

  const control = getControl(controlRef, form);
  const { value, config } = control;
  let descendants: (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[] = [];

  if (Array.isArray(config.controls)) {
    // If control is a Form Array
    descendants = (value as unknown[]).reduce(
      (
        acc: (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[],
        item,
        index,
      ) => {
        return acc.concat(getDescendantControls(controlRef.concat(index), form));
      },
      [],
    ) as (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[];
  } else if (config.controls) {
    // If control is a Form Group
    descendants = Object.keys(value as object).reduce(
      (acc: (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[], key) => {
        return acc.concat(getDescendantControls(controlRef.concat(key), form));
      },
      [],
    ) as (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[];
  }

  if (excludeSelf) return descendants;

  return (
    [control] as (T extends Form<unknown> ? FormControl<unknown> : BaseControl<unknown>)[]
  ).concat(descendants || []);
};
