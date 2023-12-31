import { RxBuilder, Reactable, EffectsAndSources, Action, Reducer } from '@reactables/core';
import { filter } from 'rxjs/operators';
import { buildFormState } from '../Helpers/buildFormState';
import {
  UpdateValuesPayload,
  AddControlPayload,
  MarkTouchedPayload,
  PushControlPayload,
} from '../Models/Payloads';
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
import { BaseControl, Form, BaseFormState } from '../Models/Controls';
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
  updateValues: <T>(payload: UpdateValuesPayload<T>) => void;
  addControl: (payload: AddControlPayload) => void;
  pushControl: (payload: PushControlPayload) => void;
  removeControl: (payload: ControlRef) => void;
  markControlAsPristine: (payload: ControlRef) => void;
  markControlAsTouched: (payload: MarkTouchedPayload) => void;
  markControlAsUntouched: (payload: ControlRef) => void;
  resetControl: (payload: ControlRef) => void;
};

// For building custom reducers
export interface FormReducers {
  updateValues: <T>(
    state: BaseFormState<T>,
    action: Action<UpdateValuesPayload<unknown>>,
  ) => BaseFormState<T>;
  removeControl: <T>(state: BaseFormState<T>, action: Action<ControlRef>) => BaseFormState<T>;
  pushControl: <T>(state: BaseFormState<T>, action: Action<PushControlPayload>) => BaseFormState<T>;
  addControl: <T>(state: BaseFormState<T>, action: Action<AddControlPayload>) => BaseFormState<T>;
  markControlAsPristine: <T>(
    state: BaseFormState<T>,
    action: Action<ControlRef>,
  ) => BaseFormState<T>;
  markControlAsTouched: <T>(
    state: BaseFormState<T>,
    action: Action<MarkTouchedPayload>,
  ) => BaseFormState<T>;
  markControlAsUntouched: <T>(
    state: BaseFormState<T>,
    action: Action<ControlRef>,
  ) => BaseFormState<T>;
  resetControl: <T>(state: BaseFormState<T>, action: Action<ControlRef>) => BaseFormState<T>;
}

const reducerTools: FormReducers = {
  updateValues: <T>(state: BaseFormState<T>, action: Action<UpdateValuesPayload<unknown>>) =>
    updateValues(state, action, true),
  removeControl: <T>(state: BaseFormState<T>, action: Action<ControlRef>) =>
    removeControl(state, action, true),
  pushControl: <T>(state: BaseFormState<T>, action: Action<PushControlPayload>) =>
    pushControl(state, action, true),
  addControl: <T>(state: BaseFormState<T>, action: Action<AddControlPayload>) =>
    addControl(state, action, true),
  markControlAsPristine: <T>(state: BaseFormState<T>, action: Action<ControlRef>) =>
    markControlAsPristine(state, action, true),
  markControlAsTouched: <T>(state: BaseFormState<T>, action: Action<MarkTouchedPayload>) =>
    markControlAsTouched(state, action, true),
  markControlAsUntouched: <T>(state: BaseFormState<T>, action: Action<ControlRef>) =>
    markControlAsUntouched(state, action, true),
  resetControl: <T>(state: BaseFormState<T>, action: Action<ControlRef>) =>
    resetControl(state, action, true),
};

type CustomReducer = (
  reducers: FormReducers,
  state: BaseFormState<unknown>,
  action: Action<unknown>,
) => BaseFormState<unknown>;

export interface CustomReducers {
  [key: string]: CustomReducer;
}

export interface RxFormOptions<T extends CustomReducers> extends EffectsAndSources {
  reducers?: T;
}

export const build = <T extends CustomReducers>(
  config: AbstractControlConfig,
  options: RxFormOptions<T> = {},
): Reactable<Form<unknown>, { [K in keyof T]: (payload?) => void } & RxFormActions> => {
  const initialState = buildFormState(config);

  const { reducers, ...otherOptions } = options;

  const customReducers = Object.entries(reducers || ({} as T)).reduce(
    (acc, [key, reducer]) => ({
      ...acc,
      [key as keyof T]: ({ form }: BaseFormState<unknown>, action: Action<unknown>) => {
        return reducer(reducerTools, { form }, action);
      },
    }),
    {} as { [K in keyof T]: Reducer<BaseFormState<unknown>> },
  );

  const [hub1State$, hub1Actions] = RxBuilder({
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
      ...customReducers,
    },
    ...otherOptions,
  });

  const [state$] = RxBuilder({
    sources: [buildHub2Source(hub1State$)],
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

  return [
    state$.pipe(filter((form) => form !== null)),
    hub1Actions as { [K in keyof T]: (payload?) => void } & RxFormActions,
  ];
};
