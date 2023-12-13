import { Reducer, Action } from '@reactables/core';
import { BaseFormState, Form, Hub2Fields, FormControl } from '../../Models/Controls';
import { mergeErrors } from './mergeErrors';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlChange } from '../../Models/Payloads';
import { getFormKey } from '../../Helpers/getFormKey';
import { mergeValueUpdated } from './mergeValueUpdated';

export const DEFAULT_HUB2_FIELDS: Hub2Fields = {
  asyncValidatorErrors: {},
  asyncValidateInProgress: {},
  pending: false,
  valid: null,
  errors: null,
};

export const formChange: Reducer<Form<unknown>> = <T>(
  state: Form<T> = null,
  { payload: { form, action } }: Action<BaseFormState<T>>,
) => {
  if (state === null) {
    return mergeErrors(
      Object.entries(form).reduce((acc, [dictKey, baseControl]) => {
        return {
          ...acc,
          [dictKey]: {
            ...(structuredClone(DEFAULT_HUB2_FIELDS) as Hub2Fields),
            ...baseControl,
          },
        };
      }, {} as Form<T>),
    );
  }

  switch (action?.type) {
    case 'updateValues':
      return mergeValueUpdated(
        state,
        form,
        (action as Action<ControlChange<unknown>>).payload.controlRef,
      );
    default:
      return mergeErrors(
        Object.entries(form).reduce((acc, [dictKey, baseControl]) => {
          const existingControl =
            action?.type === 'removeControl'
              ? state && Object.values(state).find((control) => baseControl.key === control.key)
              : state && state[dictKey];

          return {
            ...acc,
            [dictKey]: {
              ...(existingControl
                ? existingControl
                : (structuredClone(DEFAULT_HUB2_FIELDS) as Hub2Fields)),
              ...baseControl,
            },
          };
        }, {} as Form<T>),
      );
  }
};
