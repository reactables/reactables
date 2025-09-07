# React Bindings

Bindings for using **Reactables** in React components.

## Installation <a name="installation"></a>

```bash
npm i @reactables/react
```
## `useReactable` <a name="use-reactable"></a>

A React hook that binds a reactable to a component.
It takes a reactable factory and optional dependencies, returning a tuple:

1. State – current reactable state

1. Actions – functions to update state

1. State Observable – emits state changes

1. Action Observable – emits action events

Observables (3 & 4) can be subscribed to for side effects.

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
    state, // State: boolean
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
