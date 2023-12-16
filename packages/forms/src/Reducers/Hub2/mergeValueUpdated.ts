import { Form, BaseForm, FormControl } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlRef } from '../../Models/ControlRef';
import { mergeBranchErrors } from './mergeBranchErrors';

export const mergeValueUpdated = <T>(state: Form<T>, form: BaseForm<T>, controlRef: ControlRef) => {
  const controlBranch = getControlBranch(controlRef, form).reduce((acc, control) => {
    const key = getFormKey(control.controlRef);
    return {
      ...acc,
      [key]: {
        ...state[key],
        ...control,
      },
    };
  }, {}) as { [key: string]: FormControl<unknown> };

  return mergeBranchErrors(
    {
      ...state,
      ...controlBranch,
    },
    controlRef,
  );
};
