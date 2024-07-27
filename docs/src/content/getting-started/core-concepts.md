# Core Concepts

## Reactable Interface

```typescript
  const [state$, actions] = RxToggle();
```

Reactables (prefixed with Rx) aim to provide a clean separation of concerns between state logic and presentation - enhancing testability and extensibility.

Reactables encapsulate all the state logic and expose a state observable which UI components can subscribe to for state changes.

The UI state can only be updated by invoking defined action methods provided by the Reactable.

<!-- - Reactable primitive
 - hub & store
 - scoped effects

- Composition with Reactables

  - Organizing state into slices is sensible when it grows and becomes more complex.Reactable primitives which can combine together to make bigger ones (BETTER way of saying this)

- One directional flow and explicity dependencies
  - more stuff here


 -->
