import { FormArrayConfig, FormGroupConfig } from '../Models';
import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';

export const getChildControls = (
  control: AbstractControl<unknown>,
): AbstractControl<unknown>[] => {
  const controls = (<FormGroupConfig | FormArrayConfig>control.config).controls;
  if (controls && !(controls instanceof Array)) {
    return [control].concat(
      Object.values((<FormGroup<unknown>>control).controls).reduce(
        (acc: AbstractControl<unknown>[], control) =>
          acc.concat(getChildControls(control)),
        [],
      ),
    );
  } else if (controls && controls instanceof Array) {
    return [control].concat(
      (<FormArray<unknown>>control).controls.reduce(
        (
          acc: AbstractControl<unknown>[],
          control,
        ): AbstractControl<unknown>[] => acc.concat(getChildControls(control)),
        [],
      ),
    );
  }
  return [control];
};
