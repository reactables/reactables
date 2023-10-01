import { Action } from '@hub-fx/core';
import { BaseAbstractControl } from '../../Models/Controls';

export const FORMS_FORM_CHANGE = 'FORMS_FORM_CHANGE';
export const formChange = (
  form: BaseAbstractControl<unknown>,
): Action<BaseAbstractControl<unknown>> => {
  return {
    type: FORMS_FORM_CHANGE,
    payload: form,
  };
};
