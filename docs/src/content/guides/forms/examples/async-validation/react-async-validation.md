<a href="https://stackblitz.com/edit/vitejs-vite-enriqs?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

See <a href="/react/react-bindings">React Bindings</a> & <a href="react/react-form-components">React Form Components</a> for API reference!

`Input.tsx`

```typescript
import { WrappedFieldProps } from '@reactables/react-forms';
const Input = ({
  input,
  label,
  meta: { touched, errors, valid, pending },
}: { label?: string } & WrappedFieldProps) => {
  return (
    <div className="mb-3">
      {label && (
        <label
          className={`form-label ${touched && !valid ? 'text-danger' : ''}`}
        >
          {label}
        </label>
      )}
      <input
        {...input}
        type="email"
        className={`form-control ${touched && !valid ? 'is-invalid' : ''}`}
      />
      {touched && errors.required && (
        <div>
          <small className="text-danger">Field is required</small>
        </div>
      )}
      {touched && errors.email && (
        <div>
          <small className="text-danger">Email invalid</small>
        </div>
      )}
      {touched && errors.blacklistedEmail && (
        <div>
          <small className="text-danger">Email is blacklisted</small>
        </div>
      )}
      {pending && <span>Validating...</span>}
    </div>
  );
};

export default Input;
```

`App.ts`

```typescript
import './App.css';
import { useReactable } from '@reactables/react';
import { Form, Field } from '@reactables/react-forms';
import { RxFormAsyncValidation } from './RxFormAsyncValidation';
import Input from './Input';

function App() {
  const rxForm = useReactable(RxFormAsyncValidation);
  return (
    <Form rxForm={rxForm}>
      <Field component={Input} name="email" label="Email: " />
    </Form>
  );
}

export default App;


```