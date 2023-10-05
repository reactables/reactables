import { BaseAbstractControl, AbstractControl } from '../../Models/Controls';
import { Action, Reducer } from '@hub-fx/core';
import { FORMS_FORM_CHANGE } from '../../Actions/Hub2/formChange';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from '../../Actions/Hub2/asyncValidationResponseSuccess';
import { FORMS_ASYNC_VALIDATE_CONTROL } from '../../Actions/Hub2/valueChange';
import { ControlAsyncValidationResponse } from '../../Models/Payloads';
import { asyncValidation } from './asyncValidation';
import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { formChange } from './formChange';
import { mergeErrors } from './mergeErrors';

export const hub2Reducer: Reducer<AbstractControl<unknown>> = (
  state = null,
  action,
) => {
  switch (action?.type) {
    case FORMS_FORM_CHANGE:
      return mergeErrors(
        formChange(state, action as Action<BaseAbstractControl<unknown>>),
      );

    case FORMS_ASYNC_VALIDATE_CONTROL:
      return asyncValidation(
        state,
        action as Action<BaseAbstractControl<unknown>>,
      );
    case FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS:
      return mergeErrors(
        asyncValidationResponseSuccess(
          state,
          action as Action<ControlAsyncValidationResponse>,
        ),
      );
    default:
      return state;
  }
};
