<!-- ```typescript
import { RxBuilder } from '@reactables/core'
import { of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

const [state$, actions] = RxBuilder({
  initialState: { loading: false, data: null },
  reducers: {
    fetch: {
      reducer: (state) => ({...state, loading: true }),
      effects: [
        actions$.pipe(
          mergeMap((action) => of('some data').pipe(
            map((data) => ({ type: 'fetchSuccess', payload: data}))
          ))
        ),
      ]
    },
    fetchSuccess: (state, action) =>
      ({ loading: false, data: action.payload })
  },
})

``` -->