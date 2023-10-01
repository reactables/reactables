import { FormArrayConfig, FormGroupConfig } from '../Models';
import {
  BaseArrayControl,
  BaseGroupControl,
  BaseAbstractControl,
} from '../Models/Controls';

export const getChildControls = (
  control: BaseAbstractControl<unknown>,
): BaseAbstractControl<unknown>[] => {
  const controls = (<FormGroupConfig | FormArrayConfig>control.config).controls;
  if (controls && !(controls instanceof Array)) {
    return [control].concat(
      Object.values((<BaseGroupControl<unknown>>control).controls).reduce(
        (acc: BaseAbstractControl<unknown>[], control) =>
          acc.concat(getChildControls(control)),
        [],
      ),
    );
  } else if (controls && controls instanceof Array) {
    return [control].concat(
      (<BaseArrayControl<unknown>>control).controls.reduce(
        (
          acc: BaseAbstractControl<unknown>[],
          control,
        ): BaseAbstractControl<unknown>[] =>
          acc.concat(getChildControls(control)),
        [],
      ),
    );
  }
  return [control];
};
