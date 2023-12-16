import { Action } from '@reactables/core';
import { BaseForm, BaseFormState } from '../../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../../Models';
import { ControlChange } from '../../Models/Payloads';
import { getFormKey } from '../../Helpers/getFormKey';
import { updateAncestorValues, UPDATE_ANCESTOR_VALUES } from './updateAncestorValues';
import { isChildRef } from '../../Helpers/isChildRef';
import { FormErrors } from '../../Models';
import isEqual from 'lodash.isequal';
import { getErrors } from './getErrors';

const UPDATE_DESCENDANT_VALUES = 'UPDATE_DESCENDANT_VALUES';
const updateDescendants = <T>(
  form: BaseForm<T>,
  { payload: { controlRef, value } }: Action<ControlChange<unknown>>,
): BaseForm<T> => {
  const result = Object.entries(form).reduce((acc, [key, control]) => {
    if (isChildRef(control.controlRef, controlRef)) {
      const childValue = value[control.controlRef.at(-1)] as unknown;
      const validatorErrors: FormErrors = getErrors(control, value);

      acc = {
        ...acc,
        [key]: {
          ...control,
          value: childValue,
          validatorErrors,
          dirty: !isEqual(childValue, control.pristineValue),
        },
      };

      const { controls: configControls } = control.config as FormArrayConfig | FormGroupConfig;

      if (configControls) {
        acc = updateDescendants(acc, {
          type: UPDATE_DESCENDANT_VALUES,
          payload: { controlRef: control.controlRef, value: childValue },
        });
      }
    }

    return acc;
  }, form);

  return result;
};

// Will only update child controls that are present.
// Use AddControl/RemoveControl action reducers to add/remove control
export const updateValues = <T>(
  { form }: BaseFormState<T>,
  action: Action<ControlChange<unknown>>,
): BaseFormState<T> => {
  const {
    payload: { controlRef, value },
  } = action;
  // Update its own value
  const ctrlKey = getFormKey(controlRef);

  const validatorErrors: FormErrors = getErrors(form[ctrlKey], value);

  let result: BaseForm<T> = {
    ...form,
    [ctrlKey]: {
      ...form[ctrlKey],
      validatorErrors,
      dirty: !isEqual(value, form[ctrlKey].pristineValue),
      value,
    },
  };

  const { controls: configControls } = form[ctrlKey].config as FormArrayConfig | FormGroupConfig;

  // Update its children
  if (configControls) {
    result = updateDescendants(result, {
      type: UPDATE_DESCENDANT_VALUES,
      payload: {
        controlRef,
        value,
      },
    });
  }

  // Update its Ancestors
  if (controlRef.length) {
    result = updateAncestorValues(result, {
      type: UPDATE_ANCESTOR_VALUES,
      payload: { controlRef, value },
    });
  }

  return { form: result, action };
};
