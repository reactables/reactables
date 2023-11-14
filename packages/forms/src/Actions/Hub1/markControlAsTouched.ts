import { Action } from '@hub-fx/core';
import { MarkTouched } from '../../Models/Payloads';

export const FORMS_MARK_CONTROL_AS_TOUCHED = 'FORMS_MARK_CONTROL_AS_TOUCHED';
export const markControlAsTouched = (payload: MarkTouched): Action<MarkTouched> => {
  return {
    type: FORMS_MARK_CONTROL_AS_TOUCHED,
    payload,
  };
};
