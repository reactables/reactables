import { FormControlConfig, FormArrayConfig, FormGroupConfig } from '../Models';
export const control = <T>(config: FormControlConfig<T>) => config;
export const array = (config: FormArrayConfig) => config;
export const group = (config: FormGroupConfig) => config;
