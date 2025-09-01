## Composition with Reactables <a name="reactable-composition">

Beyond creating primitives with the `RxBuilder` factory, Reactables can be combined to form new ones.

Two main use cases:
- Reuse functionality from existing Reactables.  
- Make one part of state react to another.  

Example: a simple hotel search filtered by `smokingAllowed` and `petsAllowed`.  
Using `RxToggle` and a modified `RxFetchData`, we’ll combine them to implement the search, starting with the toggle filters for smoking and pets. 

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/reactable-composition/reactable-composition.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```typescript
import { ToggleState, ToggleActions } from './RxToggle';

export type SearchControlsState = {
  smokingAllowed: ToggleState; // boolean
  petsAllowed: ToggleState; // boolean
};

export type SearchControlsActions = {
  smokingAllowed: ToggleActions;
  petsAllowed: ToggleActions;
};
```

We can initialize an `RxToggle` for each filter control and use the [`combine`](/reactables/references/core-api#combine) helper function to combine the Reactables together to create `RxSearchControls`.

```typescript

import { Reactable, combine } from '@reactables/core';
import { RxToggle, ToggleState, ToggleActions } from './RxToggle';

...

export const RxSearchControls = (): Reactable<
  SearchControlsState,
  SearchControlsActions
> =>
  combine({
    smokingAllowed: RxToggle(),
    petsAllowed: RxToggle(),
  });


```

Next, we create an `RxHotelSearch` reactable that includes `RxSearchControls` and `RxFetchData`.

We know when there is a state change in `RxSearchControls`, `RxFetchData` will have to react and fetch data to perform the search.

We will pipe the state observable from `RxSearchControls` and map it to a `fetch` action. Then provide this piped observable, `fetchOnSearchChange$`, as a source for `RxFetchData` during initialization.

```typescript
import { Reactable, combine } from '@reactables/core';
import { map } from 'rxjs/operators';
import {
  RxSearchControls,
  SearchControlsState,
  SearchControlsActions,
} from './RxSearchControls';
import { RxFetchData, FetchDataState } from './RxFetchData';
import HotelService from '../hotel-service';

type HotelSearchState = {
  controls: SearchControlsState;
  searchResult: FetchDataState;
};

type HotelSearchActions = { controls: SearchControlsActions };

export const RxHotelSearch = ({
  hotelService,
}: {
  hotelService: HotelService;
}): Reactable<HotelSearchState, HotelSearchActions> => {
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
