<a href="https://stackblitz.com/edit/vitejs-vite-bbdsdv?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>


```typescript
import { useReactable } from '@reactables/react';
import HotelService from './hotel-service';
import { RxHotelSearch } from './Rx/RxHotelSearch';
import './App.css';

function App() {
  const [state, actions] = useReactable(RxHotelSearch, {
    hotelService: new HotelService(),
  });

  if (!state) return;

  const {
    controls: { smokingAllowed, petsAllowed },
    searchResult: { loading, data },
  } = state;

  return (
    <>
      <div>
        <br />
        <button onClick={actions.toggleSmokingAllowed}>
          Smoking Allowed : {smokingAllowed ? 'Yes' : 'No'}{' '}
        </button>
        <br />
        <br />
        <button onClick={actions.togglePetsAllowed}>
          Pets Allowed : {petsAllowed ? 'Yes' : 'No'}{' '}
        </button>
        <br />
        {loading && 'Searching...'}
        <br />
        {data && data}
      </div>
    </>
  );
}

export default App;
```