import { ValidatorFn, ValidatorAsyncFn } from './Validators';

export interface FormGroupConfig extends AbstractControlConfig {
  controls: { [key: string]: AbstractControlConfig };
}

export interface FormArrayConfig extends AbstractControlConfig {
  controls: AbstractControlConfig[];
}

export interface FormControlConfig<T> extends AbstractControlConfig {
  initialValue: T;
}

export interface AbstractControlConfig {
  validators?: ValidatorFn[];
  asyncValidators?: ValidatorAsyncFn[];
}
