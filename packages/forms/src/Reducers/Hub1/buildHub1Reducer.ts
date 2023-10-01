import { AbstractControlConfig } from '../../Models';
import { BaseAbstractControl } from '../../Models/Controls';
import { Action, Reducer } from '@hub-fx/core';
import { FORMS_CONTROL_CHANGE } from '../../Actions/Hub1/controlChange';
import { FORMS_ADD_GROUP_CONTROL } from '../../Actions/Hub1/addGroupControl';
import { FORMS_ADD_FORM_ARRAY_CONTROL } from '../../Actions/Hub1/addArrayControl';
import { FORMS_REMOVE_CONTROL } from '../../Actions/Hub1/removeControl';
import { FORMS_RESET_CONTROL } from '../../Actions/Hub1/resetControl';
import { FORMS_MARK_CONTROL_AS_PRISTINE } from '../../Actions/Hub1/markControlAsPristine';
import { FORMS_MARK_CONTROL_AS_TOUCHED } from '../../Actions/Hub1/markControlAsTouched';
import { FORMS_MARK_CONTROL_AS_UNTOUCHED } from '../../Actions/Hub1/markControlAsUntouched';
import { AddControl, ControlChange } from '../../Models/Payloads';
import { ControlRef } from '../../Models/ControlRef';
import { updateDirty } from './updateDirty';
import { syncValidate } from './syncValidate';
import { updateValues } from './updateValues';
import { addFormGroupControl } from './addFormGroupControl';
import { addFormArrayControl } from './addFormArrayControl';
import { removeControl } from './removeControl';
import { markControlAsPristine } from './markControlAsPristine';
import { markControlAsTouched } from './markControlAsTouched';
import { markControlAsUntouched } from './markControlAsUntouched';
import { resetControl } from './resetControl';
import { buildControlState } from '../../Helpers/buildControlState';

export const buildHub1Reducer = (
  config: AbstractControlConfig,
): Reducer<BaseAbstractControl<unknown>> => {
  const initialState = buildControlState(config);
  const formsReducer: Reducer<BaseAbstractControl<unknown>> = (
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
