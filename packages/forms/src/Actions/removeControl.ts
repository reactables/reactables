import { Action } from '@hub-fx/core';
import { ControlRef } from '../Models/ControlRef';

export const FORMS_REMOVE_CONTROL = 'FORMS_REMOVE_CONTROL';
export const removeControl = (controlRef: ControlRef): Action<ControlRef> => {
  return {
    type: FORMS_REMOVE_CONTROL,
    payload: controlRef,
  };
};
