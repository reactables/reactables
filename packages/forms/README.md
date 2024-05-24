# Reactable Forms

## Description

Reactive forms with [Reactables](https://github.com/reactables/reactables/tree/main/packages/core).

## Table of Contents

1. [Installation](#installation)
1. [Examples](#examples)
    1. [Basic Form Group](#basic-form-group)
    1. [Validation](#validation-example)
    1. [Async Validation](#async-validation-example)
    1. [Normalizing Values](#normalizing-values)
    1. [Custom Reducer](#custom-reducer-example)

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
        1. [ValidatorFn](#api-validator-fn)
        1. [ValidatorAsyncFn](#api-validator-fn-async)
        1. [FormReducers](#api-form-reducers)
        1. [CustomReducers](#api-custom-reducers)
        1. [BaseFormState](#api-base-form-state)
        1. [BaseControl](#api-base-control)


## Installation <a name="installation"></a>

Installation requires [RxJS](https://rxjs.dev/) to be present.

`npm i rxjs` (if not already installed)

`npm i @reactables/forms`

## Examples <a name="examples"></a>

### Basic Form Group <a name="basic-form-group"></a>

```typescript
import { control, build, group } from '@reactables/forms';

// Create form reactable
const [state$, actions] = build(
  group({
    controls: {
      name: control(['']),
    },
  }),
);

// Bind Event Handlers
const nameControlEl = document.getElementById('name-control');
nameControlEl.oninput = ({ target: { value } }) =>{
  actions.updateValues({
    ['name'],
    value,
  });
} 

nameControlEl.onblur = () => {
  actions.markControlAsTouched({ controlRef: ['name'] });
};

// Subscribe to state updates and bind to view.
state$.subscribe((form) => {
  nameControlEl.value = form.name.value;
});
```
[See full example on StackBlitz](https://stackblitz.com/edit/github-qtpo1k-vm45ed?file=src%2Findex.js)

### Validation <a name="validation-example"></a>

`@reactable/forms` only comes with 3 built in validators, `required`, `email` & `arrayNotEmpty`. The developer can implement their own `ValidatorFn`s and provide them when building the reactable.

```typescript
// Create form reactable
const [state$, action] = build(
  group({
    controls: {
      name: control(['', 'required']),
      donuts: control(['0', 'min4']),
    },
  }),
  {
    providers: {
      // Provide ValidatorFns here
      validators: {
        min4: (value) => ({ min4: Number(value) < 4 }),
      },
    },
  }
);

// ... Bind event handers

// Subscribe to state updates and bind to view.
state$.subscribe((form) => {
  const { name, donuts } = form;

  nameControlEl.value = name.value;
  donutControlEl.value = donuts.value;

  // Show or hide errors based on form control states
  const handleErrors = (el, show) => {
    el.className = show ? 'form-error show' : 'form-error';
  };

  handleErrors(nameRequiredErrorEl, name.touched && name.errors.required);
  handleErrors(donuntMinOrderErrorEl, donuts.touched && donuts.errors.min4);
});


```

[See full example on StackBlitz](https://stackblitz.com/edit/github-qtpo1k-vm45ed?file=src%2Findex.js)

### Async Validation <a name="async-validation-example"></a>

`FormControl`s have a `pending: boolean` state when their value changes and are awaiting the result from asynchronous validation.

```typescript
import { control, build, group } from '@reactables/forms';
import { of, switchMap, delay } from 'rxjs';

const rxForm = build(
  group({
    controls: {
      email: control({
        initialValue: '',
        validators: ['email'],
        asyncValidators: ['blacklistedEmail'],
      }),
    },
  }),
  {
    providers: {
      asyncValidators: {
        blacklistedEmail: (control$) =>
          control$.pipe(
            switchMap(({ value }) =>
              of({
                blacklistedEmail: value === 'already@taken.com',
              }).pipe(delay(1000))
            )
          ),
      },
    },
  }
);

// ... Bind event handlers

// Subscribe to state updates and bind to view.
state$.subscribe((state) => {
  const { email } = state;

  emailControlEl.value = email.value;

  const handleErrors = (el, show) => {
    el.className = show ? 'form-error show' : 'form-error';
  };

  // Show pending status if async validation in progress
  emailPendingEl.className = email.pending ? 'show' : '';
  handleErrors(emailAsyncErrorEl, email.errors.blacklistedEmail);
});

```

[See full example on StackBlitz](https://stackblitz.com/edit/github-qtpo1k-vm45ed?file=src%2Findex.js)

### Normalize Values <a name="normalizing-values"></a>

User input for a `FormControl` leaf (i.e having no child controls) can be normalized via normalizer functions provided during form initialization

```typescript
import { control, build, group } from '@reactables/forms';

export const normalizePhone = (value) => {
  let input = value.replace(/\D/g, '').substring(0, 10); // First ten digits of input only
  const areaCode = input.substring(0, 3);
  const middle = input.substring(3, 6);
  const last = input.substring(6, 10);

  if (input.length > 6) {
    input = `(${areaCode}) ${middle} - ${last}`;
  } else if (input.length > 3) {
    input = `(${areaCode}) ${middle}`;
  } else if (input.length > 0) {
    input = `(${areaCode}`;
  }

  return input;
};

const rxForm = build(
  group({
    controls: {
      phone: control({
        initialValue: '',
        normalizers: ['phone']
      }),
    },
  }),
  {
    providers: {
      normalizers: {
        phone: normalizePhone,
      },
    },
  }
);
```

[See full example on StackBlitz](https://stackblitz.com/edit/github-qtpo1k-vm45ed?file=src%2Findex.js)

### Custom Reducer <a name="custom-reducer-example"></a>

You can declare [`CustomReducer`s](#api-custom-reducers) during form initialization to implement custom behaviour.

Below the form reactable will have a `doubleOrder` action method which can be called to double the order amount.

```typescript
import { control, build, group } from '@reactables/forms';

const rxForm = build(
  group({
    controls: {
      donuts: control(['0']),
    },
  }),
  {
    reducers: {
      doubleOrder: (formReducers, state) => {
        const { updateValues } = formReducers;

        const orders = Number(state.form.donuts.value);
        const value = (orders * 2).toString();

        return updateValues(state, { controlRef: ['donuts'], value });
      },
    },
  }
);

```

[See full example on StackBlitz](https://stackblitz.com/edit/github-qtpo1k-vm45ed?file=src%2Findex.js)

## API <a name="api"></a>

The API for building Reactable Forms inspired by [Angular FormBuilder](https://angular.io/api/forms/FormBuilder). It has been adapted to support Reactable features.

### `RxActions` <a name="api-actions"></a>

Actions available to trigger state changes on Reactable.

#### `updateValues` <a name="api-actions-update-values"></a>

Updates values of a [`FormControl`](#api-form-control). For form group and form arrays, updates will only occur if the specified descendant controls exists. Otherwise it will throw an error.

```typescript
type updateValues = <T>(payload: UpdateValuesPayload<T>) => void;

interface UpdateValuesPayload<T> {
  value: T;
  controlRef: ControlRef;
}

```

#### `addControl` <a name="api-actions-add-control"></a>

Adds a control to a form group.

```typescript
type addControl = (payload: AddControlPayload) => void;

interface AddControlPayload {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

```

#### `pushControl` <a name="api-actions-push-control"></a>

Pushes a control to a form array.

```typescript
type pushControl = (payload: PushControlPayload) => void;

interface PushControlPayload {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

```

#### `removeControl` <a name="api-actions-remove-control"></a>

Removes a specified control from the form.

```typescript
type removeControl = (payload: ControlRef) => void;

```

#### `markControlAsPristine` <a name="api-actions-mark-as-pristine"></a>

Marks a control and all descendant controls as pristine.

```typescript
type markControlAsPristine = (payload: ControlRef) => void;

```

#### `markControlAsTouched` <a name="api-actions-mark-as-touched"></a>

Marks a control and all ancestors as touched. Can set `markAll` to `true` to mark all descendants as touched as well (defaults to `false`).

```typescript
type markControlAsTouched = (payload: MarkTouchedPayload) => void;

interface MarkTouchedPayload {
  controlRef: ControlRef;
  markAll?: boolean;
}

```

#### `markControlAsUntouched` <a name="api-actions-mark-as-untouched"></a>

Marks a control and all descendants as untouched. This will recheck ancestor controls and update the touched status.

```typescript
type markControlAsUnTouched = (payload: ControlRef) => void;

```

#### `resetControl` <a name="api-actions-resetControl"></a>

Resets a control by removing existing control and rebuilding it with the original configuration.

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
```
| Property | Description |
| -------- | ----------- |
| reducers (optional) | Dictionary of [`CustomReducer`s](#api-custom-reducers) to implement custom form behaviour. The `CustomReducerFunc`(#api-custom-reducers) provides built in [`FormReducers`](#api-form-reducers). **Form state updates need to be made with [`FormReducers`](#api-form-reducers) to maintain integrity of the form state tree (i.e validation states of parent and child controls)**. |
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
interface Form<T> {
  root?: FormControl<T>;
  [key: string]: FormControl<unknown>;
}

```

#### `FormControl` <a name="api-form-control"></a>

```typescript

interface FormControl<T> {
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
interface FormErrors {
  [key: string]: boolean;
}
```

#### `ValidatorFn` <a name="api-validator-fn"></a>

Validator function that reads the value of the `FormControl` and returns a `FormErrors` object.

```typescript
type ValidatorFn = (value: unknown) => FormErrors
```

#### `ValidatorFnAsync` <a name="api-validator-fn-async"></a>

Validator function takes in an `BaseControl` observable and returns an `Observable<FormErrors>`.

```typescript
type ValidatorAsyncFn = <T>(control$: Observable<BaseControl<T>>) => Observable<FormErrors>;

```


#### `FormReducers` <a name="api-form-reducers"></a>

Built in reducers which can be used to update the state of the form tree. Payload and behaviour is the same and described in [`RxActions`](#api-actions);

```typescript

interface FormReducers {
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
#### `CustomReducers` <a name="api-custom-reducers"></a>

```typescript
type CustomReducerFunc = (
  reducers: FormReducers,
  state: BaseFormState<unknown>,
  action: Action<unknown>,
) => BaseFormState<unknown>;

type CustomReducer =
  | CustomReducerFunc
  | {
      reducer: CustomReducerFunc;
      effects?: Effect<unknown, unknown>[] | ((payload?: unknown) => ScopedEffects<unknown>);
    };

```

#### `BaseFormState` <a name="api-base-form-state"></a>

Form state before it is fully validated. This is accessible in `CustomReducer`s so developer can read the current state and implement custom form behaviours.

```typescript
interface BaseFormState<T> {
  form: BaseForm<T>;
}

interface BaseForm<T> {
  root?: BaseControl<T>;
  [key: string]: BaseControl<unknown>;
}

```

#### `BaseControl` <a name="api-base-control"></a>

`BaseControl` contains some control information before a fully validated `FormControl` is created.

```typescript

interface BaseControl<T> {
  pristineValue: T;
  controlRef: ControlRef;
  value: T;
  dirty: boolean;
  touched: boolean;
  validatorErrors: FormErrors;
  config: AbstractControlConfig;
  key: string;
}
```