# Core Concepts

## Reactable Interface

```typescript
  const [state$, actions] = RxToggle();
```

Reactables (prefixed with Rx) provide a clean separation of concerns between state logic and presentation - enhancing testability and extensibility.

Reactables encapsulate the state logic and expose an observable which UI components can subscribe to for state changes.

For predictable state changes, the UI state can only be changed by invoking action methods provided by the Reactable. 

<br>

## Reactable Primitive

A Reactable primitive is the basic building block for modelling your state.

It can be used alone or combine with other primitives to form more complex Reactables as the state of your component/feature/application grows.

**Hub and Store**

Internally, a Reactable primitive is composed of a hub and store.

The hub is responsible for dispatching actions to the store where state updates occur. It is also responsible for handling side effects.

<a href="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideOneHubStore.jpg" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideOneHubStore.jpg" alt="Hub and Store" title="Hub and Store" style="max-width: 500px" />
</a>

**Effects**

Reactable primitives handles side effects (i.e async operations) with `effects`.

When the hub dispatches an action and a side effect is needed, a replayed action is sent through an effect stream to execute the side effect.

Once the side effect runs, responses (if exists) will be mapped to actions an relayed to the store.

<a href="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideTwoEffect.jpg" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideTwoEffect.jpg" alt="Effects" title="Effects" style="max-width: 500px" />
</a>


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



<!-- - Reactable primitive
 - hub & store
 - scoped effects

- Composition with Reactables

  - Organizing state into slices is sensible when it grows and becomes more complex.Reactable primitives which can combine together to make bigger ones (BETTER way of saying this)

- One directional flow and explicity dependencies
  - more stuff here


 -->
