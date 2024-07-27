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

It can be used alone or combine with other Reactable primitives to form more complex Reactables as the state of your component/feature/application grows.

**Hub and Store**

Internally, a Reactable primitive is composed of a hub and store.

The hub is responsible for dispatching actions to the store where state updates occur. It is also responsible for handling side effects.

<a href="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideOneHubStore.jpg" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideOneHubStore.jpg" alt="Hub and Store" title="Hub and Store" style="max-width: 500px" />
</a>

<!-- - Reactable primitive
 - hub & store
 - scoped effects

- Composition with Reactables

  - Organizing state into slices is sensible when it grows and becomes more complex.Reactable primitives which can combine together to make bigger ones (BETTER way of saying this)

- One directional flow and explicity dependencies
  - more stuff here


 -->
