## Fetching Data with an Effect<a name="fetching-data">

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/fetch-data/fetch-data.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```typescript
import { RxBuilder, Action } from '@reactables/core';
import DataService from './data-service';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const RxFetchData = ({ dataService }: { dataService: DataService }) =>
  RxBuilder({
    initialState: {
      loading: false,
      success: false,
      data: null as string | null,
      error: null as any,
    },
    reducers: {
      fetch: {
        reducer: (state) => ({ ...state, loading: true }),
        effects: [
          (action$: Observable<Action>) =>
            action$.pipe(switchMap(() => from(dataService.fetchData()))).pipe(
              map((response) => ({ type: 'fetchSuccess', payload: response })),
              catchError((err: unknown) =>
                of({ type: 'fetchFailure' })
              )
            ),
        ],
      },
      fetchSuccess: (state, action: Action<string>) => ({
        ...state,
        success: true,
        loading: false,
        data: action.payload,
        error: null,
      }),
      fetchFailure: (state, action) => ({
        ...state,
        loading: false,
        error: true,
        success: false,
      }),
    },
  });


```