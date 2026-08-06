# Core Concepts

## Reactable

A **Reactable** is an interface for modelling state management.  
It provides a way for applications and UI components to **observe state** and **trigger updates**.

A `Reactable` is a tuple with:

1. **State Observable** – emits state changes.
2. **Actions Map** – a dictionary of methods for updating state.
3. **Actions Observable** – emits every action received by the store.
   This observable is extended with helpers:
   - **`actionMap`** – a dictionary of Observables, one per declared action. Each Observable emits only its specific action type with a fully typed payload and literal `type` string. Prefer this over `ofTypes` for the common case of subscribing to a single action.
   - **`ofTypes(...types)`** – returns a filtered stream for one or more action types, identified by string. Useful when filtering dynamically or across multiple types at once.
   - **`types`** – a dictionary of action type string constants for all declared actions.

---
#### Example

```typescript
import { RxCounter } from './RxCounter';

// Create a counter Reactable
const [state$, actions, actions$] = RxCounter();

// Subscribe to state changes
state$.subscribe(count => console.log("State:", count));

// Subscribe directly to a single action via actionMap — fully typed payload and literal type
actions$.actionMap.increment.subscribe(action => {
  // action.type    → 'increment'  (literal, not just string)
  // action.payload → typed payload
  console.log("Incremented:", action);
});

// Subscribe to multiple action types dynamically using ofTypes
actions$
  .ofTypes([actions$.types.increment, actions$.types.decrement])
  .subscribe(action => console.log("Counter changed:", action));

// Trigger updates
actions.increment();
actions.decrement();
```
---

<br>

## Reactable Primitive

A reactable primitive is the basic building block for modeling your state.

It can be used alone or combined with other primitives to create more complex reactables as your component or application grows.

**Hub and Store**

Internally, a reactable primitive consists of a hub and a store:

Hub: Dispatches actions.

Store: Updates state in response to actions.

<a class="rx-example" href="/reactables/ReactablePrimitiveOne.jpg" target="_blank" rel="noreferrer">
  <img src="/reactables/ReactablePrimitiveOne.jpg" alt="Hub and Store" title="Hub and Store" style="max-width: 300px" />
</a>
<br>
<br>

See [Basic Toggle](https://reactables.github.io/reactables/guides/examples/#basic-toggle) for an example.

**Effects**

The hub also manages side effects, such as API requests.

When an action requires a side effect:

1. The action is replayed through an effect stream.

1. The side effect executes.

1. Responses are mapped into new actions and sent to the store.

<a class="rx-example" href="/reactables/ReactablePrimitiveTwo.jpg" target="_blank" rel="noreferrer">
  <img src="/reactables/ReactablePrimitiveTwo.jpg" alt="Effects" title="Effects" style="max-width: 300px" />
</a>

<br>
<br>

See [Fetching Data with an Effect](https://reactables.github.io/reactables/guides/examples/#fetching-data) for example.

**Sources**

Reactables can receive actions from multiple external sources and respond to them, enabling flexible integration with other parts of your application.

<br>

## Reactable Composition and Unidirectional Flow <a name="composition">

<a class="rx-example" href="/reactables/ReactableCombined.jpg" target="_blank" rel="noreferrer">
  <img src="/reactables/ReactableCombined.jpg" alt="Reactable Composition" title="Reactable Composition" style="max-width: 300px" />
</a>
<br>

- Reactables can be composed to handle larger state domains and **be reused**.  

- Reactables can **listen and react to other reactables’ state or actions**.  

- Reactable composition forms a **directed acyclic graph (DAG)** and ensures **predictable dependencies and state changes**.  

- **All actions flow in one direction**, supporting a reactive programming style.  

See [Composition with Reactables](https://reactables.github.io/reactables/guides/examples/#reactable-composition) for example.
