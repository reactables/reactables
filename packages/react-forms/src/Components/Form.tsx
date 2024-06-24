import React from 'react';
import { ControlModels, RxFormActions } from '@reactables/forms';

export type HookedRxForm = [ControlModels.Form<unknown>, RxFormActions, ...unknown[]];

export const FormContext = React.createContext(null) as React.Context<HookedRxForm>;

interface FormProps {
  rxForm: HookedRxForm;
  children?: React.ReactNode;
}

export const Form = ({ rxForm, children }: FormProps) => {
  const [state] = rxForm;
  return <FormContext.Provider value={rxForm}>{state && children}</FormContext.Provider>;
};
