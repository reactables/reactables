import { ControlRef } from './ControlRef';
import { AbstractControlConfig } from './Configs';
import { FormErrors } from './FormErrors';

export interface ControlChange<T> {
  value: T;
  controlRef: ControlRef;
}

export interface AddControl {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

export interface ControlAsyncValidationResponse {
  key: string;
  validatorIndex: number;
  errors: FormErrors;
}

export interface MarkTouched {
  controlRef: ControlRef;
  markAll?: boolean;
}
