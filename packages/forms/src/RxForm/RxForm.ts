import {
  RxBuilder,
  Reactable,
  Action,
  Effect,
  ScopedEffects,
  ActionMap,
  DestroyAction,
  ActionObservableWithTypes,
} from '@reactables/core';
import { Observable } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
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
import { asyncValidationResponse } from '../Reducers/Hub2/asyncValidationResponse';
import { formChange } from '../Reducers/Hub2/formChange';
import { BaseControl, Form, BaseFormState } from '../Models/Controls';
import { getScopedEffectsForControl } from '../Helpers/addAsyncValidationEffects';
import * as Validators from '../Validators/Validators';
import { DEFAULT_HUB2_FIELDS } from '../Models/Controls';

// Config Builders
type FbControl<T> = [T, (string | string[])?, (string | string[])?];
export const control = <T>(config: FormControlConfig<T> | FbControl<T>) => {
  if (Array.isArray(config)) {
    return (config as FbControl<T>).reduce((acc, item, index) => {
      const indexMap: { [key: number]: string } = {
        0: 'initialValue',
        1: 'validators',
        2: 'asyncValidators',
      };
      return {
        ...acc,
        [indexMap[index]]: index < 1 ? item : ([] as any[]).concat(item || []),
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
} & ActionMap;

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

const reducerTools = (providers: RxFormProviders): FormReducers => ({
  updateValues: <T>(state: BaseFormState<T>, payload: UpdateValuesPayload<unknown>) =>
    updateValues(state, { type: 'updateValues', payload }, providers, true),
  removeControl: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    removeControl(state, { type: 'removeControl', payload }, providers, true),
  pushControl: <T>(state: BaseFormState<T>, payload: PushControlPayload) =>
    pushControl(state, { type: 'pushControl', payload }, providers, true),
  addControl: <T>(state: BaseFormState<T>, payload: AddControlPayload) =>
    addControl(state, { type: 'addControl', payload }, providers, true),
  resetControl: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    resetControl(state, { type: 'resetControl', payload }, providers, true),
  markControlAsPristine: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    markControlAsPristine(state, { type: 'markControlAsPristine', payload }, true),
  markControlAsTouched: <T>(state: BaseFormState<T>, payload: MarkTouchedPayload) =>
    markControlAsTouched(state, { type: 'markControlAsTouched', payload }, true),
  markControlAsUntouched: <T>(state: BaseFormState<T>, payload: ControlRef) =>
    markControlAsUntouched(state, { type: 'markControlAsUntouched', payload }, true),
});

export type CustomReducerFunc<FormValue = unknown, Payload = unknown> = (
  reducers: FormReducers,
  state: BaseFormState<FormValue>,
  action: Action<Payload>,
) => BaseFormState<unknown>;

export type CustomReducer<FormValue = unknown, Payload = unknown> =
  | CustomReducerFunc<FormValue, Payload>
  | {
      reducer: CustomReducerFunc<FormValue, Payload>;
      effects?: Effect<unknown, unknown>[] | ((payload?: unknown) => ScopedEffects<unknown>);
    };

// Mapping a Custom reducer function to an action creator
export type ActionCreatorTypeFromCustomReducer<T> = T extends (
  reducers: FormReducers,
  state: BaseFormState<unknown>,
) => BaseFormState<unknown>
  ? () => void
  : T extends CustomReducerFunc<unknown, infer P>
  ? (payload: P) => void
  : T extends {
      reducer: (reducers: FormReducers, state: BaseFormState<unknown>) => BaseFormState<unknown>;
    }
  ? () => void
  : T extends { reducer: CustomReducerFunc<unknown, infer P> }
  ? (payload: P) => void
  : never;

export interface RxFormOptions<
  T extends Record<string, CustomReducer<any>> = Record<string, CustomReducer<any>>,
> {
  reducers?: T;
  providers?: RxFormProviders;
  name?: string;
  debug?: boolean;
  sources?: Observable<Action<unknown>>[];
}

type NormalizerFunction<T> = (value: T) => T;

export interface RxFormProviders {
  normalizers?: { [key: string]: NormalizerFunction<unknown> };
  validators?: { [key: string]: ValidatorFn };
  asyncValidators?: { [key: string]: ValidatorAsyncFn };
}

export const build = <
  FormValue,
  CustomReducers extends Record<string, CustomReducer<FormValue>> = Record<
    string,
    CustomReducer<FormValue>
  >,
>(
  config: AbstractControlConfig,
  options: RxFormOptions<CustomReducers> = {},
) => {
  const providers = {
    normalizers: { ...options.providers?.normalizers },
    validators: { ...Validators, ...options.providers?.validators },
    asyncValidators: { ...options.providers?.asyncValidators },
  };

  const initialState: BaseFormState<FormValue> = buildFormState(config, undefined, providers);

  return createReactable<FormValue, CustomReducers>(initialState, options);
};

export const load = <
  FormValue,
  CustomReducers extends Record<string, CustomReducer<FormValue>> = Record<
    string,
    CustomReducer<FormValue>
  >,
>(
  state: Form<FormValue>,
  options: RxFormOptions<CustomReducers> = {},
) => {
  const baseFormState = {
    form: Object.entries(state).reduce(
      (acc: { [key: string]: BaseControl<unknown> }, [key, control]) => {
        return {
          ...acc,
          [key]: Object.entries(control)
            .filter(([key]) => !Object.keys(DEFAULT_HUB2_FIELDS).includes(key))
            .reduce(
              (acc: BaseControl<unknown>, [key, value]) => ({ ...acc, [key]: value as unknown }),
              {} as BaseControl<unknown>,
            ),
        };
      },
      {},
    ),
  } as BaseFormState<FormValue>;

  return createReactable<FormValue, CustomReducers>(baseFormState, options);
};

type CustomReducerActionTypes<T extends Record<string, CustomReducer>> = {
  [K in keyof T as `${K & string}`]: `${K & string}`;
};

type FormActionTypes = {
  updateValues: 'updateValues';
  addControl: 'addControl';
  pushControl: 'pushControl';
  removeControl: 'removeControl';
  markControlAsPristine: 'markControlAsPristine';
  markControlAsTouched: 'markControlAsTouched';
  markControlAsUntouched: 'markControlAsUntouched';
  resetControl: 'resetControl';
};

type ActionTypes<T extends Record<string, CustomReducer<any>>> = CustomReducerActionTypes<T> &
  FormActionTypes;

const createReactable = <FormValue, T extends Record<string, CustomReducer<FormValue>>>(
  initialBaseState: BaseFormState<FormValue>,
  options: RxFormOptions<T> = {},
  initialFormState?: Form<FormValue>,
): Reactable<
  Form<FormValue>,
  { [K in keyof T]: ActionCreatorTypeFromCustomReducer<T[K]> } & RxFormActions & DestroyAction,
  ActionTypes<T> & { destroy: 'destroy' }
> => {
  const providers = {
    normalizers: { ...options.providers?.normalizers },
    validators: { ...Validators, ...options.providers?.validators },
    asyncValidators: { ...options.providers?.asyncValidators },
  };

  const { reducers, debug, name, ...otherOptions } = options;

  const customReducers = Object.entries(reducers || ({} as T)).reduce((acc, [key, _case]) => {
    const _reducer = typeof _case === 'function' ? _case : _case.reducer;
    const effects = typeof _case === 'function' ? [] : _case.effects;

    return {
      ...acc,
      [key as keyof T]: {
        reducer: ({ form }: BaseFormState<FormValue>, action: Action<unknown>) => {
          return _reducer(reducerTools(providers), { form }, action);
        },
        effects,
      },
    };
  }, {});

  const [hub1State$, hub1Actions, hub1Actions$] = RxBuilder({
    initialState: initialBaseState,
    name: `Stage 1 ${name ? name : 'rxForm'}`,
    debug,
    reducers: {
      updateValues: (state, action: Action<UpdateValuesPayload<unknown>>) =>
        updateValues(state, action, providers),
      removeControl: (state, action: Action<ControlRef>) => removeControl(state, action, providers),
      addControl: (state, action: Action<AddControlPayload>) =>
        addControl(state, action, providers),
      pushControl: (state, action: Action<AddControlPayload>) =>
        pushControl(state, action, providers),
      resetControl: (state, action: Action<ControlRef>) => resetControl(state, action, providers),
      markControlAsPristine: (state, action: Action<ControlRef>) =>
        markControlAsPristine(state, action),
      markControlAsTouched: (state, action: Action<MarkTouchedPayload>) =>
        markControlAsTouched(state, action),
      markControlAsUntouched: (state, action: Action<ControlRef>) =>
        markControlAsUntouched(state, action),
      ...customReducers,
    },
    ...otherOptions,
  });

  const [state$, hub2Actions] = RxBuilder({
    sources: [buildHub2Source(hub1State$, initialBaseState).pipe(skip(initialFormState ? 1 : 0))],
    initialState: initialFormState || null,
    name: `Stage 2 ${name ? name : 'rxForm'}`,
    debug,
    reducers: {
      formChange,
      asyncValidationEffect: {
        reducer: (state) => state,
        effects: (control: BaseControl<unknown>) => ({
          key: control.key,
          effects: getScopedEffectsForControl(control, providers),
        }),
      },
      asyncValidation,
      asyncValidationResponse,
    },
  });

  const destroy = () => {
    hub1Actions.destroy();
    hub2Actions.destroy();
  };

  const actions = { ...hub1Actions, destroy } as {
    [K in keyof T]: ActionCreatorTypeFromCustomReducer<T[K]>;
  } & RxFormActions &
    DestroyAction;

  return [
    state$.pipe(filter((form) => form !== null)) as Observable<Form<FormValue>>,
    actions,
    hub1Actions$ as ActionObservableWithTypes<ActionTypes<T> & { destroy: 'destroy' }>,
  ];
};
