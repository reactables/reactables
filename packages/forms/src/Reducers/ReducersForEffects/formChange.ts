import { Reducer, Action } from '@hub-fx/core';
import {
  AbstractControl,
  BaseControl,
  BaseGroupControl,
  BaseArrayControl,
  FormGroup,
  FormArray,
} from '../../Models/Controls';
import { FormGroupConfig, FormArrayConfig } from '../../Models';
import { FORMS_FORM_CHANGE } from '../../Actions/ActionsForEffects/formChange';

export const DEFAULT_CONTROL_ASYNC_PROPERTIES = {
  valid: false,
  errors: {},
  asyncValidateInProgress: {},
  pending: false,
};

export const formChange: Reducer<AbstractControl<unknown>> = (
  state = null,
  { payload }: Action<BaseControl<unknown>>,
) => {
  let newState: AbstractControl<unknown>;

  if (state === null) {
    newState = {
      ...DEFAULT_CONTROL_ASYNC_PROPERTIES,
      ...payload,
    };
  } else {
    newState = {
      ...state,
      ...payload,
    };
  }

  const controls = (<FormGroupConfig | FormArrayConfig>payload.config).controls;

  if (controls && !(controls instanceof Array)) {
    // If control is a FormGroup
    const baseGroupControl = <BaseGroupControl<unknown>>payload;
    const newFormGroup = <FormGroup<unknown>>newState;

    newFormGroup.controls = Object.entries(baseGroupControl.controls).reduce(
      (
        acc,
        [key, newBaseControl],
      ): { [key: string]: AbstractControl<unknown> } => {
        const oldControl = (<FormGroup<unknown>>state)?.controls[key];

        const action: Action<BaseControl<unknown>> = {
          type: FORMS_FORM_CHANGE,
          payload: newBaseControl,
        };

        acc[key] = formChange(oldControl, action);
        return acc;
      },
      {},
    );
  } else if (controls && controls instanceof Array) {
    // If control is a FormArray
    const baseArrayControl = <BaseArrayControl<unknown>>payload;
    const newFormArray = <FormArray<unknown>>newState;

    newFormArray.controls = baseArrayControl.controls.reduce(
      (acc, newBaseControl, index) => {
        const oldControl = (<FormGroup<unknown>>state)?.controls[index];

        const action: Action<BaseControl<unknown>> = {
          type: FORMS_FORM_CHANGE,
          payload: newBaseControl,
        };

        acc = acc.concat(formChange(oldControl, action));
        return acc;
      },
      [] as AbstractControl<unknown>[],
    );
  }

  return newState;
};
