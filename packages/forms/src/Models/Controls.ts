import { AbstractControlConfig } from './Configs';
import { FormErrors } from './FormErrors';
import { ControlRef } from './ControlRef';

export interface BaseControl<T> {
  pristineControl?: BaseControl<T>;
  controlRef: ControlRef;
  value: T;
  dirty: boolean;
  touched: boolean;
  validatorErrors: FormErrors;
  config: AbstractControlConfig;
}

export interface BaseGroupControl<T> extends BaseControl<T> {
  controls: {
    [key: string]: BaseControl<unknown>;
  };
}

export interface BaseArrayControl<T> extends BaseControl<T> {
  controls: BaseControl<unknown>[];
}

export interface AsyncFields {
  valid: boolean;
  errors: FormErrors;
  asyncValidateInProgress: { [key: string | number]: boolean };
  pending?: boolean;
}

export type AbstractControl<T> = FormControl<T> | FormArray<T> | FormGroup<T>;

export interface FormControl<T> extends BaseControl<T>, AsyncFields {}

export interface FormGroup<T> extends BaseGroupControl<T>, AsyncFields {
  controls: { [key: string]: AbstractControl<unknown> };
}

export interface FormArray<T> extends BaseArrayControl<T>, AsyncFields {
  controls: AbstractControl<unknown>[];
}
