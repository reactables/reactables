import { Action } from '@reactables/core';
import { BaseFormState, BaseControl } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getControl } from '../../Helpers/getControl';
import { updateAncestorValues, UPDATE_ANCESTOR_VALUES } from './updateAncestorValues';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { buildState } from '../../Helpers/buildFormState';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { getFormKey } from '../../Helpers/getFormKey';
import { RxFormProviders } from '../../RxForm/RxForm';
import { controlRefCheck } from '../../Helpers/controlRefCheck';

export const resetControl = <T>(
  state: BaseFormState<T>,
  action: Action<ControlRef>,
  providers: RxFormProviders,
  mergeChanges = false,
): BaseFormState<T> => {
  const { form } = state;
  const { payload: controlRef } = action;
  controlRefCheck(controlRef);
  const controlToReset = getControl(controlRef, form);

  const descendantsRemoved = { ...form };

  const descendants = getDescendantControls(controlRef, form);
  const descendantKeys = descendants.map(({ controlRef }) => getFormKey(controlRef));

  descendantKeys.forEach((key) => {
    delete descendantsRemoved[key];
  });

  // Remove all descendants

  const restoredControls = buildState(
    controlToReset.config,
    descendantsRemoved,
    controlToReset.controlRef,
    providers,
  );

  const restoredControlValue = getControl(controlRef, restoredControls).value;

  const result = updateAncestorValues(
    restoredControls,
    {
      type: UPDATE_ANCESTOR_VALUES,
      payload: { controlRef, value: restoredControlValue },
    },
    providers,
  );

  const changedControls = {
    ...(mergeChanges ? state.changedControls || {} : undefined),
    ...getControlBranch(controlRef, result).reduce(
      (acc: { [key: string]: BaseControl<unknown> }, control) => ({
        ...acc,
        [control.key]: control,
      }),
      {},
    ),
  };

  const removedControls = {
    ...(mergeChanges ? state.removedControls || {} : undefined),
    [controlToReset.key]: controlToReset,
  };

  // If control is removed, we can delete it from the changedControls check
  descendants
    .map(({ key }) => key)
    .forEach((key) => {
      delete changedControls[key];
    });

  return {
    form: result,
    changedControls,
    removedControls,
  };
};
