import React, { useContext } from 'react';
import { AbstractControlConfig, ControlRef, ControlModels, getControl } from '@hub-fx/forms';
import { FormContext } from './Form';

// Take a name
// find the children sorted
// expose array methods

export interface FormArrayChildrenProps {
  formArray: ControlModels.FormControl<unknown>;
  addControl: (config: AbstractControlConfig) => void;
  removeControl: (controlRef: ControlRef) => void;
}

export interface FormArrayProps {
  controlRef: ControlRef;
  children?: (props: FormArrayChildrenProps) => React.ReactNode;
}

export const FormArray = ({ controlRef, children }: FormArrayProps) => {
  const {
    state,
    actions: { addControl, removeControl },
  } = useContext(FormContext);
  const formArray = getControl(controlRef, state) as ControlModels.FormControl<unknown>;

  const formArrayChildrenProps: FormArrayChildrenProps = {
    formArray,
    addControl: (config: AbstractControlConfig) => {
      addControl({ controlRef, config });
    },
    removeControl: (arrayItemCtrlRef: ControlRef) => {
      removeControl(arrayItemCtrlRef);
    },
  };

  return <div>{children && children(formArrayChildrenProps)}</div>;
};
