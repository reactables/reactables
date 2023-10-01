import { FormControlConfig, FormArrayConfig, FormGroupConfig } from '../Models';

const control = <T>(config: FormControlConfig<T>) => config;
const array = (config: FormArrayConfig) => config;
const group = (config: FormGroupConfig) => config;

export const FormConfig = {
  control,
  array,
  group,
};
