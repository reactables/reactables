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
  config: AbstractControlConfig;
  key: string;
}

interface AsyncFields {
  asyncValidatorErrors: FormErrors;
  asyncValidateInProgress: { [key: string | number]: boolean };
  pending?: boolean;
}

interface ValidatedFields {
  valid: boolean;
  errors: FormErrors;
  childrenValid: boolean;
}

export interface Hub2Fields extends AsyncFields, ValidatedFields {}

export interface FormControl<T> extends BaseControl<T>, Hub2Fields {}

export interface BaseFormState<T> {
  form: BaseForm<T>;
  // controls that have changed including new ones added
  _changedControls?: {
    [key: string]: BaseControl<unknown>;
  };
  // controls removed from removeControl or resetControl - only the target control ref, not descendants
  _removedControls?: {
    [key: string]: BaseControl<unknown>;
  };
}

export interface BaseForm<T> {
  root?: BaseControl<T>;
  [key: string]: BaseControl<unknown>;
}

export interface Form<T> {
  root?: FormControl<T>;
  [key: string]: FormControl<unknown>;
}

export const DEFAULT_HUB2_FIELDS: Hub2Fields = {
  asyncValidatorErrors: {},
  asyncValidateInProgress: {},
  pending: false,
  valid: null,
  childrenValid: null,
  errors: null,
};
