import { Action } from '@hub-fx/core';
import { ControlRef } from '../Models/ControlRef';

export const FORMS_RESET_CONTROL = 'FORMS_RESET_CONTROL';
export const resetControl = <T>(controlRef: ControlRef): Action<ControlRef> => {
  return {
    type: FORMS_RESET_CONTROL,
    payload: controlRef,
  };
};
