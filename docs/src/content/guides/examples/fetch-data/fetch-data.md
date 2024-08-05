## Fetching Data with an Effect<a name="fetching-data">

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/fetch-data/fetch-data.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```typescript
import { RxBuilder, Reactable } from '@reactables/core';
import DataService from './data-service';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export type FetchDataState = {
  loading: boolean;
  success: boolean;
  data: string | null;
  error: unknown;
};

const initialState: FetchDataState = {
  loading: false,
  success: false,
  data: null,
  error: null,
};

export type FetchDataActions = {
  fetch: () => void;
};

export type FetchDataReactable = Reactable<FetchDataState, FetchDataActions>;

export const RxFetchData = ({
  dataService,
}: {
  dataService: DataService;
}): FetchDataReactable =>
  RxBuilder({
    initialState,
    reducers: {
      fetch: {
        reducer: (state) => ({ ...state, loading: true }),
        effects: [
          (action$) =>
            action$.pipe(switchMap(() => from(dataService.fetchData()))).pipe(
              map((response) => ({ type: 'fetchSuccess', payload: response })),
              catchError((err: unknown) =>
                of({ type: 'fetchFailure', payload: true })
              )
            ),
        ],
      },
      fetchSuccess: (state, action) => ({
        ...state,
        success: true,
        loading: false,
        data: action.payload as string,
        error: null,
      }),
      fetchFailure: (state, action) => ({
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      }),
    },
  });

```