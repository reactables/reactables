## Composition with Reactables <a name="reactable-composition">

Using an example for illustration. Consider a naive search that filter's hotels based on `smokingAllowed` and `petsAllowed`. Using `RxToggle` and a slightly modified `RxFetchData` from previous examples, we will combine them and implement the search.

We can start with the toggle filter controls for `smokingAllowed` and `petsAllowed`. We will want a reactable with the following state and actions.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/reactable-composition/reactable-composition.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```typescript
export type SearchControlsState = {
  smokingAllowed: ToggleState; // boolean
  petsAllowed: ToggleState; // boolean
};

export type SearchControlsActions = {
  toggleSmokingAllowed: () => void;
  togglePetsAllowed: () => void;
};
```

We can initialize an `RxToggle` for each filter control and use RxJS's <a href="https://rxjs.dev/api/index/function/combineLatest" target="_blank" rel="noreferrer">`combineLatest`</a> function to combine the state observables together to create `RxSearchControls`.

```typescript
import { combineLatest } from 'rxjs';

...

export const RxSearchControls = (): Reactable<
  SearchControlsState,
  SearchControlsActions
> => {
  const [smokingAllowed$, { toggle: smokingToggle }] = RxToggle();
  const [petsAllowed$, { toggle: petsToggle }] = RxToggle();

  const state$ = combineLatest({
    smokingAllowed: smokingAllowed$,
    petsAllowed: petsAllowed$,
  });

  const actions = {
    toggleSmokingAllowed: smokingToggle,
    togglePetsAllowed: petsToggle,
  };

  return [state$, actions];
};

```

Next, we create an `RxHotelSearch` reactable that includes `RxSearchControls` and `RxFetchData`.

We know when there is a state change in `RxSearchControls`, `RxFetchData` will have to react and fetch data to perform the search.

We will pipe the state observable from `RxSearchControls` and map it to a `fetch` action. Then provide this piped observable, `fetchOnSearchChange$`, as a source for `RxFetchData` during initialization.

```typescript
import { Reactable } from '@reactables/core';
import { combineLatest } from 'rxjs';
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

type HotelSearchActions = SearchControlsActions;

export const RxHotelSearch = ({
  hotelService,
}: {
  hotelService: HotelService;
}): Reactable<HotelSearchState, HotelSearchActions> => {
  const [searchControls$, searchControlActions] = RxSearchControls();

  const fetchOnSearchChange$ = searchControls$.pipe(
    map((search) => ({ type: 'fetch', payload: search }))
  );

  const [searchResult$] = RxFetchData({
    dataService: hotelService,
    sources: [fetchOnSearchChange$],
  });

  const state$ = combineLatest({
    controls: searchControls$,
    searchResult: searchResult$,
  });

  const actions = searchControlActions;

  return [state$, actions];
};

```

We then use <a href="https://rxjs.dev/api/index/function/combineLatest" target="_blank" rel="noreferrer">`combineLatest`</a> function again to to give us our combined state observable.
