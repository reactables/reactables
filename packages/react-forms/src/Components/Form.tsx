import React from 'react';
import { Hub, Dispatcher } from '@hub-fx/core';
import {
  AbstractControlConfig,
  ControlModels,
  getControl,
  ControlRef,
  resetControl,
  buildForm,
} from '@hub-fx/forms';
import { useObservable } from '../Hooks/useObservable';
import { useHub } from '../Hooks/useHub';

export const FormContext = React.createContext(null) as React.Context<{
  state: ControlModels.AbstractControl<unknown>;
  dispatch: Dispatcher;
}>;

export interface FormChildrenProps {
  state: ControlModels.AbstractControl<unknown>;
  getControl: (
    controlRef: ControlRef,
  ) => ControlModels.BaseAbstractControl<unknown>;
  resetControl: (controlRef: ControlRef) => void;
}

interface FormProps {
  formConfig: AbstractControlConfig;
  hub?: Hub;
  children?: (props: FormChildrenProps) => React.ReactNode;
}

export const Form = ({ formConfig, hub = useHub(), children }: FormProps) => {
  const state = useObservable(buildForm(formConfig, hub));

  const formChildrenProps: FormChildrenProps = {
    state,
    getControl: (controlRef) => getControl(controlRef, state),
    resetControl: (controlRef) => {
      hub.dispatch(resetControl(controlRef));
    },
  };

  return (
    <FormContext.Provider
      value={{
        state,
        dispatch: hub.dispatch,
      }}
    >
      {state !== undefined && children && children(formChildrenProps)}
    </FormContext.Provider>
  );
};
