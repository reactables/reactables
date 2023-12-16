import { Form, BaseForm, FormControl } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlRef } from '../../Models/ControlRef';
import { mergeBranchErrors } from './mergeBranchErrors';
import { getDescendantControls } from '../../Helpers/getDescendantControls';

export const mergeRemoveControl = <T>(
  state: Form<T>,
  form: BaseForm<T>,
  controlRef: ControlRef,
) => {
  const parentRef = controlRef.slice(0, -1);

  const controlBranch = getControlBranch(parentRef, form).reduce((acc, baseControl) => {
    const key = getFormKey(baseControl.controlRef);

    const existingControl = getControlBranch(parentRef, state).find(
      (control) => baseControl.key === control.key,
    );

    return {
      ...acc,
      [key]: {
        ...existingControl,
        ...baseControl,
      },
    };
  }, {}) as { [key: string]: FormControl<unknown> };

  const removedControls = { ...state };
  const descendants = getDescendantControls(parentRef, state);

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
