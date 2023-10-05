import {
  BaseArrayControl,
  BaseGroupControl,
  BaseAbstractControl,
} from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';

export const getControl = (
  controlRef: ControlRef,
  control: BaseAbstractControl<unknown>,
): BaseAbstractControl<unknown> => {
  if (!controlRef.length) {
    return control;
  }

  const result: BaseAbstractControl<unknown> = controlRef.reduce(
    (acc, key): BaseAbstractControl<unknown> => {
      if (typeof key === 'string') {
        return (<BaseGroupControl<unknown>>acc).controls[key];
      }

      return (<BaseArrayControl<unknown>>acc).controls[key];
    },
    control,
  );

  return result;
};
