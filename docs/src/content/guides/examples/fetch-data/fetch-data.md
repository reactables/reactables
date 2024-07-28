```typescript
import { RxBuilder, Reactable, Action } from '@reactables/core';
import DataService from './data-service';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

type FetchDataState = {
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

type FetchDataActions = {
  fetch: () => void;
};

export const RxFetchData = ({
  dataService,
}: {
  dataService: DataService;
}): Reactable<FetchDataState, FetchDataActions> =>
  RxBuilder({
    initialState,
    reducers: {
      fetch: {
        reducer: (state) => ({ ...state, loading: true }),
        effects: [
          (action$) =>
            action$.pipe(
              switchMap(() => from(dataService.fetchData()))).pipe(
                map((response) =>
                  ({ type: 'fetchSuccess', payload: response })),
                catchError((err: unknown) =>
                  of({ type: 'fetchFailure', payload: true })
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
        error: action.payload,
        success: false,
      }),
    },
  });
```