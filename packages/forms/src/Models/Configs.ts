import { ValidatorFn, ValidatorAsyncFn } from './Validators';

interface ValidatorConfigs {
  validators?: ValidatorFn[];
  asyncValidators?: ValidatorAsyncFn[];
}

export interface FormGroupConfig extends ValidatorConfigs {
  controls: { [key: string]: AbstractControlConfig };
}

export interface FormArrayConfig extends ValidatorConfigs {
  controls: AbstractControlConfig[];
}

export interface FormControlConfig<T> extends ValidatorConfigs {
  initialValue: T;
  normalizers?: ((value: T) => T)[];
}

export type AbstractControlConfig = (
  | FormControlConfig<unknown>
  | FormArrayConfig
  | FormGroupConfig
) & {
  controls?: AbstractControlConfig[] | { [key: string]: AbstractControlConfig };
};
