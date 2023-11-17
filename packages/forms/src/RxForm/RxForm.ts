import { RxBuilder, Reactable } from '@hub-fx/core';
import { getHub1Slice } from './getHub1Slice';
import { buildFormState } from '../Helpers/buildFormState';
import { hub2Slice } from './hub2Slice';
import { ControlChange, AddControl, MarkTouched } from '../Models/Payloads';
import { ControlRef } from '../Models';
import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';
import { buildHub2Source } from '../Helpers/buildHub2Source';
import { ValidatorFn, ValidatorAsyncFn } from '../Models/Validators';

// Config Builders
type FbControl<T> = [T, (ValidatorFn | ValidatorFn[])?, (ValidatorAsyncFn | ValidatorAsyncFn[])?];
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

// Building Reactable
type RxFormActions = {
  updateValues: <T>(payload: ControlChange<T>) => void;
  addControl: (payload: AddControl) => void;
  removeControl: (payload: ControlRef) => void;
  markControlAsPristine: (payload) => void;
  markControlAsTouched: (payload: MarkTouched) => void;
  markControlAsUntouched: (payload: ControlRef) => void;
  resetControl: (payload: ControlRef) => void;
};
const build = (config: AbstractControlConfig): Reactable<unknown, RxFormActions> => {
  const initialState = buildFormState(config);
  const hub1Slice = getHub1Slice(initialState);

  const hub1 = RxBuilder.createHub();
  const sourceForHub2$ = buildHub2Source(hub1Slice.reducer, hub1);
  const hub2 = RxBuilder.createHub({ sources: [sourceForHub2$] });

  const { actions } = hub1Slice;
  const { dispatch } = hub1;

  return {
    state$: hub2.store({ reducer: hub2Slice.reducer }),
    actions: {
      updateValues: (payload) => dispatch(actions.updateValues(payload)),
      addControl: (payload) => dispatch(actions.addControl(payload)),
      removeControl: (payload) => dispatch(actions.removeControl(payload)),
      markControlAsPristine: (payload) => dispatch(actions.markControlAsPristine(payload)),
      markControlAsTouched: (payload) => dispatch(actions.markControlAsTouched(payload)),
      markControlAsUntouched: (payload) => dispatch(actions.markControlAsTouched(payload)),
      resetControl: (payload) => dispatch(actions.markControlAsTouched(payload)),
    },
  };
};

export const RxForm = {
  group,
  array,
  control,
  build,
};
