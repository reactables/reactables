# Reactable Forms

## Description

Reactive forms with [Reactables](https://github.com/reactables/reactables/tree/main/packages/core).

## Table of Contents

1. [Installation](#installation)
1. [API](#api)
    1. [RxActions](#api-actions)
        1. [updateValues](#api-actions-update-values)
        1. [addControl](#api-actions-add-conrtrol)
        1. [pushControl](#api-actions-push-control)
        1. [removeControl](#api-actions-remove-control)
        1. [markControlAsPristine](#api-actions-mark-as-pristine)
        1. [markControlAsTouched](#api-actions-mark-as-touched)
        1. [markControlAsUntouched](#api-actions-mark-as-untouched)
        1. [resetControl](#api-actions-resetControl)
    1. [build](#api-build)
        1. [RxFormOptions](#api-form-options)
    1. [control](#api-control)
    1. [group](#api-group)
    1. [array](#api-array)
    1. [Other Interfaces](#api-interfaces)
        1. [Form](#api-form)
        1. [FormControl](#api-form-control)
        1. [ControlRef](#api-control-ref)
        1. [FormErrors](#api-form-errors)
        1. [FormReducers](#api-form-reducers)


## Installation <a name="installation"></a>

Installation will require [RxJS](https://rxjs.dev/) if not already installed.

`npm i rxjs @reactables/forms`

## API <a name="api"></a>

The API for building Reactable Forms is very similar to [Angular FormBuilder](https://angular.io/api/forms/FormBuilder). It has been adapted to support Reactable features.

### `RxActions` <a name="api-actions"></a>

Actions available to trigger state changes on Reactable.

#### `updateValues` <a name="api-actions-update-values"></a>

Updates value of a [`FormControl`](#api-form-control). For form group and form arrays, update will only occur if specified descendant controls exists. Otherwise it will throw an error.

```typescript
type updateValues = <T>(payload: UpdateValuesPayload<T>) => void;

export interface UpdateValuesPayload<T> {
  value: T;
  controlRef: ControlRef;
}

```

#### `addControl` <a name="api-actions-add-control"></a>

Adds a control to a form group.

```typescript
type addControl = (payload: AddControlPayload) => void;

export interface AddControlPayload {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

```

#### `pushControl` <a name="api-actions-push-control"></a>

Pushes a control to a form array.

```typescript
type pushControl = (payload: PushControlPayload) => void;

export interface PushControlPayload {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

```

#### `removeControl` <a name="api-actions-remove-control"></a>

Removes a specified control from form.

```typescript
type removeControl = (payload: ControlRef) => void;

```

#### `markControlAsPristine` <a name="api-actions-mark-as-pristine"></a>

Marks a control and all descendant controls as pristine.

```typescript
type markControlAsPristine = (payload: ControlRef) => void;

```

#### `markControlAsTouched` <a name="api-actions-mark-as-touched"></a>

Marks a control and all ancestors as touched. Can pass a `markAll` true to mark all descendants as touched as well.

```typescript
type markControlAsTouched = (payload: MarkTouchedPayload) => void;

export interface MarkTouchedPayload {
  controlRef: ControlRef;
  markAll?: boolean;
}

```

#### `markControlAsUntouched` <a name="api-actions-mark-as-untouched"></a>

Marks a control and all descendants as untouched. Will recheck ancestors controls and update touched status.

```typescript
type markControlAsUnTouched = (payload: ControlRef) => void;

```

#### `resetControl` <a name="api-actions-resetControl"></a>

Marks a control and all descendants as untouched. Will recheck ancestors controls and update touched status.

```typescript
type resetControls = (payload: ControlRef) => void;

```

### `build` <a name="api-build"></a>

```typescript
type build = (config: AbstractControlConfig, options?: RxFormOptions) => Reactable<Form<unknown>, RxFormActions>
```

Factory method for creating a form Reactable. Accepts a configuration object generated by one or more helper methods - [`control`](#api-control), [`group`](#api-group), [`array`](#api-array). Also accepts an `RxFormOptions` object.


#### `RxFormOptions` <a name="api-form-options"></a>

Options to customize RxForm behaviour.

```typescript
interface RxFormOptions {
  reducers?: { [key:string]: CustomReducer }
  effects?: Effect<unknown, unknown>[];
  sources?: Observable<Action<unknown>>[] | { [key: string]: Observable<unknown> };
}

type CustomReducer = (
  reducers: FormReducers,
  state: BaseFormState<unknown>,
  action: Action<unknown>,
) => BaseFormState<unknown>;

```
| Property | Description |
| -------- | ----------- |
| reducers (optional) | Dictionary of `CustomReducer`s to implement custom form behaviour. The `CustomReducer` provides built in [`FormReducers`](#api-form-reducers). **Form state updates need to be made with [`FormReducers`](#api-form-reducers) to maintain integrity of the form state tree (i.e validation states of parent and child controls)**. |
| effects (optional) | Array of [Effects](https://github.com/reactables/reactables/tree/main/packages/core#api-effect) to be registered to the Reactable. |
| sources (optional) | Additional [Action](https://github.com/reactables/reactables/tree/main/packages/core#action-) Observables the Reactable is listening to. Can be an array or a dictionary where key is the action type and value is the Observable emitting the payload. |

### `control` <a name="api-control"></a>

Function to create a `FormControlConfig` configuration object. Accepts a configuration object or a tuple.
```typescript
type control = <T>(config: FormControlConfig<T> | FbControl<T>) => FormControlConfig<T>

interface FormControlConfig<T>  {
  initialValue: T;
  validators?: ValidatorFn[];
  asyncValidators?: ValidatorAsyncFn[];
}

type FbControl<T> = [T, (ValidatorFn | ValidatorFn[])?, (ValidatorAsyncFn | ValidatorAsyncFn[])?];
```

### `group` <a name="api-group"></a>

Function to create a `FormGroupConfig` configuration object. Accepts a configuration object containing a `controls` dictionary of additional configuration objects generated by [`control`](#api-control), [`group`](#api-group), or [`array`](#api-array).

```typescript
type group = (config: FormGroupConfig) => FormGroupConfig

interface FormGroupConfig{
  validators?: ValidatorFn[];
  asyncValidators?: ValidatorAsyncFn[];
  controls: { [key: string]: AbstractControlConfig };
}
```
### `array` <a name="api-array"></a>

Function to create a `FormArrayConfig` configuration object. Accepts a configuration object containing a `controls` array of additional configuration objects generated by [`control`](#api-control), [`group`](#api-group), or [`array`](#api-array).

```typescript
type array = (config: FormArrayConfig) => FormArrayConfig

interface FormArrayConfig {
  validators?: ValidatorFn[];
  asyncValidators?: ValidatorAsyncFn[];
  controls: AbstractControlConfig[];
}
```

### Other Interfaces <a name="api-interfaces"></a>

#### `Form` <a name="api-form"></a>
Form state. Dictionary of [`FormControl`](#api-form-control)(s) where the key is a period separated representation of the [`ControlRef`](#api-control-ref) tuple.

```typescript
export interface Form<T> {
  root?: FormControl<T>;
  [key: string]: FormControl<unknown>;
}

```

#### `FormControl` <a name="api-form-control"></a>

```typescript

export interface FormControl<T> extends BaseControl<T>, Hub2Fields {
  pristineValue: T;
  controlRef: ControlRef;
  value: T;
  dirty: boolean;
  touched: boolean;
  validatorErrors: FormErrors;
  key: string;
  asyncValidatorErrors: FormErrors;
  asyncValidateInProgress: { [key: string | number]: boolean };
  errors: FormErrors;
  valid: boolean;
  childrenValid: boolean;
  pending?: boolean;
  config: AbstractControlConfig;
}
```
| Property | Description |
| -------- | ----------- |
| pristineValue  | Original value of control. Use to determine if control is dirty. |
| controlRef  | Controls [`ControlRef`](#api-control-ref). |
| value  | Control value. |
| touched  | Touched status of control |
| validatorErrors | [`FormErrors`](#api-form-errors) from validators (non-async) |
| asyncValidatorErrors | [`FormErrors`](#api-form-errors) from async validators |
| errors | [`FormErrors`](#api-form-errors) validatorErrors and asyncValidatorErrors merged. |
| valid | Valid status of control. Also checks descendants.
| childrenValid | Valid status of direct child controls.
| config | Original config for form control |



#### `ControlRef` <a name="api-control-ref"></a>

Control Reference represented as a tuple for the [`FormControl`](#api-form-control)

#### `FormErrors` <a name="api-form-errors"></a>

Dictionary of errors for the control.

```typescript
export interface FormErrors {
  [key: string]: boolean;
}
```

#### `FormReducers` <a name="api-form-reducers"></a>

Built in reducers to be used to update state of form tree. Payload and behaviour is same and descrbed in [`RxActions`](#api-actions); 

```typescript

export interface FormReducers {
  updateValues: <T>(state: BaseFormState<T>, payload: UpdateValuesPayload<unknown>,
  ) => BaseFormState<T>;
  removeControl: <T>(state: BaseFormState<T>, payload: ControlRef) => BaseFormState<T>;
  pushControl: <T>(state: BaseFormState<T>, payload: PushControlPayload) => BaseFormState<T>;
  addControl: <T>(state: BaseFormState<T>, payload: AddControlPayload) => BaseFormState<T>;
  markControlAsPristine: <T>(state: BaseFormState<T>, payload: ControlRef) => BaseFormState<T>;
  markControlAsTouched: <T>(state: BaseFormState<T>, payload: MarkTouchedPayload) => BaseFormState<T>;
  markControlAsUntouched: <T>(state: BaseFormState<T>, payload: ControlRef,
  ) => BaseFormState<T>;
  resetControl: <T>(state: BaseFormState<T>, payload: ControlRef) => BaseFormState<T>;
}
```