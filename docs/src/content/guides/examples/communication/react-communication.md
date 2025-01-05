<a href="https://stackblitz.com/edit/vitejs-vite-ksxbknfu?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { RxToggleCounter } from './RxToggleCounter';
import { useReactable } from '@reactables/react';

function App() {
  const [state, actions] = useReactable(RxToggleCounter);

  if (!state) return;

  const {
    toggle: toggleState,
    counter: { count },
  } = state;

  const {
    toggle: { toggleOn, toggleOff, toggle },
    counter,
  } = actions;

  return (
    <>
      <h5>Reactable Toggle</h5>
      Toggle is: {toggleState ? 'On' : 'Off'}
      <br />
      <button onClick={toggleOn}>Turn On</button>
      <button onClick={toggleOff}>Turn Off</button>
      <button onClick={toggle}>Toggle</button>
      <br />
      <br />
      Toggle Button Count: {count}
      <br />
      <button onClick={counter.reset}>Reset Count</button>
    </>
  );
}

export default App;

```