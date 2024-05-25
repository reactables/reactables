# Reactables React

## Description

Reactable bindings for React Components

## Table of Contents

1. [Installation](#installation)
1. [Providers](#providers)
    1. [`StoreProvider`](#store-provider)
1. [Hooks](#hooks)
    1. [`useReactable`](#use-reactable)
    1. [`useAppStore`](#store-provider)

## Installation <a name="installation"></a>

`npm i @reactables/react`

## Providers<a name="providers"></a>

### `StoreProvider`<a name="store-provider"></a>

Used to set up a context containing one reactable responsible for managing application (global) state. The reactable can be accessed via the `useAppStore` hook in components.

Note: The reactable used for application state must be decorated with the `storeValue` decorator to ensure subsequent subscriptions by components receive the latest value in the store.

Example:
```typescript
// index.js

import { storeValue, RxBuilder } from '@reactables/core';
import React from 'react';
import { createRoot } from 'react-dom/client';

const config = {
  name: 'rxAppStore',
  initialState: {
    userLoggedIn: false,
  },
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

### `useAppStore`<a name="useAppStore"></a>

