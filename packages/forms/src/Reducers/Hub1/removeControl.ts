import { Action } from '@reactables/core';
import { BaseForm, BaseFormState, BaseControl } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getControl } from '../../Helpers/getControl';
import { getFormKey } from '../../Helpers/getFormKey';
import {
  updateAncestorValuesRemoveControl,
  UPDATE_ANCESTOR_VALUES_REMOVE_CONTROL,
} from './updateAncestorValuesRemoveControl';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { RxFormProviders } from '../../RxForm/RxForm';
import { controlRefCheck } from '../../Helpers/controlRefCheck';

export const removeControl = <T>(
  state: BaseFormState<T>,
  action: Action<ControlRef>,
  providers: RxFormProviders,
  mergeChanges = false,
): BaseFormState<T> => {
  const { form } = state;
  const { payload: controlRef } = action;

  controlRefCheck(controlRef);

  const controlToRemove = getControl(controlRef, form);

  if (!controlToRemove) {
    throw 'Control not found';
  }

  // Can't remove the root of the form
  if (!controlRef.length) return { form };

  const parentRef = controlRef.slice(0, -1);

  const parentIsFormArray = Array.isArray(getControl(parentRef, form).config.controls);

  const descendants = getDescendantControls(controlRef, form);
  const descendantkeys = descendants.map(({ controlRef }) => getFormKey(controlRef));

  const controlsRemoved = { ...form };

  descendantkeys.forEach((key) => {
    delete controlsRemoved[key];
  });

  // Remove control and all descendants
  const controlRemoved: BaseForm<T> = Object.entries(controlsRemoved).reduce(
    (acc, [key, control]) => {
      // May need to reindex array items of removed control
      // if it was part of a Form Array.
      if (parentIsFormArray) {
        const oldIndex = control.controlRef.at(parentRef.length) as number;

        if (
          // If control is descendant.
          parentRef.every((ref, index) => control.controlRef[index] === ref) &&
          control.controlRef.length > parentRef.length &&
          // If the array item index was greater than the index of item removed
          // we need to decrement its index by 1.
          oldIndex > (controlRef.at(-1) as number)
        ) {
          const newRef: ControlRef = parentRef
            .concat(oldIndex - 1)
            .concat(control.controlRef.slice(parentRef.length + 1));

          return {
            ...acc,
            [getFormKey(newRef)]: {
              ...control,
              controlRef: newRef,
            },
          };
        }
      }

      return { ...acc, [key]: control };
    },
    {},
  );

  const result = updateAncestorValuesRemoveControl(
    controlRemoved,
    {
      type: UPDATE_ANCESTOR_VALUES_REMOVE_CONTROL,
      payload: controlRef,
    },
    providers,
  );

  let _changedControls = {
    ...(mergeChanges ? state._changedControls || {} : undefined),
    ...getAncestorControls(controlRef.slice(0, -1), result).reduce(
      (acc: { [key: string]: BaseControl<unknown> }, control) => ({
        ...acc,
        [control.key]: control,
      }),
      {},
    ),
  };

  // Check for reindexing for changed controls
  if (parentIsFormArray) {
    _changedControls = Object.entries(_changedControls).reduce((acc, [key, control]) => {
      const oldIndex = control.controlRef.at(parentRef.length) as number;

      if (
        // If control is descendant.
        parentRef.every((ref, index) => control.controlRef[index] === ref) &&
        control.controlRef.length > parentRef.length &&
        // If the array item index was greater than the index of item removed
        // we need to decrement its index by 1.
        oldIndex > (controlRef.at(-1) as number)
      ) {
        const newRef: ControlRef = parentRef
          .concat(oldIndex - 1)
          .concat(control.controlRef.slice(parentRef.length + 1));

        return {
          ...acc,
          [getFormKey(newRef)]: {
            ...control,
            controlRef: newRef,
          },
        };
      } else {
        return { ...acc, [key]: control };
      }
    }, {});
  }

  const _removedControls = {
    ...(mergeChanges ? state._removedControls || {} : undefined),
    [controlToRemove.key]: controlToRemove,
  };

  descendants
    .map(({ key }) => key)
    .forEach((key) => {
      delete _changedControls[key];
    });

  return {
    form: result,
    _changedControls,
    _removedControls,
  };
};
