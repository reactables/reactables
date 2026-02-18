import { Action } from '@reactables/core';
import { BaseFormState, BaseControl, BaseForm } from '../../Models/Controls';
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
import { controlRefCheck } from '../../Helpers/controlRefCheck';

const checkKeys = (oldObj: object, newObj: object): void => {
  const oldKeys = Object.keys(oldObj).slice().sort().join();
  const newKeys = Object.keys(newObj).slice().sort().join();
  if (oldKeys !== newKeys) {
    console.warn(
      `You are trying to update multiple controls but the keys don't match. It is recommended your keys match. Old keys: ${oldKeys}. New Keys: ${newKeys}  `,
    );
  }
};

const UPDATE_DESCENDANT_VALUES = 'UPDATE_DESCENDANT_VALUES';
const updateDescendantValues = <T>(
  form: BaseForm<T>,
  { payload: { controlRef, value } }: Action<UpdateValuesPayload<unknown>>,
  providers: RxFormProviders,
): BaseForm<T> => {
  const descendants = getDescendantControls(controlRef, form, true).map(
    (control) => [getFormKey(control.controlRef), control] as [string, BaseControl<unknown>],
  );

  const result = descendants.reduce((acc: BaseForm<T>, [key, control]) => {
    if (isChildRef(control.controlRef, controlRef)) {
      const newChildValue = (value as { [key: string]: any })[
        control.controlRef[control.controlRef.length - 1] as string
      ] as unknown;
      const validatorErrors: FormErrors = getErrors(control, newChildValue, providers);
      const oldChildValue = control.value;

      const newControl = {
        ...control,
        value: newChildValue,
        validatorErrors,
        dirty: !isEqual(newChildValue, control.pristineValue),
      };

      acc = {
        ...acc,
        [key]: newControl,
      };

      const { controls: configControls } = control.config as FormArrayConfig | FormGroupConfig;

      if (configControls) {
        checkKeys(oldChildValue as object, newChildValue as object);
        acc = updateDescendantValues(
          acc,
          {
            type: UPDATE_DESCENDANT_VALUES,
            payload: { controlRef: control.controlRef, value: newChildValue },
          },
          providers,
        );
      }
    }

    return acc;
  }, form);

  return result;
};

// Will only update child controls that are present.
// Use AddControlPayload/RemoveControl action reducers to add/remove control
export const updateValues = <T>(
  { form, _changedControls = {}, _removedControls = {} }: BaseFormState<T>,
  action: Action<UpdateValuesPayload<unknown>>,
  providers: RxFormProviders,
  mergeChanges = false,
): BaseFormState<T> => {
  const { normalizers } = providers;
  const {
    payload: { controlRef, value },
  } = action;

  controlRefCheck(controlRef);

  // Update its own value
  const ctrlKey = getFormKey(controlRef);

  let newValue = value;
  const oldValue = form[ctrlKey].value;

  const { config } = form[ctrlKey];

  if ((config as FormControlConfig<unknown>).normalizers) {
    newValue = (config as FormControlConfig<unknown>).normalizers?.reduce(
      (acc: unknown, normalizer) => {
        if (!normalizers?.[normalizer]) {
          throw `You have not provided a normalizer for "${normalizer}"`;
        }
        return normalizers[normalizer](acc) as unknown;
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
    _changedControls: { [newControl.key]: newControl },
  };

  const { controls: configControls } = config as FormArrayConfig | FormGroupConfig;

  // Update its descendants
  if (configControls) {
    checkKeys(oldValue as object, newValue as object);
    const updatedDescendants = updateDescendantValues(
      result.form,
      {
        type: UPDATE_DESCENDANT_VALUES,
        payload: {
          controlRef,
          value: newValue,
        },
      },
      providers,
    );

    const changedDescendantControls = getDescendantControls(controlRef, updatedDescendants).reduce(
      (acc: { [key: string]: BaseControl<unknown> }, control) => ({
        ...acc,
        [control.key]: control,
      }),
      {},
    );

    result = {
      ...result,
      form: updatedDescendants,
      _changedControls: {
        ...result._changedControls,
        ...changedDescendantControls,
      },
    };
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
    _changedControls: {
      ...(mergeChanges ? _changedControls : undefined),
      ...changedAncestorControls,
      ...result._changedControls,
    },
    _removedControls: mergeChanges ? _removedControls : undefined,
  };

  return mergedResult;
};
