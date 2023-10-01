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
  validatorsValid: boolean;
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

export type BaseAbstractControl<T> =
  | BaseControl<T>
  | BaseGroupControl<T>
  | BaseArrayControl<T>;

interface AsyncFields {
  asyncValidatorsValid: boolean;
  asyncValidatorErrors: FormErrors;
  asyncValidateInProgress: { [key: string | number]: boolean };
  pending?: boolean;
}

interface ValidatedFields {
  valid: boolean;
  errors: FormErrors;
}

export interface Hub2Fields extends AsyncFields, ValidatedFields {}

export type AbstractControl<T> = FormControl<T> | FormArray<T> | FormGroup<T>;

export interface FormControl<T> extends BaseControl<T>, Hub2Fields {}

export interface FormGroup<T> extends BaseGroupControl<T>, Hub2Fields {
  controls: { [key: string]: AbstractControl<unknown> };
}

export interface FormArray<T> extends BaseArrayControl<T>, Hub2Fields {
  controls: AbstractControl<unknown>[];
}
