<a href="https://stackblitz.com/edit/vitejs-vite-enriqs?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
</a>

<br>
<br>

See <a href="/react/react-bindings">React Bindings</a> & <a href="react/react-form-components">React Form Components</a> for API reference!

`Input.tsx`

```typescript
import { WrappedFieldProps } from '@reactables/react-forms';
const Input = ({
  input,
  label,
  meta: { touched, valid },
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
        type="text"
        className={`form-control ${touched && !valid ? 'is-invalid' : ''}`}
      />
    </div>
  );
};

export default Input;


```

`App.tsx`

```typescript

import './App.css';
import { useReactable } from '@reactables/react';
import { Form, Field } from '@reactables/react-forms';
import { RxBasicFormGroup } from './RxBasicFormGroup';
import Input from './Input';

function App() {
  const rxForm = useReactable(RxBasicFormGroup);
  return (
    <Form rxForm={rxForm}>
      <Field component={Input} name="name" label="Name: " />
    </Form>
  );
}

export default App;

```