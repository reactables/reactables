<a href="https://stackblitz.com/edit/vitejs-vite-hph5ey?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { useReactable } from '@reactables/react';
import DataService from './data-service';
import { RxFetchData } from './RxFetchData';
import './App.css';

function App() {
  const [state, actions] = useReactable(RxFetchData, {
    dataService: new DataService(),
  });

  if (!state) return;

  const { loading, data } = state;

  return (
    <>
      <div>
        {data && <span>{data}</span>}
        <br />
        <button onClick={actions.fetch}>Fetch Data!</button>
        <br />
        {loading && <span>Fetching...</span>}
      </div>
    </>
  );
}

export default App;
```