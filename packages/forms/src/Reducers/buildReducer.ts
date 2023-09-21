import { Action, Reducer } from '@hubfx/core';
import { FORMS_CONTROL_CHANGE } from '../Actions/controlChange';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from '../Actions/asyncValidationResponseSuccess';
import { FORMS_VALUE_CHANGE_EFFECT } from '../Actions/valueChange';
import { FORMS_ADD_GROUP_CONTROL } from '../Actions/addGroupControl';
import { FORMS_ADD_FORM_ARRAY_CONTROL } from '../Actions/addArrayControl';
import { FORMS_REMOVE_CONTROL } from '../Actions/removeControl';
import { FORMS_RESET_CONTROL } from '../Actions/resetControl';
import { FORMS_MARK_CONTROL_AS_PRISTINE } from '../Actions/markControlAsPristine';
import { FORMS_MARK_CONTROL_AS_TOUCHED } from '../Actions/markControlAsTouched';
import { FORMS_MARK_CONTROL_AS_UNTOUCHED } from '../Actions/markControlAsUntouched';
import { AbstractControl } from '../Models/Controls';
import { AbstractControlConfig } from '../Models/Configs';
import {
  ControlAsyncValidationResponse,
  AddControl,
  ControlChange,
} from '../Models/Payloads';
import { ControlRef } from '../Models/ControlRef';
import { updateDirty } from './updateDirty';
import { syncValidate } from './syncValidate';
import { updateValues } from './updateValues';
import { handleAsyncValidation } from './handleAsyncValidation';
import { handleAsyncValidationResponseSuccess } from './handleAsyncValidationResponseSuccess';
import { addFormGroupControl } from './addFormGroupControl';
import { addFormArrayControl } from './addFormArrayControl';
import { removeControl } from './removeControl';
import { markControlAsPristine } from './markControlAsPristine';
import { markControlAsTouched } from './markControlAsTouched';
import { markControlAsUntouched } from './markControlAsUntouched';
import { resetControl } from './resetControl';
import { buildControlState } from '../Helpers/buildControlState';

export const buildReducer = (config: AbstractControlConfig) => {
  const initialState = buildControlState(config);
  const formsReducer: Reducer<AbstractControl<unknown>> = (
    state = initialState,
    action,
  ) => {
    switch (action?.type) {
      case FORMS_CONTROL_CHANGE:
        return updateDirty(
          syncValidate(
            updateValues(state, action as Action<ControlChange<unknown>>),
          ),
        );
      case FORMS_VALUE_CHANGE_EFFECT:
        return handleAsyncValidation(
          state,
          action as Action<AbstractControl<unknown>>,
        );
      case FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS:
        return syncValidate(
          handleAsyncValidationResponseSuccess(
            state,
            action as Action<ControlAsyncValidationResponse>,
          ),
        );
      case FORMS_ADD_GROUP_CONTROL:
        return updateDirty(
          syncValidate(
            addFormGroupControl(state, action as Action<AddControl>),
          ),
        );
      case FORMS_ADD_FORM_ARRAY_CONTROL:
        return updateDirty(
          syncValidate(
            addFormArrayControl(state, action as Action<AddControl>),
          ),
        );
      case FORMS_REMOVE_CONTROL:
        return updateDirty(
          syncValidate(removeControl(state, action as Action<ControlRef>)),
        );
      case FORMS_RESET_CONTROL:
        return markControlAsUntouched(
          updateDirty(
            syncValidate(resetControl(state, action as Action<ControlRef>)),
          ),
          action as Action<ControlRef>,
        );
      case FORMS_MARK_CONTROL_AS_PRISTINE:
        return updateDirty(
          markControlAsPristine(state, action as Action<ControlRef>),
        );
      case FORMS_MARK_CONTROL_AS_TOUCHED:
        return markControlAsTouched(state, action as Action<ControlRef>);
      case FORMS_MARK_CONTROL_AS_UNTOUCHED:
        return markControlAsUntouched(state, action as Action<ControlRef>);

      default:
        return state;
    }
  };

  return formsReducer;
};
