import { Action } from '@reactables/core';
import { Form, FormControl } from '../../Models/Controls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { getFormKey } from '../../Helpers/getFormKey';
import { ControlRef } from '../../Models';

export const asyncValidation = (
  form: Form<any> | null,
  { payload: controlRef }: Action<ControlRef>,
): Form<any> => {
  const updatedSelfAndAncestors = getAncestorControls(controlRef, form!).reduce((acc, control) => {
    const isChangedControl = getFormKey(control.controlRef) === getFormKey(controlRef);
    return {
      ...acc,
      [getFormKey(control.controlRef)]: {
        ...control,
        pending: true,
        asyncValidateInProgress: isChangedControl
          ? ({
              ...control.config.asyncValidators?.reduce(
                (acc, _, index) => ({ ...acc, [index]: true }),
                {},
              ),
            } as FormControl<any>['asyncValidateInProgress'])
          : (control as FormControl<any>).asyncValidateInProgress,
      },
    };
  }, {});

  return {
    ...form,
    ...updatedSelfAndAncestors,
  } as Form<any>;
};
