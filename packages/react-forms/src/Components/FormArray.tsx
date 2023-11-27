import React, { useContext } from 'react';
import { AbstractControlConfig, ControlRef, ControlModels, getArrayItems } from '@hub-fx/forms';
import { FormContext } from './Form';

export interface FormArrayChildrenProps {
  items: ControlModels.FormControl<unknown>[];
  addControl: (config: AbstractControlConfig) => void;
  removeControl: (controlRef: ControlRef) => void;
}

export interface FormArrayProps {
  name?: string;
  children?: (props: FormArrayChildrenProps) => React.ReactNode;
}

export const FormArray = ({ name = 'root', children }: FormArrayProps) => {
  const {
    state,
    actions: { addControl, removeControl },
  } = useContext(FormContext);

  const { controlRef } = state[name];

  const items = getArrayItems(controlRef, state) as ControlModels.FormControl<unknown>[];

  const formArrayChildrenProps: FormArrayChildrenProps = {
    items,
    addControl: (config: AbstractControlConfig) => {
      addControl({ controlRef, config });
    },
    removeControl,
  };

  return <div>{children && children(formArrayChildrenProps)}</div>;
};
