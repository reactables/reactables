# Core Concepts

## Reactable Interface

```typescript
  const [state$, actions] = RxToggle();
```

Reactables (prefixed with Rx) provide a clean separation of concerns between state logic and presentation - enhancing testability and extensibility.

Reactables encapsulate the state logic and expose an observable which UI components can subscribe to for state changes.

For predictable state changes, the UI state can only be changed by invoking action methods provided by the Reactable. 

<!-- - Reactable primitive
 - hub & store
 - scoped effects

- Composition with Reactables

  - Organizing state into slices is sensible when it grows and becomes more complex.Reactable primitives which can combine together to make bigger ones (BETTER way of saying this)

- One directional flow and explicity dependencies
  - more stuff here


 -->
