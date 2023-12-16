import { Action } from '@reactables/core';
import { BaseForm } from '../../Models/Controls';
import { getControl } from '../../Helpers/getControl';
import { getFormKey } from '../../Helpers/getFormKey';
import { updateAncestorValues, UPDATE_ANCESTOR_VALUES } from './updateAncestorValues';
import { ControlRef } from '../../Models/ControlRef';
import { getErrors } from './getErrors';
import isEqual from 'lodash.isequal';

export const UPDATE_ANCESTOR_VALUES_REMOVE_CONTROL = 'UPDATE_ANCESTOR_VALUES_REMOVE_CONTROL';
export const updateAncestorValuesRemoveControl = <T>(
  form: BaseForm<T>,
  { payload: controlRef }: Action<ControlRef>,
): BaseForm<T> => {
  if (controlRef.length) {
    const parentRef = controlRef.slice(0, -1);
    const parentControl = getControl(parentRef, form);
    const parentFormKey = getFormKey(parentControl.controlRef);
    const childKey = controlRef.slice(-1)[0];

    let newValue: unknown;

    // If parent is a Form Array
    if (Array.isArray(parentControl.value)) {
      newValue = parentControl.value.filter((item, index) => index !== childKey);
    } else {
      // If parent is a Form Group
      newValue = {
        ...(parentControl.value as object),
      };

      delete newValue[childKey];
    }

    const newParentControl = {
      ...parentControl,
      value: newValue,
      validatorErrors: getErrors(parentControl, newValue),
      dirty: !isEqual(newValue, parentControl.pristineValue),
    };

    return updateAncestorValues(
      {
        ...form,
        [parentFormKey]: newParentControl,
      },
      {
        type: UPDATE_ANCESTOR_VALUES,
        payload: { controlRef: parentRef, value: newValue },
      },
    );
  }

  return form;
};
