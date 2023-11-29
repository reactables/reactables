import { Reducer, Action } from '@reactables/core';
import { BaseFormState, Form, Hub2Fields } from '../../Models/Controls';
import { mergeErrors } from './mergeErrors';

export const DEFAULT_HUB2_FIELDS: Hub2Fields = {
  asyncValidatorsValid: true,
  asyncValidatorErrors: {},
  asyncValidateInProgress: {},
  pending: false,
  valid: null,
  errors: null,
};

export const formChange: Reducer<Form<unknown>> = <T>(
  state: Form<T> = null,
  { payload: { form, action } }: Action<BaseFormState<T>>,
) =>
  mergeErrors(
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
