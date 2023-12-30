import { ControlRef } from './ControlRef';
import { AbstractControlConfig } from './Configs';
import { FormErrors } from './FormErrors';

export interface UpdateValuesPayload<T> {
  value: T;
  controlRef: ControlRef;
}

export interface AddControlPayload {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

export interface PushControlPayload {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

export interface ControlAsyncValidationResponse {
  key: string;
  validatorIndex: number;
  errors: FormErrors;
}

export interface MarkTouchedPayload {
  controlRef: ControlRef;
  markAll?: boolean;
}
