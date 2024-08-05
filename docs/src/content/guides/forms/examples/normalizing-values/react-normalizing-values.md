<a href="https://stackblitz.com/edit/vitejs-vite-842mn1?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

See <a href="/react/react-bindings">React Bindings</a> & <a href="/react/react-form-components">React Form Components</a> for API reference!

```typescript
import './App.css';
import { useReactable } from '@reactables/react';
import { Form, Field } from '@reactables/react-forms';
import { RxFormNormalizing } from './RxFormNormalizing';
import Input from './Input';

function App() {
  const rxForm = useReactable(RxFormNormalizing);
  return (
    <Form rxForm={rxForm}>
      <Field component={Input} name="phone" label="Phone: " />
    </Form>
  );
}

export default App;

```