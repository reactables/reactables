import { Action } from '@reactables/core';
import { BaseFormState, BaseControl } from '../../Models/Controls';
import { AddControlPayload } from '../../Models/Payloads';
import { ControlRef } from '../../Models';
import { FormArrayConfig } from '../../Models';
import { buildState } from '../../Helpers/buildFormState';
import { getControl } from '../../Helpers/getControl';
import {
  updateAncestorValuesAddControl,
  UPDATE_ANCESTOR_VALUES_ADD_CONTROL,
} from './updateAncestorValuesAddControl';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { RxFormProviders } from '../../RxForm/RxForm';
import { controlRefCheck } from '../../Helpers/controlRefCheck';

export const pushControl = <T>(
  state: BaseFormState<T>,
  action: Action<AddControlPayload>,
  providers: RxFormProviders,
  mergeChanges = false,
): BaseFormState<T> => {
  let newControlRef: ControlRef;

  const {
    payload: { config, controlRef },
  } = action;

  controlRefCheck(controlRef);

  const existingControl = getControl(controlRef, state.form);

  if (!existingControl) throw 'You are attempting to push to a control that does not exist';

  // If controlRef exists we are adding control to a Form Array
  if (Array.isArray((existingControl.config as FormArrayConfig).controls)) {
    newControlRef = controlRef.concat((existingControl.value as Array<unknown>).length);
  } else {
    throw 'You are attempting to push to a control that is not a Form Array';
  }

  const newForm = buildState(config, state.form, newControlRef, providers);
  const newValue = getControl(newControlRef, newForm).value;

  const ancestorsUpdated = updateAncestorValuesAddControl(
    newForm,
    {
      type: UPDATE_ANCESTOR_VALUES_ADD_CONTROL,
      payload: { controlRef: newControlRef, value: newValue },
    },
    providers,
  );

  const changedControls = getControlBranch(newControlRef, ancestorsUpdated).reduce(
    (acc: { [key: string]: BaseControl<unknown> }, control) => ({ ...acc, [control.key]: control }),
    {},
  );

  return {
    form: ancestorsUpdated,
    changedControls: {
      ...(mergeChanges ? state.changedControls || {} : undefined),
      ...changedControls,
    },
    removedControls: mergeChanges ? state.removedControls || {} : undefined,
  };
};
