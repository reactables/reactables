import { BaseControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';

export const getAncestorControls = (
  controlRef: ControlRef,
  form: BaseControl<unknown>,
): BaseControl<unknown>[] => {
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
      formControls: [] as BaseControl<unknown>[],
    },
  ).formControls;

  return [form].concat(formControls);
};
