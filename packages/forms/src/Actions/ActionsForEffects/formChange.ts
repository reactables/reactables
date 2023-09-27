import { Action } from '@hub-fx/core';
import { BaseControl } from '../../Models/Controls';

export const FORMS_FORM_CHANGE = 'FORMS_FORM_CHANGE';
export const formChange = (
  form: BaseControl<unknown>,
): Action<BaseControl<unknown>> => {
  return {
    type: FORMS_FORM_CHANGE,
    payload: form,
  };
};
