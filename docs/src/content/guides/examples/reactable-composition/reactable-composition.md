## Composition with Reactables <a name="reactable-composition">

Beyond creating primitives with the `RxBuilder` factory, Reactables can be combined to form new ones.

Two main use cases:
- Reuse functionality from existing Reactables.  
- Make one part of state react to another.  

Example: a simple hotel search filtered by `smokingAllowed` and `petsAllowed`.  
Using `RxToggle` and a modified `RxFetchData`, we’ll combine them to implement the search, starting with the toggle filters for smoking and pets. 

We can initialize an `RxToggle` for each filter control and use the [`combine`](/reactables/references/core-api#combine) helper function to combine the Reactables together to create `RxSearchControls`.

```typescript
import { combine } from '@reactables/core';
import { RxToggle } from './RxToggle';

export const RxSearchControls = () =>
  combine({
    smokingAllowed: RxToggle(),
    petsAllowed: RxToggle(),
  });


```

We can make a slight improvement to `RxFetchData` to accept a `sources` parameter so it can listen to state changes from `RxSearchControls`

```typescript

export const RxFetchData = ({
  dataService,
  // Include a sources option
  sources,
}: {
  dataService: DataService;
  sources: Observable<Action<any>>[];
}) =>
  RxBuilder({
    initialState: {
      ...
    },
    // Add sources to the reactable
    sources,
    reducers: {
      ...

```

Next, we create an `RxHotelSearch` reactable that includes `RxSearchControls` and `RxFetchData`.

We know when there is a state change in `RxSearchControls`, `RxFetchData` will have to react and fetch data to perform the search.

We will pipe the state observable from `RxSearchControls` and map it to a `fetch` action. Then provide this piped observable, `fetchOnSearchChange$`, as a source for `RxFetchData` during initialization.

```typescript
import { combine } from '@reactables/core';
import { map } from 'rxjs/operators';
import { RxSearchControls } from './RxSearchControls';
import { RxFetchData } from './RxFetchData';
import HotelService from '../hotel-service';

export const RxHotelSearch = ({
  hotelService,
}: {
  hotelService: HotelService;
}) => {
  const rxSearchControls = RxSearchControls();

  const fetchOnSearchChange$ = rxSearchControls[0].pipe(
    map((search) => ({ type: 'fetch', payload: search }))
  );

  const rxSearchResult = RxFetchData({
    sources: [fetchOnSearchChange$],
    dataService: hotelService,
  });

  return combine({
    controls: rxSearchControls,
    searchResult: rxSearchResult,
  });
};


```

We then use [`combine`](/reactables/references/core-api#combine) function again to to give us our combined state observable.
