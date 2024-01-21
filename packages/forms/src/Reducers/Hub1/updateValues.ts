import { Action } from '@reactables/core';
import { BaseFormState, BaseControl } from '../../Models/Controls';
import { FormArrayConfig, FormControlConfig, FormGroupConfig } from '../../Models';
import { UpdateValuesPayload } from '../../Models/Payloads';
import { getFormKey } from '../../Helpers/getFormKey';
import { updateAncestorValues, UPDATE_ANCESTOR_VALUES } from './updateAncestorValues';
import { isChildRef } from '../../Helpers/isChildRef';
import { FormErrors } from '../../Models';
import isEqual from 'lodash.isequal';
import { getErrors } from './getErrors';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';
import { RxFormProviders } from '../../RxForm/RxForm';

const UPDATE_DESCENDANT_VALUES = 'UPDATE_DESCENDANT_VALUES';
const updateDescendants = (
  state: BaseFormState<unknown>,
  { payload: { controlRef, value } }: Action<UpdateValuesPayload<unknown>>,
  providers: RxFormProviders,
): BaseFormState<unknown> => {
  const descendants = getDescendantControls(controlRef, state.form, true).map(
    (control) => [getFormKey(control.controlRef), control] as [string, BaseControl<unknown>],
  );

  const result = descendants.reduce(
    (acc: BaseFormState<unknown>, [key, control]) => {
      if (isChildRef(control.controlRef, controlRef)) {
        const childValue = value[control.controlRef.at(-1)] as unknown;
        const validatorErrors: FormErrors = getErrors(control, value, providers);

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
          acc = updateDescendants(
            acc,
            {
              type: UPDATE_DESCENDANT_VALUES,
              payload: { controlRef: control.controlRef, value: childValue },
            },
            providers,
          );
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
// Use AddControlPayload/RemoveControl action reducers to add/remove control
export const updateValues = <T>(
  { form, changedControls = {}, removedControls = {} }: BaseFormState<T>,
  action: Action<UpdateValuesPayload<unknown>>,
  providers: RxFormProviders,
  mergeChanges = false,
): BaseFormState<T> => {
  const { normalizers } = providers;
  const {
    payload: { controlRef, value },
  } = action;
  // Update its own value
  const ctrlKey = getFormKey(controlRef);

  let newValue = value;

  const { config } = form[ctrlKey];

  if ((config as FormControlConfig<unknown>).normalizers) {
    newValue = (config as FormControlConfig<unknown>).normalizers.reduce(
      (acc: unknown, normalizer) => {
        if (!normalizers[normalizer]) {
          throw `You have not provided a normalizer for "${normalizer}"`;
        }
        return normalizers[normalizer](acc);
      },
      value,
    );
  }

  const validatorErrors: FormErrors = getErrors(form[ctrlKey], newValue, providers);

  const newControl = {
    ...form[ctrlKey],
    validatorErrors,
    dirty: !isEqual(value, form[ctrlKey].pristineValue),
    value: newValue,
  };

  let result: BaseFormState<T> = {
    form: {
      ...form,
      [ctrlKey]: newControl,
    },
    changedControls: { [newControl.key]: newControl },
  };

  const { controls: configControls } = config as FormArrayConfig | FormGroupConfig;

  // Update its children
  if (configControls) {
    result = updateDescendants(
      result,
      {
        type: UPDATE_DESCENDANT_VALUES,
        payload: {
          controlRef,
          value: newValue,
        },
      },
      providers,
    ) as BaseFormState<T>;
  }

  // Update its Ancestors
  if (controlRef.length) {
    result = {
      ...result,
      form: updateAncestorValues(
        result.form,
        {
          type: UPDATE_ANCESTOR_VALUES,
          payload: { controlRef, value: newValue },
        },
        providers,
      ),
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
