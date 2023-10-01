import { Action } from '@hub-fx/core';
import { ControlRef } from '../../Models/ControlRef';
export const FORMS_MARK_CONTROL_AS_UNTOUCHED =
  'FORMS_MARK_CONTROL_AS_UNTOUCHED';
export const markControlAsUntouched = (
  controlRef: ControlRef,
): Action<ControlRef> => ({
  type: FORMS_MARK_CONTROL_AS_UNTOUCHED,
  payload: controlRef,
});
