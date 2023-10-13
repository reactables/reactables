import { Reducer, Action } from '@hub-fx/core';
import { BaseForm, Form, Hub2Fields } from '../../Models/Controls';
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
  { payload }: Action<BaseForm<T>>,
) =>
  mergeErrors(
    Object.entries(payload).reduce(
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
