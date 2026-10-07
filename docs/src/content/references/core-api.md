# Reactables Core API

## `Reactable`

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
actions$.actionMap.increment$.subscribe(action => {
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

## `RxBuilder` <a name="rx-builder"></a>

`RxBuilder` is a factory function for creating a **Reactable primitive**.  
It takes a configuration object (`RxConfig`) that defines the Reactable’s **initial state**, **reducers**, and optional behaviors like debugging or listening to additional sources.

| Property               | Description                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialState`         | The initial state of the Reactable.                                                                                                                                                                     |
| `reducers`             | Dictionary of cases defining how the Reactable handles actions. Each case can be a reducer function or a config object. Used to generate actions, reducers and effects. |
| `debug` *(optional)*   | Logs all actions and state changes to the console when `true`.                                                                                                                                          |
| `sources` *(optional)* | Additional action Observables the Reactable listens to.                                                                 |

---

### Example

```typescript
import { RxBuilder, Action } from "reactables";
import { of } from "rxjs";

// Additional source observable
const externalActions$ = of({ type: "reset", payload: 0 });

const rxCounter = RxBuilder({
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
    reset: (_, payload) => payload,
  },
  debug: true,
  sources: [externalActions$], // Listening to an external observable
});

// Subscribe to state changes
const [state$, actions, actions$] = rxCounter;
state$.subscribe(count => console.log("State:", count));

// Trigger local actions
actions.increment();
actions.decrement();

// External action from sources$ will also update state

```

## `combine` <a name="combine"></a>

`combine` is a helper function that merges a **dictionary of Reactables** into a single Reactable.
The resulting Reactable organizes the **state** and **actions** of each input Reactable under their respective keys.

- The **state observable** emits an object where each key corresponds to the current state of its Reactable.
- The **actions map** contains a nested object of actions for each input Reactable.
- The **actions observable** emits all actions from all combined Reactables, with the `type` formatted as `"[key] - action"` to indicate which Reactable the action came from.
- The **`actionMap`** on the combined actions observable mirrors the Reactable hierarchy — each key holds the `actionMap` of its corresponding source Reactable, allowing direct subscription by navigating the same structure as the actions map.

---

### Example

```typescript
import { RxBuilder, combine } from "reactables";

// Two simple Reactables
const rxCounterA = RxBuilder({
  initialState: 0,
  reducers: { increment: (s) => s + 1 },
});

const rxCounterB = RxBuilder({
  initialState: 10,
  reducers: { increment: (s) => s + 2 },
});

// Combine them
const rxCombined = combine({
  a: rxCounterA,
  b: rxCounterB,
});

const [state$, actions, actions$] = rxCombined;

// Subscribe to combined state
state$.subscribe(state => {
  console.log("Combined state:", state);
  // { a: 0, b: 10 } initially
});

// Subscribe to combined actions
actions$.subscribe(action => {
  console.log("Action received:", action.type);
  // Example: "[a] - increment"
  // Example: "[b] - increment"
});

// Subscribe directly to a specific source's action via actionMap
// actionMap mirrors the same hierarchy as the actions map
actions$.actionMap.a.increment$.subscribe(action => {
  console.log("Counter A incremented:", action);
});

// Trigger actions
actions.a.increment(); // increments rxCounterA
actions.b.increment(); // increments rxCounterB
