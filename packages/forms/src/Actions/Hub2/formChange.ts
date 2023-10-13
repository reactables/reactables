import { Action } from '@hub-fx/core';
import { BaseForm } from '../../Models/Controls';

export const FORMS_FORM_CHANGE = 'FORMS_FORM_CHANGE';
export const formChange = <T>(form: BaseForm<T>): Action<BaseForm<T>> => {
  return {
    type: FORMS_FORM_CHANGE,
    payload: form,
  };
};
