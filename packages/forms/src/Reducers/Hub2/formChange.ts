import { Reducer, Action } from '@hub-fx/core';
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
  { payload: { form } }: Action<BaseFormState<T>>,
) =>
  mergeErrors(
    Object.entries(form).reduce(
      (acc, [key, baseControl]) => ({
        ...acc,
        [key]: {
          ...(state && state[key]
            ? state[key]
            : (structuredClone(DEFAULT_HUB2_FIELDS) as Hub2Fields)),
          ...baseControl,
        },
      }),
      {} as Form<T>,
    ),
  );
