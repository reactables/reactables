import React, { useRef } from 'react';
import { Hub, Dispatcher, Reducer } from '@hubfx/core';
import {
  AbstractControlConfig,
  buildReducer,
  ControlModels,
  getControl,
  ControlRef,
  resetControl,
} from '@hubfx/forms';
import { useObservable } from '../Hooks/useObservable';
import { useHub } from '../Hooks/useHub';

export const FormContext = React.createContext(null) as React.Context<{
  state: ControlModels.AbstractControl<unknown>;
  dispatch: Dispatcher;
  reducer: Reducer<ControlModels.AbstractControl<unknown>>;
}>;

export interface FormChildrenProps {
  state: ControlModels.AbstractControl<unknown>;
  getControl: (
    controlRef: ControlRef,
  ) => ControlModels.AbstractControl<unknown>;
  resetControl: (controlRef: ControlRef) => void;
}

interface FormProps {
  formConfig: AbstractControlConfig;
  hub?: Hub;
  children?: (props: FormChildrenProps) => React.ReactNode;
}

export const Form = ({ formConfig, hub = useHub(), children }: FormProps) => {
  const reducer = useRef(buildReducer(formConfig)).current;
  const state = useObservable(
    hub.store({ reducer, debug: true, name: 'Demo Form' }),
  );

  const formChildrenProps: FormChildrenProps = {
    state,
    getControl: (controlRef) => getControl(controlRef, state),
    resetControl: (controlRef) => {
      hub.dispatch(...resetControl(controlRef, state, reducer));
    },
  };

  return (
    <FormContext.Provider
      value={{
        state,
        dispatch: hub.dispatch,
        reducer,
      }}
    >
      {state !== undefined && children && children(formChildrenProps)}
    </FormContext.Provider>
  );
};
