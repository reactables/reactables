import {
  BaseArrayControl,
  BaseGroupControl,
  BaseControl,
} from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';

export const getControl = (
  controlRef: ControlRef,
  control: BaseControl<unknown>,
): BaseControl<unknown> => {
  if (!controlRef.length) {
    return control;
  }

  const result: BaseControl<unknown> = controlRef.reduce(
    (acc, key): BaseControl<unknown> => {
      if (typeof key === 'string') {
        return (<BaseGroupControl<unknown>>acc).controls[key];
      }

      return (<BaseArrayControl<unknown>>acc).controls[key];
    },
    control,
  );

  return result;
};
