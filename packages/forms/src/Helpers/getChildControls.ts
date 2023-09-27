import { FormArrayConfig, FormGroupConfig } from '../Models';
import {
  BaseArrayControl,
  BaseGroupControl,
  BaseControl,
} from '../Models/Controls';

export const getChildControls = (
  control: BaseControl<unknown>,
): BaseControl<unknown>[] => {
  const controls = (<FormGroupConfig | FormArrayConfig>control.config).controls;
  if (controls && !(controls instanceof Array)) {
    return [control].concat(
      Object.values((<BaseGroupControl<unknown>>control).controls).reduce(
        (acc: BaseControl<unknown>[], control) =>
          acc.concat(getChildControls(control)),
        [],
      ),
    );
  } else if (controls && controls instanceof Array) {
    return [control].concat(
      (<BaseArrayControl<unknown>>control).controls.reduce(
        (acc: BaseControl<unknown>[], control): BaseControl<unknown>[] =>
          acc.concat(getChildControls(control)),
        [],
      ),
    );
  }
  return [control];
};
