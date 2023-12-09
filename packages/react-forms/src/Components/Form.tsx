import React from 'react';
import { ControlModels, RxFormActions } from '@reactables/forms';

interface HookedRxForm {
  state: ControlModels.Form<unknown>;
  actions: RxFormActions;
}

export const FormContext = React.createContext(null) as React.Context<HookedRxForm>;

export interface FormChildrenProps {
  state: ControlModels.Form<unknown>;
  actions: RxFormActions;
}

interface FormProps {
  rxForm: HookedRxForm;
  children?: React.ReactNode;
}

export const Form = ({ rxForm, children }: FormProps) => {
  return <FormContext.Provider value={rxForm}>{rxForm.state && children}</FormContext.Provider>;
};
