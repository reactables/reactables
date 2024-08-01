<a href="https://stackblitz.com/edit/vitejs-vite-pnnshh?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

See <a href="/react/react-bindings">React Bindings</a> & <a href="react/react-form-components">React Form Components</a> for API reference!

```typescript
import './App.css';
import { useReactable } from '@reactables/react';
import { Form, Field } from '@reactables/react-forms';
import { RxCustomReducers } from './RxCustomReducers';
import Input from './Input';

function App() {
  const rxForm = useReactable(RxCustomReducers);
  const [, actions] = rxForm;
  return (
    <Form rxForm={rxForm}>
      <Field component={Input} name="donuts" label="Donuts: " />
      <button onClick={actions.doubleOrder}>Double the Order!</button>
    </Form>
  );
}

export default App;
```