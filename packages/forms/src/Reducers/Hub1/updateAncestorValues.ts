import { Action } from '@reactables/core';
import { BaseForm } from '../../Models/Controls';
import { UpdateValuesPayload } from '../../Models/Payloads';
import { getControl } from '../../Helpers/getControl';
import { getFormKey } from '../../Helpers/getFormKey';
import { getErrors } from './getErrors';
import isEqual from 'lodash.isequal';

export const UPDATE_ANCESTOR_VALUES = 'UPDATE_ANCESTOR_VALUES';
export const updateAncestorValues = <T>(
  form: BaseForm<T>,
  { payload: { controlRef, value } }: Action<UpdateValuesPayload<unknown>>,
): BaseForm<T> => {
  if (controlRef.length) {
    const parentRef = controlRef.slice(0, -1);
    const parentControl = getControl(parentRef, form);
    const parentFormKey = getFormKey(parentControl.controlRef);
    const childKey = controlRef.slice(-1)[0];

    let newValue: unknown;

    // If parent is a Form Array
    if (Array.isArray(parentControl.value)) {
      newValue = parentControl.value.map((item: unknown, index) =>
        index === childKey ? value : item,
      );
    } else {
      // If parent is a Form Group
      newValue = {
        ...(parentControl.value as object),
        [childKey]: value,
      };
    }

    const newParentControl = {
      ...parentControl,
      validatorErrors: getErrors(parentControl, newValue),
      value: newValue,
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
