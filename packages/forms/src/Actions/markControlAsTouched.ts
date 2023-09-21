import { Action } from '@hubfx/core';
import { ControlRef } from '../Models/ControlRef';

export const FORMS_MARK_CONTROL_AS_TOUCHED = 'FORMS_MARK_CONTROL_AS_TOUCHED';
export const markControlAsTouched = (
  controlRef: ControlRef,
): Action<ControlRef> => {
  return {
    type: FORMS_MARK_CONTROL_AS_TOUCHED,
    payload: controlRef,
  };
};
