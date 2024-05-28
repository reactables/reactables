
# Reactables React

## Description

React components for binding to form reactables from `@reactables/forms`.

## Table of Contents

1. [Installation](#installation)
1. [API](#api)
    1. [`Form`](#form)
    1. [`Field`](#field)
    1. [`FormArray`](#form-array)

## Installation <a name="installation"></a>

`npm i @reactables/react-forms`

## API<a name="api"></a>

### `Form`<a name="form"></a>

`Form` is the provider component giving child `Field` and `FormArray` child components access to a `HookedRxForm`.

```typescript
type HookedRxForm = [ControlModels.Form<unknown>, RxFormActions];
```

```typescript
import { build, group, control } from '@reactable/forms';
import { useReactable } from '@reactable/react';
import { Form } from '@reactable/react-form';

const userConfig = group(
  {
    controls: {
      name: control(['', 'required']),
      email: control(['', ['required', 'email']])
    }
  }
);

const MyForm = () => {
  const rxForm = useReactable(build(userConfig));

  return (
    <Form rxForm={rxForm}>
      {/* .... */}
    </Form>
  )
}
```

### `Field`<a name="field"></a>

A wrapper component that connects a component to the reactable form.

Below is an `Input` component that will be wrapped by `Field` and provided the `FormControl<T>` via the `meta` prop.

`WrappedFieldInputProps` are passed in by the `input` prop which contains the input value and event handlers.

```typescript
const Input = ({
  input,
  meta: { touched, errors, pending, valid }
}: { label?: string } & WrappedFieldProps) => {
  return (
    <div className="mb-3">
      {label && (
        <label className={`form-label ${touched && !valid ? 'text-danger' : ''}`}>{label}</label>
      )}
      <input
        {...input}
        type="text"
        className={`form-control ${
          (touched && !valid) ? 'is-invalid' : ''
        }`}
      />
      {touched && errors.required && (
        <div>
          <small className="text-danger">Field is required</small>
        </div>
      )}
      {touched && errors.email && (
        <div>
          <small className="text-danger">Not a valid email address</small>
        </div>
      )}
    </div>
  );
};

export default Input;

```

Continuing from our `Form` example we then can wrap the `Input` component above as follows:

```typescript
import { build, group, control } from '@reactable/forms';
import { useReactable } from '@reactable/react';
import { Form } from '@reactable/react-form';
import { formConfig } from './formConfig';
import Input from './Input';

const MyForm = () => {
  const rxForm = useReactable(build(formConfig));

  return (
    <Form rxForm={rxForm}>
      <Field name="name" component={Input} />
      <Field name="email" component={Input} />
    </Form>
  )
}

export default MyForm;
```
### `FormArray`<a name="form-array"></a>
