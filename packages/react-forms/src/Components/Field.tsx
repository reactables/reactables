import React, { useContext, ChangeEvent, DragEvent, FocusEvent, FormEvent } from 'react';
import { ControlModels } from '@reactables/forms';
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
  name?: string;
  [key: string]: unknown;
}

export const Field = ({ component: Component, name = 'root', ...props }: FieldProps) => {
  const {
    state,
    actions: { markControlAsTouched, updateValues },
  } = useContext(FormContext);

  const { controlRef, touched, value } = state[name];

  const inputProps = {
    name,
    value,
    onBlur: () => {
      if (!touched) markControlAsTouched({ controlRef });
    },
    onChange: (event: FormEvent<HTMLInputElement> | unknown) => {
      let value: unknown;
      if ((event as FormEvent<HTMLInputElement>).currentTarget) {
        switch ((event as FormEvent<HTMLInputElement>).currentTarget.type) {
          case 'checkbox':
            value = (event as FormEvent<HTMLInputElement>).currentTarget.checked;
          case 'email':
          case 'text':
          default:
            value = (event as FormEvent<HTMLInputElement>).currentTarget.value;
        }
      } else {
        value = event;
      }

      updateValues({
        controlRef,
        value,
      });
    },
  };

  return <Component input={inputProps} meta={state[name]} {...props} />;
};
