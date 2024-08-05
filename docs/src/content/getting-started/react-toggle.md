<a href="https://stackblitz.com/edit/vitejs-vite-vijfxw?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { RxToggle } from './RxToggle';
import { useReactable } from '@reactables/react';

function App() {
  const [toggleState, actions] = useReactable(RxToggle);
  const { toggleOn, toggleOff, toggle } = actions;
  return (
    <>
      <h5>Reactable Toggle</h5>
      Toggle is: {toggleState ? 'On' : 'Off'}
      <br />
      <button onClick={toggleOn}>Toggle On</button>
      <button onClick={toggleOff}>Toggle Off</button>
      <button onClick={toggle}>Toggle</button>
    </>
  );
}

export default App;
```