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
  controlRef: ControlRef;
  validatorIndex: number;
  errors: FormErrors;
}
