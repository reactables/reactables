import { Reducer, Action } from '@reactables/core';
import { BaseFormState, Form, Hub2Fields } from '../../Models/Controls';
import { mergeErrors } from './mergeErrors';
import { ControlChange, MarkTouched, AddControl, PushControl } from '../../Models/Payloads';
import { mergeValueUpdated } from './mergeValueUpdated';
import { mergeRemoveControl } from './mergeRemoveControl';
import { mergeTouchUpdated } from './mergeTouchUpdated';
import { mergePushControl } from './mergePushControl';
import { ControlRef } from '../../Models/ControlRef';
import { DEFAULT_HUB2_FIELDS } from '../../Models/Controls';

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
    case 'pushControl':
      return mergePushControl(state, form, (action as Action<PushControl>).payload.controlRef);
    case 'addControl':
    case 'updateValues':
      return mergeValueUpdated(
        state,
        form,
        (action as Action<ControlChange<unknown> | AddControl>).payload.controlRef,
      );
    case 'resetControl':
    case 'removeControl':
      return mergeRemoveControl(state, form, action.payload as ControlRef);
    case 'markControlAsPristine':
    case 'markControlAsUntouched':
      return mergeTouchUpdated(state, form, action.payload as ControlRef);
    case 'markControlAsTouched':
      return mergeTouchUpdated(state, form, (action.payload as MarkTouched).controlRef);
    default:
      return mergeErrors(
        Object.entries(form).reduce((acc, [dictKey, baseControl]) => {
          const existingControl = state && state[dictKey];

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
