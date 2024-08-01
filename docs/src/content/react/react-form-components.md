# React Forms

React components for binding [`@reactables/forms`](https://github.com/reactables/reactables/tree/main/packages/forms) reactables.

## Installation <a name="installation"></a>

`npm i @reactables/react-forms`

### `Form`<a name="form"></a>

```typescript
type HookedRxForm = HookedReactable<ControlModels.Form<unknown>, RxFormActions>;
```

`Form` is the provider component giving child `Field` and `FormArray` child components access to a `HookedRxForm`.

<a href="https://stackblitz.com/edit/vitejs-vite-6lzq4i?file=src%2FMyForm.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
</a>

<br>
<br>

```typescript
import { build, group, control } from '@reactables/forms';
import { useReactable } from '@reactables/react';
import { Form, Field } from '@reactables/react-forms';
import Input from './Input';

const userConfig = group({
  controls: {
    name: control(['', 'required']),
    email: control(['', ['required', 'email']]),
  },
});

const MyForm = () => {
  const rxForm = useReactable(() => build(userConfig));

  return (
    <Form rxForm={rxForm}>
      <Field name="name" label="Name:" component={Input} />
      <Field name="email" label="Email: " component={Input} />
    </Form>
  );
};

export default MyForm;
```

### `Field`<a name="field"></a>

A wrapper component that connects a component to the reactable form.

Below is an `Input` component that will be wrapped by `Field` and provided the `FormControl<T>` via the `meta` prop.

`WrappedFieldInputProps` are passed in by the `input` prop which contains the input value and event handlers.

<a href="https://stackblitz.com/edit/vitejs-vite-6lzq4i?file=src%2FMyForm.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
</a>

<br>
<br>

```typescript
import { WrappedFieldProps } from '@reactables/react-forms';

const Input = ({
  input,
  label,
  meta: { touched, errors, pending, valid },
}: { label?: string } & WrappedFieldProps) => {
  return (
    <div className="mb-3">
      {label && (
        <label className={`form-label ${touched && !valid ? 'text-danger' : ''}`}>{label}</label>
      )}
      <input
        {...input}
        type="text"
        className={`form-control ${touched && !valid ? 'is-invalid' : ''}`}
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

Continuing from our `Form` example we can wrap the `Input` component above as follows:

```typescript
import { build, group, control } from '@reactables/forms';
import { useReactable } from '@reactables/react-helpers';
import { Form, Field } from '@reactables/react-forms';
import Input from './Input';

const userConfig = group({
  controls: {
    name: control(['', 'required']),
    email: control(['', ['required', 'email']]),
  },
});

const MyForm = () => {
  const rxForm = useReactable(() => build(userConfig));

  return (
    <Form rxForm={rxForm}>
      <Field name="name" label="Name:" component={Input} />
      <Field name="email" label="Email: " component={Input} />
    </Form>
  );
};

export default MyForm;

```

### `FormArray`<a name="form-array"></a>

`FormArray` uses the function as children pattern and makes available the `array` items as well as `pushControl` and `removeControl` action methods.

<a href="https://stackblitz.com/edit/vitejs-vite-fmst4h?file=src%2FMyForm.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
</a>

<br>
<br>

```typescript
import { build, group, control, array } from '@reactables/forms';
import { useReactable } from '@reactables/react';
import { Form, Field, FormArray } from '@reactables/react-forms';
import Input from './Input';

const userConfig = group({
  controls: {
    name: control(['', 'required']),
    email: control(['', ['required', 'email']]),
  },
});

const MyForm = () => {
  const rxForm = useReactable(() =>
    build(
      group({
        controls: {
          contacts: array({
            controls: [userConfig],
          }),
        },
      })
    )
  );

  return (
    <Form rxForm={rxForm}>
      <FormArray name="contacts">
        {({ items, pushControl, removeControl }) => {
          return (
            <>
              {items.map((control, index) => {
                return (
                  <div key={control.key}>
                    <Field name={`contacts.${index}.name`} label="Name:" component={Input} />
                    <Field name={`contacts.${index}.email`} label="Email: " component={Input} />
                    <button type="button" onClick={() => removeControl(index)}>
                      Remove contact
                    </button>
                  </div>
                );
              })}
              <button type="button" onClick={() => pushControl(userConfig)}>
                Add User
              </button>
            </>
          );
        }}
      </FormArray>
    </Form>
  );
};

export default MyForm;

```
