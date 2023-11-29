import { Form, BaseForm, FormControl } from '../../Models/Controls';
import { Action, Reducer } from '@reactables/core';
import { FORMS_FORM_CHANGE } from '../../Actions/Hub2/formChange';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from '../../Actions/Hub2/asyncValidationResponseSuccess';
import { FORMS_ASYNC_VALIDATE_CONTROL } from '../../Helpers/addAsyncValidationEffects';
import { ControlAsyncValidationResponse } from '../../Models/Payloads';
import { asyncValidation } from './asyncValidation';
import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { formChange } from './formChange';

export const hub2Reducer: Reducer<Form<unknown>> = (state = null, action) => {
  switch (action?.type) {
    case FORMS_FORM_CHANGE:
      return formChange(state, action as Action<BaseForm<unknown>>);

    case FORMS_ASYNC_VALIDATE_CONTROL:
      return asyncValidation(state, action as Action<FormControl<unknown>>);

    case FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS:
      return asyncValidationResponseSuccess(
        state,
        action as Action<ControlAsyncValidationResponse>,
      );
    default:
      return state;
  }
};
