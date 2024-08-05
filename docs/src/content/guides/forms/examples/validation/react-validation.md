<a href="https://stackblitz.com/edit/vitejs-vite-armay9?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

See <a href="/react/react-bindings">React Bindings</a> & <a href="/react/react-form-components">React Form Components</a> for API reference!

`DonutInput.tsx`
```typescript
import { WrappedFieldProps } from '@reactables/react-forms';
const DonutInput = ({
  input,
  label,
  meta: { touched, errors, valid },
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
        type="number"
        className={`form-control ${touched && !valid ? 'is-invalid' : ''}`}
      />
      {touched && errors.required && (
        <div>
          <small className="text-danger">Field is required</small>
        </div>
      )}
      {touched && errors.min4 && (
        <div>
          <small className="text-danger">Minimum of 4 donuts required</small>
        </div>
      )}
    </div>
  );
};

export default DonutInput;
```


`App.tsx`

```typescript
import './App.css';
import { useReactable } from '@reactables/react';
import { Form, Field } from '@reactables/react-forms';
import { RxFormValidation } from './RxFormValidation';
import DonutInput from './DonutInput';

function App() {
  const rxForm = useReactable(RxFormValidation);
  return (
    <Form rxForm={rxForm}>
      <Field component={DonutInput} name="donuts" label="Number of Donuts: " />
    </Form>
  );
}

export default App;
```