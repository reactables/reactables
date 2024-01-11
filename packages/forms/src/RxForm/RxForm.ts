import {
  RxBuilder,
  Reactable,
  EffectsAndSources,
  Action,
  Reducer,
  Effect,
  ScopedEffects,
} from '@reactables/core';
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
    payload: UpdateValuesPayload<unknown>,
  ) => BaseFormState<T>;
  removeControl: <T>(state: BaseFormState<T>, payload: ControlRef) => BaseFormState<T>;
  pushControl: <T>(state: BaseFormState<T>, payload: PushControlPayload) => BaseFormState<T>;
  addControl: <T>(state: BaseFormState<T>, payload: AddControlPayload) => BaseFormState<T>;
  markControlAsPristine: <T>(state: BaseFormState<T>, payload: ControlRef) => BaseFormState<T>;
  markControlAsTouched: <T>(
    state: BaseFormState<T>,
    payload: MarkTouchedPayload,
  ) => BaseFormState<T>;
  markControlAsUntouched: <T>(state: BaseFormState<T>, payload: ControlRef) => BaseFormState<T>;
  resetControl: <T>(state: BaseFormState<T>, payload: ControlRef) => BaseFormState<T>;
}

const reducerTools: FormReducers = {
  updateValues: <T>(state: BaseFormState<T>, payload: UpdateValuesPayload<unknown>) =>
    updateValues(state, { payload }, true),
  removeControl: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    removeControl(state, { payload }, true),
  pushControl: <T>(state: BaseFormState<T>, payload: PushControlPayload) =>
    pushControl(state, { payload }, true),
  addControl: <T>(state: BaseFormState<T>, payload: AddControlPayload) =>
    addControl(state, { payload }, true),
  markControlAsPristine: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    markControlAsPristine(state, { payload }, true),
  markControlAsTouched: <T>(state: BaseFormState<T>, payload: MarkTouchedPayload) =>
    markControlAsTouched(state, { payload }, true),
  markControlAsUntouched: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    markControlAsUntouched(state, { payload }, true),
  resetControl: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    resetControl(state, { payload }, true),
};

type CustomReducer = (
  reducers: FormReducers,
  state: BaseFormState<unknown>,
  action: Action<unknown>,
) => BaseFormState<unknown>;

export interface CustomReducers {
  [key: string]:
    | CustomReducer
    | {
        reducer: CustomReducer;
        effects?: ((payload?: unknown) => ScopedEffects<unknown>) | Effect<unknown, unknown>[];
      };
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

  const customReducers = Object.entries(reducers || ({} as T)).reduce((acc, [key, _case]) => {
    const _reducer = typeof _case === 'function' ? _case : _case.reducer;
    const effects = typeof _case === 'function' ? [] : _case.effects;

    return {
      ...acc,
      [key as keyof T]: {
        reducer: ({ form }: BaseFormState<unknown>, action: Action<unknown>) => {
          return _reducer(reducerTools, { form }, action);
        },
        effects,
      },
    };
  }, {} as { [K in keyof T]: Reducer<BaseFormState<unknown>> });

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
