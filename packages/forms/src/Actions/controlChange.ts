import { Action } from '@hub-fx/core';
import { ControlChange } from '../Models/Payloads';

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const controlChange = <T, S>(
  controlChange: ControlChange<T>,
): Action<ControlChange<T>> => {
  return {
    type: FORMS_CONTROL_CHANGE,
    payload: controlChange,
  };
};
