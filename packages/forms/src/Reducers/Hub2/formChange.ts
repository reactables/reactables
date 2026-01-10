import { Action } from '@reactables/core';
import { BaseFormState, Form, cloneHub2Fields } from '../../Models/Controls';
import { mergeErrors } from './mergeErrors';
import { mergeControls } from './mergeControls';

export const formChange = (
  state: Form<any> | null = null,
  { payload }: Action<BaseFormState<any>>,
) => {
  const { form } = payload;

  if (state === null) {
    return mergeErrors(
      Object.entries(form).reduce((acc, [dictKey, baseControl]) => {
        return {
          ...acc,
          [dictKey]: {
            ...cloneHub2Fields(),
            ...baseControl,
          },
        };
      }, {} as Form<any>),
    );
  }

  return mergeControls(state, payload);
};
