interface ValidatorConfigs {
  validators?: string[];
  asyncValidators?: string[];
}

export interface FormGroupConfig extends ValidatorConfigs {
  controls: { [key: string]: AbstractControlConfig };
}

export interface FormArrayConfig extends ValidatorConfigs {
  controls: AbstractControlConfig[];
}

export interface FormControlConfig<T> extends ValidatorConfigs {
  initialValue: T;
  normalizers?: string[];
}

export type AbstractControlConfig = (
  | FormControlConfig<unknown>
  | FormArrayConfig
  | FormGroupConfig
) & {
  controls?: AbstractControlConfig[] | { [key: string]: AbstractControlConfig };
};
