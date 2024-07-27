# Guides

## Examples
  ### Building a Reactable
    - counter example
      -js, react, and angular

  ### Handling Async Operations with Effects
    - simple fetch todos
    -js, react, and angular

  ### Composition with Reactables 
    - ??? example - paginated list, user status?
    -js, react, and angular

## Core API reference

## Forms
  - all the examples
  - js and react
  - API reference 

# React 
  - Bindings for React Components
  - Bindings for React Form Components

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