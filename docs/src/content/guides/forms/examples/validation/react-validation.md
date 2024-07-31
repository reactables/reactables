<a href="https://stackblitz.com/edit/vitejs-vite-armay9?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

See <a href="/react/react-bindings">React Bindings</a> & <a href="react/react-form-components">React Form Components</a> for API reference!

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