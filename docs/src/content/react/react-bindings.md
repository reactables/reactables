# React Bindings

Bindings for using **Reactables** in React components.

## Installation <a name="installation"></a>

```bash
npm i @reactables/react
```
## `useReactable` <a name="use-reactable"></a>

A React hook that binds a reactable to a component.
It takes a reactable factory and optional dependencies, returning a tuple:

1. State – snapshot of the current state

1. Actions – functions to update state

1. State Observable – emits state changes

1. Action Observable – emits action events

Observables (3 & 4) can be subscribed to for side effects.

If the reactable was created with `.selectors()`, the returned tuple also exposes a **`select`** property. Each key on `select` is a function matching the selector's signature, but instead of returning an `Observable` it returns the **latest computed value synchronously**. The component re-renders whenever state changes (driven by the existing state subscription), so selector calls on `select` are always up to date at render time.

Example:

```typescript
import React, useEffect from 'react';
import { RxBuilder } from '@reactables/core';
import { useReactable } from '@reactables/react';

const RxToggle = (
  initialState = false,
) =>
  RxBuilder({
    initialState,
    name: 'rxToggle',
    reducers: {
      toggle: (state) => !state,
    },
  });

const Toggle = () => {
  const [
    state, // Snapshot of the current state
    actions, // Actions
    state$, // Observable emitting the state
    actions$, // Observable emitting actions events from the Reactable
    ] = useReactable(RxToggle, false);

  useEffect(() => {
    // Subscriptions
    const sub1 = state$.subscribe((state) => {
      console.log('Run something on state change');
    });

    const sub2 = actions$.subscribe((action) => {
      console.log('Run something when receiving an action event');
    });

    // Clean up subscriptions
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    }


  }, [state$, actions$])

  if (!state) return;

  return (
    <div>
      <div>Toggle is: { state ? 'on' : 'off'} </div>
      <button type="button" onClick={actions.toggle}></button>
    </div>
  )
}

export default Toggle;

```

### Using `select`

```typescript
import React from 'react';
import { RxBuilder } from '@reactables/core';
import { useReactable } from '@reactables/react';

const RxCounter = () =>
  RxBuilder({
    initialState: { count: 0 },
    reducers: {
      increment: (state) => ({ count: state.count + 1 }),
    },
  }).selectors({
    double: (state) => state.count * 2,
    isPositive: (state) => state.count > 0,
  });

const Counter = () => {
  const result = useReactable(RxCounter);
  const [state, actions] = result;
  const { select } = result;

  // select.double() and select.isPositive() return the latest computed value synchronously.
  // The component re-renders whenever state changes, keeping them up to date.

  if (!state) return null;

  return (
    <div>
      <div>Count: {state.count}</div>
      <div>Double: {select.double()}</div>
      <div>Is positive: {select.isPositive() ? 'yes' : 'no'}</div>
      <button onClick={actions.increment}>Increment</button>
    </div>
  );
};

export default Counter;
```

> `select` is a property on the returned tuple object. Destructure the tuple for state and actions as usual, then access `select` by name.
