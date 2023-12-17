import { Form, BaseForm, FormControl } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlRef } from '../../Models/ControlRef';
import { mergeBranchErrors } from './mergeBranchErrors';

export const mergeRemoveControl = <T>(
  state: Form<T>,
  form: BaseForm<T>,
  controlRef: ControlRef,
) => {
  const parentRef = controlRef.slice(0, -1);
  const existingBranch = getControlBranch(parentRef, state);
  const descendants = existingBranch.filter(
    (control) => control.controlRef.length < parentRef.length,
  );

  const controlBranch = getControlBranch(parentRef, form).reduce((acc, baseControl) => {
    const key = getFormKey(baseControl.controlRef);

    const existingControl = existingBranch.find((control) => baseControl.key === control.key);

    return {
      ...acc,
      [key]: {
        ...existingControl,
        ...baseControl,
      },
    };
  }, {}) as { [key: string]: FormControl<unknown> };

  const removedControls = { ...state };

  descendants.forEach((control) => {
    delete removedControls[getFormKey(control.controlRef)];
  });

  return mergeBranchErrors(
    {
      ...removedControls,
      ...controlBranch,
    },
    parentRef,
  );
};
