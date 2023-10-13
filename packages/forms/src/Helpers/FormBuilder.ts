import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';
import { HubFactory } from '@hub-fx/core';
import { buildHub2Source } from './buildHub2Source';
import { buildHub1Reducer } from '../Reducers';
import { hub2Reducer } from '../Reducers/Hub2/hub2Reducer';
import { formChange } from '../Actions';
import { ValidatorFn, ValidatorAsyncFn } from '../Models/Validators';

type FbControl<T> = [
  T,
  (ValidatorFn | ValidatorFn[])?,
  (ValidatorAsyncFn | ValidatorAsyncFn[])?,
];
const control = <T>(config: FormControlConfig<T> | FbControl<T>) => {
  if (Array.isArray(config)) {
    return (config as FbControl<T>).reduce((acc, item, index) => {
      const indexMap = {
        0: 'initialValue',
        1: 'validators',
        2: 'asyncValidators',
      };
      return {
        ...acc,
        [indexMap[index]]: index < 1 ? item : [].concat(item || []),
      };
    }, {} as FormControlConfig<T>);
  }

  return config;
};

const array = (config: FormArrayConfig) => config;
const group = (config: FormGroupConfig) => config;
const build = (config: AbstractControlConfig, hub = HubFactory()) => {
  const hub1Reducer = buildHub1Reducer(config);
  const hub2Source = buildHub2Source(hub1Reducer, hub);
  const hub2 = HubFactory({ sources: [hub2Source] });

  const initialState = hub2Reducer(null, formChange(hub1Reducer()));

  return hub2.store({ reducer: hub2Reducer, initialState });
};

export const FormBuilder = {
  control,
  array,
  group,
  build,
};
