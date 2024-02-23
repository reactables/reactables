import React, { useContext } from 'react';
import { AbstractControlConfig, ControlRef, ControlModels, getArrayItems } from '@reactables/forms';
import { FormContext } from './Form';

export interface FormArrayChildrenProps {
  items: ControlModels.FormControl<unknown>[];
  pushControl: (config: AbstractControlConfig) => void;
  removeControl: (index: number) => void;
}

export interface FormArrayProps {
  name?: string;
  children?: (props: FormArrayChildrenProps) => React.ReactNode;
}

export const FormArray = ({ name = 'root', children }: FormArrayProps) => {
  const [state, { pushControl, removeControl }] = useContext(FormContext);

  const { controlRef } = state[name];

  const items = getArrayItems(controlRef, state) as ControlModels.FormControl<unknown>[];

  const formArrayChildrenProps: FormArrayChildrenProps = {
    items,
    pushControl: (config: AbstractControlConfig) => {
      pushControl({ controlRef, config });
    },
    removeControl: (index) => removeControl(controlRef.concat(index)),
  };

  return <div>{children && children(formArrayChildrenProps)}</div>;
};
