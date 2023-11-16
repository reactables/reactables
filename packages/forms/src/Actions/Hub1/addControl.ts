import { Action } from '@hub-fx/core';
import { AddControl } from '../../Models/Payloads';

export const FORMS_ADD_CONTROL = 'FORMS_ADD_CONTROL';
export const addControl = ({ controlRef, config }: AddControl): Action<AddControl> => {
  return {
    type: FORMS_ADD_CONTROL,
    payload: { controlRef, config },
  };
};
