import React from 'react';
import { AbstractControlConfig, ControlModels, RxForm, RxFormActions } from '@hub-fx/forms';
import { useReactable } from '@hub-fx/react-helpers';

export const FormContext = React.createContext(null) as React.Context<{
  state: ControlModels.Form<unknown>;
  actions: RxFormActions;
}>;

export interface FormChildrenProps {
  state: ControlModels.Form<unknown>;
  actions: RxFormActions;
}

interface FormProps {
  formConfig: AbstractControlConfig;
  children?: (props: FormChildrenProps) => React.ReactNode;
}

export const Form = ({ formConfig, children }: FormProps) => {
  const { state, actions } = useReactable(RxForm.build(formConfig));

  const formChildrenProps: FormChildrenProps = {
    state,
    actions,
  };

  return (
    <FormContext.Provider
      value={{
        state,
        actions,
      }}
    >
      {state !== undefined && children && children(formChildrenProps)}
    </FormContext.Provider>
  );
};
