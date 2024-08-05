# Core Concepts

## Reactable Interface

```typescript
  const [state$, actions] = RxToggle();
```

Reactables (prefixed with Rx) provide a clean separation of concerns between state logic and presentation in your UI - enhancing testability and extensibility.

Reactables encapsulate the state logic and expose an observable which UI components can subscribe to for state changes.

For predictable state changes, the UI state can only be changed by invoking action methods provided by the reactable. 

<br>

## Reactable Primitive

A reactable primitive is the basic building block for modelling your state.

It can be used alone or combine with other primitives to form more complex reactables as the state of your component/feature/application grows.

**Hub and Store**

Internally, a reactable primitive has a hub and store. The hub dispatches actions to the store where state updates occur.

<a class="rx-example" href="/reactables/ReactablePrimitiveOne.jpg" target="_blank" rel="noreferrer">
  <img src="/reactables/ReactablePrimitiveOne.jpg" alt="Hub and Store" title="Hub and Store" style="max-width: 300px" />
</a>

<br>
<br>

**Effects**

The hub also handles side effects (i.e API requests) with `effects`.

When an action is dispatched and a side effect is needed, a replayed action is sent through an effect stream to execute the side effect.

Responses are then mapped into actions and relayed to the store.

<a class="rx-example" href="/reactables/ReactablePrimitiveTwo.jpg" target="_blank" rel="noreferrer">
  <img src="/reactables/ReactablePrimitiveTwo.jpg" alt="Effects" title="Effects" style="max-width: 300px" />
</a>

<br>
<br>

**Sources**

Reactables also have the ability to receive actions from any number of external sources and react to them.

<br>

## Composition, Reactive Programming and Unidirectional Flow <a name="composition">

Organizing state into slices is sensible when state grows and becomes more complex. Reactable primitives can represent these slices and through composition they can create a new reactable to handle increasing complexity.

<a class="rx-example" href="/reactables/ReactableCombined.jpg" target="_blank" rel="noreferrer">
  <img src="/reactables/ReactableCombined.jpg" alt="Reactable Composition" title="Reactable Composition" style="max-width: 300px" />
</a>

<br>
<br>
<br>

Reactables encourages a reactive programming style where a reactable's **sources of change are explicit** in its declaration.

This results in a unidirectional flow of actions making state changes highly predictable.
