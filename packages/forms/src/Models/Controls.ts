import { AbstractControlConfig } from './Configs';
import { FormErrors } from './FormErrors';
import { ControlRef } from './ControlRef';

export type AbstractControl<T> = FormControl<T> | FormArray<T> | FormGroup<T>;

export interface FormControl<T> {
  pristineControl?: AbstractControl<T>;
  controlRef: ControlRef;
  value: T;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  errors: FormErrors;
  asyncValidateInProgress: { [key: string | number]: boolean };
  pending?: boolean;
  config: AbstractControlConfig;
}

export interface FormGroup<T> extends FormControl<T> {
  submitting?: boolean;
  controls: {
    [key: string]: AbstractControl<unknown>;
  };
}

export interface FormArray<T> extends FormControl<T> {
  controls: AbstractControl<unknown>[];
}
