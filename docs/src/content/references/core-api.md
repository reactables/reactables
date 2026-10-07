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

### `.selectors()` <a name="rx-builder-selectors"></a>

`RxBuilder` returns a result with a `.selectors(defs)` method for deriving computed values from state.
Each entry in `defs` is a function `(state) => value`. Calling `.selectors()` attaches a `.select` property to the reactable where each key is a callable that returns an **Observable of the computed value**.

Selector observables are:
- **Memoized** — `distinctUntilChanged()` suppresses re-emissions when the computed value hasn't changed.
- **Multicast** — `shareReplay(1)` means multiple subscribers share one execution and late subscribers get the latest value immediately.
- **Lifecycle-bound** — completed automatically when the reactable is destroyed.

Extra arguments beyond `state` are supported and are passed through by the caller.

```typescript
import { RxBuilder } from '@reactables/core';

const RxCounter = () =>
  RxBuilder({
    initialState: { count: 0 },
    reducers: {
      increment: (state) => ({ count: state.count + 1 }),
      set: (_, action) => ({ count: action.payload }),
    },
  });

const counter = RxCounter().selectors({
  double: (state) => state.count * 2,
  isPositive: (state) => state.count > 0,
  multiplyBy: (state, factor: number) => state.count * factor,
});

// Tuple destructuring still works as normal
const [state$, actions] = counter;

// Each key on .select returns an Observable of the computed value
counter.select.double().subscribe(v => console.log('double:', v));     // Observable<number>
counter.select.isPositive().subscribe(v => console.log('positive:', v)); // Observable<boolean>
counter.select.multiplyBy(3).subscribe(v => console.log('x3:', v));   // Observable<number>

actions.increment(); // triggers re-evaluation of all selectors
```

> **Note:** `distinctUntilChanged` uses `===` by default. Selectors that return a new object reference on every call (e.g. `state => state.items.filter(...)`) will emit on every state change regardless of whether the contents changed. For these cases, consider returning a primitive or a stable reference.

---

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
```

### `.selectors()` on `combine` <a name="combine-selectors"></a>

`combine` also returns a result with a `.selectors(defs)` method. It works the same way as on `RxBuilder`, with two additions:

- **Inherited selectors** — if any of the input reactables had `.selectors()` called on them, their `.select` maps are automatically nested under their key on the combined `.select`.
- **Top-level selectors** — `defs` receives the full combined state, so you can derive values that span multiple child reactables.

```typescript
import { RxBuilder, combine } from '@reactables/core';

const RxCounter = () =>
  RxBuilder({
    initialState: { count: 0 },
    reducers: { increment: (s) => ({ count: s.count + 1 }) },
  });

const RxToggle = () =>
  RxBuilder({
    initialState: { on: false },
    reducers: { toggle: (s) => ({ on: !s.on }) },
  });

const counter = RxCounter().selectors({
  double: (state) => state.count * 2,
});

const toggle = RxToggle().selectors({
  label: (state) => (state.on ? 'on' : 'off'),
});

const app = combine({ counter, toggle }).selectors({
  summary: (state) => `count=${state.counter.count} on=${state.toggle.on}`,
});

// Inherited child selectors are nested under their key
app.select.counter.double().subscribe(v => console.log('double:', v)); // Observable<number>
app.select.toggle.label().subscribe(v => console.log('label:', v));   // Observable<string>

// Top-level selector operates over the full combined state
app.select.summary().subscribe(v => console.log(v)); // 'count=0 on=false'
```

Selectors inherit through nested `combine()` calls as well — `app.select.inner.counter.double()` works at any depth.

