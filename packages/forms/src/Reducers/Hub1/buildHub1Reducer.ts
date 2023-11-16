import { AbstractControlConfig } from '../../Models';
import { BaseForm } from '../../Models/Controls';
import { Action, Reducer } from '@hub-fx/core';
import { FORMS_CONTROL_CHANGE } from '../../Actions/Hub1/controlChange';
import { FORMS_REMOVE_CONTROL } from '../../Actions/Hub1/removeControl';
import { FORMS_RESET_CONTROL } from '../../Actions/Hub1/resetControl';
import { FORMS_MARK_CONTROL_AS_PRISTINE } from '../../Actions/Hub1/markControlAsPristine';
import { FORMS_MARK_CONTROL_AS_TOUCHED } from '../../Actions/Hub1/markControlAsTouched';
import { FORMS_MARK_CONTROL_AS_UNTOUCHED } from '../../Actions/Hub1/markControlAsUntouched';
import { AddControl, ControlChange, MarkTouched } from '../../Models/Payloads';
import { ControlRef } from '../../Models/ControlRef';
import { syncValidate } from './syncValidate';
import { updateValues } from './updateValues';
import { removeControl } from './removeControl';
import { addControl } from './addControl';
import { markControlAsPristine } from './markControlAsPristine';
import { markControlAsTouched } from './markControlAsTouched';
import { markControlAsUntouched } from './markControlAsUntouched';
import { resetControl } from './resetControl';
import { buildFormState } from '../../Helpers/buildFormState';
import { FORMS_ADD_CONTROL } from '../../Actions/Hub1/addControl';

export const buildHub1Reducer = (config: AbstractControlConfig): Reducer<BaseForm<unknown>> => {
  const initialState = syncValidate(buildFormState(config));
  const formsReducer: Reducer<BaseForm<unknown>> = (state = initialState, action) => {
    switch (action?.type) {
      case FORMS_CONTROL_CHANGE:
        return updateValues(state, action as Action<ControlChange<unknown>>);
      case FORMS_ADD_CONTROL:
        return addControl(state, action as Action<AddControl>);
      case FORMS_REMOVE_CONTROL:
        return removeControl(state, action as Action<ControlRef>);
      case FORMS_RESET_CONTROL:
        return resetControl(state, action as Action<ControlRef>);
      case FORMS_MARK_CONTROL_AS_PRISTINE:
        return markControlAsPristine(state, action as Action<ControlRef>);
      case FORMS_MARK_CONTROL_AS_TOUCHED:
        return markControlAsTouched(state, action as Action<MarkTouched>);
      case FORMS_MARK_CONTROL_AS_UNTOUCHED:
        return markControlAsUntouched(state, action as Action<ControlRef>);

      default:
        return state;
    }
  };

  return formsReducer;
};
