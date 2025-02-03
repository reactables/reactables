# React Bindings

Reactable bindings for React Components

## Installation <a name="installation"></a>

`npm i @reactables/react`

## Providers<a name="providers"></a>

### `StoreProvider`<a name="store-provider"></a>

Used to set up a context containing one reactable responsible for managing application (global) state. The reactable can be accessed via the [`useAppStore`](#useAppStore) hook in components.

**Note: The reactable used for application state must be modified with the [`storeValue`](/reactables/references/core-api#store-value) modifier function to ensure subsequent subscriptions to the reactable by components receive the latest stored value.**

Example:
```typescript
// index.js

import { storeValue, RxBuilder } from '@reactables/core';
import React from 'react';
import { createRoot } from 'react-dom/client';

export interface AppState {
  userLoggedIn: boolean
}

export interface AppActions {
  logout: () => void;
}

const config = {
  name: 'rxAppStore',
  initialState: {
    userLoggedIn: false,
  },
  reducers: {
    loginSuccess: () => ({ userLoggedIn: true })
    logout: () => ({ userLoggedIn: false })
  }
};

const rxAppStore = storeValue(RxBuilder(config));

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StoreProvider rxStore={rxAppStore}>
    <App />
  </StoreProvider>
);

```

## Hooks<a name="hooks"></a>

### `useReactable` <a name="use-reactable"></a>

React hook for binding a reactable to a React component. Accepts a reactable factory, dependencies (if any) and returns a tuple with the state `T`, actions `S`, the original observable state `Observable<T>`, and optional actions observable.

```typescript
export type HookedReactable<T, S> = [T, S, Observable<T>, Observable<Action<unknown>>?];

export declare const useReactable = <T, S, U extends unknown[]>(
  reactableFactory: (...props: U) => Reactable<T, S>,
  ...props: U
) => HookedReactable<T, S>
```

Example:

```typescript
import React from 'react';
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
  const [state, actions] = useReactable(RxToggle, false);

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

### `useAppStore`<a name="useAppStore"></a>

React hook for accessing reactable provided by [`StoreProvider`](#store-provider) and binding it to a React component. Like [`useReactable`](#use-reactable) it returns a tuple with the state `T`, actions `S`, and the original observable state `Observable<T>`.

```typescript
export declare const useAppStore: <T, S = ActionMap>() => [T, S, Observable<T>];
```

Example using the setup from [`StoreProvider`](#store-provider) example above:

```typescript
import React from 'react';
import { useAppStore } from '@reactables/react';
import { AppState, AppActions } from '../index'

const App = () => {
  const [appState, appActions] = useAppStore<AppState, AppActions>();

  if (!appState) return;

  return (
    <>
      <div>
        User is {appState.userLoggedIn ? 'logged in': 'not logged in'}.
      </div>
      <button type="button" onClick={appActions.logout}>Logout</button>
    </>

  )
}

export default App;

```
