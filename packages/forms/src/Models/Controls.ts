import { Action } from '@reactables/core';
import { AbstractControlConfig } from './Configs';
import { FormErrors } from './FormErrors';
import { ControlRef } from './ControlRef';

export interface BaseControl<T> {
  pristineValue: T;
  controlRef: ControlRef;
  value: T;
  dirty: boolean;
  touched: boolean;
  validatorErrors: FormErrors;
  validatorsValid: boolean;
  config: AbstractControlConfig;
  key: string;
}

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

export interface FormControl<T> extends BaseControl<T>, Hub2Fields {}

export interface BaseFormState<T> {
  form: BaseForm<T>;
  action: Action<unknown>;
}

export interface BaseForm<T> {
  root?: BaseControl<T>;
  [key: string]: BaseControl<unknown>;
}

export interface Form<T> {
  root: FormControl<T>;
  [key: string]: FormControl<unknown>;
}
