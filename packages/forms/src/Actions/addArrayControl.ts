import { Action } from '@hub-fx/core';
import { AddControl } from '../Models/Payloads';

export const FORMS_ADD_FORM_ARRAY_CONTROL = 'FORMS_ADD_FORM_ARRAY_CONTROL';
export const addFormArrayControl = <T>({
  controlRef,
  config,
}: AddControl): Action<AddControl> => {
  return {
    type: FORMS_ADD_FORM_ARRAY_CONTROL,
    payload: { controlRef, config },
  };
};
