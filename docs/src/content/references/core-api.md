# Reactables Core API

## `Reactable`

A **Reactable** is an interface for modelling state management.  
It provides a way for applications and UI components to **observe state** and **trigger updates**.

A `Reactable` is a tuple with:

1. **State Observable** – emits state changes.  
2. **Actions Map** – a dictionary of methods for updating state.  
3. **Actions Observable** – emits every action received by the store.  
   This observable is extended with helpers:
   - **`ofTypes(...types)`** – returns a filtered stream of only the specified action types.  
   - **`types`** – a dictionary of action type constants for all declared actions in the Reactable.
---
#### Example

```typescript
import { RxCounter } from './RxCounter';

// Create a counter Reactable
const [state$, actions, actions$] = RxCounter();

// Subscribe to state changes
state$.subscribe(count => console.log("State:", count));

// Subscribe to all actions
actions$.subscribe(action => console.log("Action received:", action));

// Subscribe only to increment actions using `ofTypes`
actions$
  .ofTypes([actions$.types.increment])
  .subscribe(action => console.log("Incremented:", action));

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
| `reducers`             | Dictionary of cases defining how the Reactable handles actions. Each case can be a reducer function or a config object. Used to generate Actions, Reducers, and [`ScopedEffects`](#api-scoped-effects). |
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

// Trigger actions
actions.a.increment(); // increments rxCounterA
actions.b.increment(); // increments rxCounterB


## `ofTypes` <a name="of-types"></a>

Function that accepts an array of action types (`string`) and returns an <a href="https://rxjs.dev/api/index/interface/OperatorFunction" target="_blank" rel="noreferrer">`OperatorFunction`</a> that will filter for those [`Action`](#api-action)s.

```typescript
export declare const ofTypes: (types: string[]) => OperatorFunction<Action<unknown>, Action<unknown>>;
```

## `storeValue` <a name="store-value"></a>

Modifier function used store the state value in a <a href="https://rxjs.dev/api/index/class/ReplaySubject" target="_blank" rel="noreferrer">`ReplaySubject`</a> instead of an <a href="https://rxjs.dev/api/index/class/Observable" target="_blank" rel="noreferrer">`Observable`</a> so subsequent subscriptions can access the latest stored value.

Also add's a `destroy` action method to be called to teardown any Reactable modified with `storeValue`.

```typescript
interface DestroyAction {
  destroy: () => void;
}

declare const storeValue: <T, S>(reactable: Reactable<T, S>) => Reactable<T, S & DestroyAction>;
```

## Other Interfaces <a name="interfaces"></a>

### `Effect` <a name="api-effect"></a>

Effects are expressed as <a href="https://rxjs.dev/api/index/interface/OperatorFunction">RxJS Operator Functions</a>. They pipe the `dispatcher$` stream and run side effects on incoming [`Actions`](#api-action).

```typescript
type Effect<T, S> = OperatorFunction<Action<T>, Action<S>>;
```

### `ScopedEffects` <a name="api-scoped-effects"></a>

Scoped Effects are declared when defining reducers in [RxConfig](#rx-config). They are dynamically created stream(s) scoped to an Action `type` & `key` combination.

```typescript
interface ScopedEffects<T> {
  key?: string;
  effects: Effect<T, unknown>[];
}
```
| Property | Description |
| -------- | ----------- |
| key (optional) | key to be combined with the Action `type` to generate a unique signature for the effect stream(s). Example: An id for the entity the action is being performed on. |
| effects | Array of [`Effects`](#api-effect) scoped to the Action `type` & `key` |


### `Action` <a name="api-action"></a>
```typescript
interface Action<T = undefined> {
  type: string;
  payload?: T;
  scopedEffects?: ScopedEffects<T>;
}
```
| Property | Description |
| -------- | ----------- |
| type | type of Action being dispatched |
| payload (optional) | payload associated with Action |
| scopedEffects (optional) | [See ScopedEffects](#api-scoped-effects) |

### `Reducer` <a name="api-reducer"></a>

From the <a href="https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers" target="_blank" rel="noreferrer">Redux Docs</a>:
> Reducers are functions that take the current state and an action as arguments, and return a new state result

```typescript
type Reducer<T> = (state?: T, action?: Action<unknown>) => T;
```
