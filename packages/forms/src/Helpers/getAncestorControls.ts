import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from './getControl';

export const getAncestorControls = (
  controlRef: ControlRef,
  form: AbstractControl<unknown>,
): AbstractControl<unknown>[] => {
  const formControls = controlRef.reduce(
    (acc, key) => {
      const currentRef = acc.currentRef.concat(key);
      const formControls = acc.formControls.concat(
        getControl(currentRef, form),
      );
      return {
        currentRef,
        formControls,
      };
    },
    {
      currentRef: [] as ControlRef,
      formControls: [] as AbstractControl<unknown>[],
    },
  ).formControls;

  return [form].concat(formControls);
};
