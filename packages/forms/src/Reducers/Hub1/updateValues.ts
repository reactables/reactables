import { Action } from '@reactables/core';
import { BaseFormState, BaseControl } from '../../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../../Models';
import { ControlChange } from '../../Models/Payloads';
import { getFormKey } from '../../Helpers/getFormKey';
import { updateAncestorValues, UPDATE_ANCESTOR_VALUES } from './updateAncestorValues';
import { isChildRef } from '../../Helpers/isChildRef';
import { FormErrors } from '../../Models';
import isEqual from 'lodash.isequal';
import { getErrors } from './getErrors';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';

const UPDATE_DESCENDANT_VALUES = 'UPDATE_DESCENDANT_VALUES';
const updateDescendants = (
  state: BaseFormState<unknown>,
  { payload: { controlRef, value } }: Action<ControlChange<unknown>>,
): BaseFormState<unknown> => {
  const descendants = getDescendantControls(controlRef, state.form, true).map(
    (control) => [getFormKey(control.controlRef), control] as [string, BaseControl<unknown>],
  );

  const result = descendants.reduce(
    (acc: BaseFormState<unknown>, [key, control]) => {
      if (isChildRef(control.controlRef, controlRef)) {
        const childValue = value[control.controlRef.at(-1)] as unknown;
        const validatorErrors: FormErrors = getErrors(control, value);

        const newControl = {
          ...control,
          value: childValue,
          validatorErrors,
          dirty: !isEqual(childValue, control.pristineValue),
        };

        acc = {
          form: {
            ...acc.form,
            [key]: newControl,
          },
          changedControls: {
            ...acc.changedControls,
            [newControl.key]: newControl,
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
    },
    { form: {}, changedControls: {} },
  );

  return {
    form: { ...state.form, ...result.form },
    changedControls: { ...result.changedControls },
  };
};

// Will only update child controls that are present.
// Use AddControl/RemoveControl action reducers to add/remove control
export const updateValues = <T>(
  { form, changedControls = {}, removedControls = {} }: BaseFormState<T>,
  action: Action<ControlChange<unknown>>,
  mergeChanges = false,
): BaseFormState<T> => {
  const {
    payload: { controlRef, value },
  } = action;
  // Update its own value
  const ctrlKey = getFormKey(controlRef);

  const validatorErrors: FormErrors = getErrors(form[ctrlKey], value);

  const newControl = {
    ...form[ctrlKey],
    validatorErrors,
    dirty: !isEqual(value, form[ctrlKey].pristineValue),
    value,
  };

  let result: BaseFormState<T> = {
    form: {
      ...form,
      [ctrlKey]: newControl,
    },
    changedControls: { [newControl.key]: newControl },
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
    }) as BaseFormState<T>;
  }

  // Update its Ancestors
  if (controlRef.length) {
    result = {
      ...result,
      form: updateAncestorValues(result.form, {
        type: UPDATE_ANCESTOR_VALUES,
        payload: { controlRef, value },
      }),
    };
  }

  const changedAncestorControls = getAncestorControls(controlRef, result.form).reduce(
    (acc: { [key: string]: BaseControl<unknown> }, control) => ({
      ...acc,
      [control.key]: control,
    }),
    {},
  );

  const mergedResult = {
    ...result,
    changedControls: {
      ...(mergeChanges ? changedControls : undefined),
      ...changedAncestorControls,
      ...result.changedControls,
    },
    removedControls: mergeChanges ? removedControls : undefined,
  };

  return mergedResult;
};
