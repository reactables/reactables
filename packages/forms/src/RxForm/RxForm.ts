import { RxBuilder, Reactable, EffectsAndSources } from '@reactables/core';
import { filter } from 'rxjs/operators';
import { buildFormState } from '../Helpers/buildFormState';
import { ControlChange, AddControl, MarkTouched, PushControl } from '../Models/Payloads';
import { ControlRef } from '../Models';
import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';
import { buildHub2Source } from '../Helpers/buildHub2Source';
import { ValidatorFn, ValidatorAsyncFn } from '../Models/Validators';
import { updateValues } from '../Reducers/Hub1/updateValues';
import { removeControl } from '../Reducers/Hub1/removeControl';
import { addControl } from '../Reducers/Hub1/addControl';
import { pushControl } from '../Reducers/Hub1/pushControl';
import { markControlAsPristine } from '../Reducers/Hub1/markControlAsPristine';
import { markControlAsTouched } from '../Reducers/Hub1/markControlAsTouched';
import { markControlAsUntouched } from '../Reducers/Hub1/markControlAsUntouched';
import { resetControl } from '../Reducers/Hub1/resetControl';
import { asyncValidation } from '../Reducers/Hub2/asyncValidation';
import { asyncValidationResponseSuccess } from '../Reducers/Hub2/asyncValidationResponseSuccess';
import { formChange } from '../Reducers/Hub2/formChange';
import { BaseControl, Form } from '../Models/Controls';
import { getScopedEffectsForControl } from '../Helpers/addAsyncValidationEffects';

// Config Builders
type FbControl<T> = [T, (ValidatorFn | ValidatorFn[])?, (ValidatorAsyncFn | ValidatorAsyncFn[])?];
export const control = <T>(config: FormControlConfig<T> | FbControl<T>) => {
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

export const array = (config: FormArrayConfig) => config;
export const group = (config: FormGroupConfig) => config;

// Building Reactable
export type RxFormActions = {
  updateValues: <T>(payload: ControlChange<T>) => void;
  addControl: (payload: AddControl) => void;
  pushControl: (payload: PushControl) => void;
  removeControl: (payload: ControlRef) => void;
  markControlAsPristine: (payload: ControlRef) => void;
  markControlAsTouched: (payload: MarkTouched) => void;
  markControlAsUntouched: (payload: ControlRef) => void;
  resetControl: (payload: ControlRef) => void;
};

export const build = (
  config: AbstractControlConfig,
  options?: EffectsAndSources,
): Reactable<Form<unknown>, RxFormActions> => {
  const initialState = buildFormState(config);

  const rxHub1 = RxBuilder({
    initialState,
    reducers: {
      updateValues,
      removeControl,
      addControl,
      pushControl,
      markControlAsPristine,
      markControlAsTouched,
      markControlAsUntouched,
      resetControl,
    },
    ...options,
  });

  const rxHub2 = RxBuilder({
    sources: [buildHub2Source(rxHub1)],
    initialState: null as Form<unknown>,
    reducers: {
      formChange,
      asyncValidation: {
        reducer: asyncValidation,
        effects: (control: BaseControl<unknown>) => ({
          key: control.key,
          effects: getScopedEffectsForControl(control),
        }),
      },
      asyncValidationResponseSuccess,
    },
  });

  return {
    state$: rxHub2.state$.pipe(filter((form) => form !== null)),
    actions: rxHub1.actions,
  };
};
