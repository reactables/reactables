import React, {
  useContext,
  ChangeEvent,
  DragEvent,
  FocusEvent,
  FormEvent,
} from 'react';
import {
  ControlChange,
  controlChange,
  ControlRef,
  getControl,
  markControlAsTouched,
  ControlModels,
} from '@hubfx/forms';
import { FormContext } from './Form';

export type EventHandler<Event> = (event: Event, name?: string) => void;

export interface CommonFieldInputProps {
  name: string;
  //TODO: these drag drop and focus events
  onDragStart?: EventHandler<DragEvent<unknown>>;
  onDrop?: EventHandler<DragEvent<unknown>>;
  onFocus?: EventHandler<FocusEvent<unknown>>;
}

export interface EventOrValueHandler<Event> extends EventHandler<Event> {
  (value: unknown): void;
}

export interface WrappedFieldInputProps extends CommonFieldInputProps {
  value: any;
  onBlur: EventOrValueHandler<FocusEvent<unknown>>;
  onChange: EventOrValueHandler<ChangeEvent<unknown>>;
}

export interface WrappedFieldProps {
  input: WrappedFieldInputProps;
  meta: ControlModels.FormControl<unknown>;
}

export interface FieldProps {
  component: React.JSXElementConstructor<WrappedFieldProps>;
  controlRef: ControlRef;
  [key: string]: unknown;
}

export const Field = ({
  component: Component,
  controlRef,
  ...props
}: FieldProps) => {
  const { state, reducer, dispatch } = useContext(FormContext);
  const control = getControl(controlRef, state);
  const inputProps = {
    name: controlRef.join('.'),
    value: control.value,
    onBlur: () => {
      if (!control.touched) dispatch(markControlAsTouched(controlRef));
    },
    onChange: (event: FormEvent<HTMLInputElement>) => {
      const change: ControlChange<unknown> = {
        controlRef,
        value: event.currentTarget.value,
      };
      dispatch(...controlChange(change, state, reducer));
    },
  };

  return <Component input={inputProps} meta={control} {...props} />;
};
