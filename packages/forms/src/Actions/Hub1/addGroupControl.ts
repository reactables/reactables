import { Action } from '@hub-fx/core';
import { AddControl } from '../../Models/Payloads';

export const FORMS_ADD_GROUP_CONTROL = 'FORMS_ADD_GROUP_CONTROL';
export const addGroupControl = <T>({
  controlRef,
  config,
}: AddControl): Action<AddControl> => {
  return {
    type: FORMS_ADD_GROUP_CONTROL,
    payload: { controlRef, config },
  };
};
