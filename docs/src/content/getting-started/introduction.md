Reactables provide a consistent API for state management across diverse use cases and UI frameworks.

Built on RxJS and reactive/declarative patterns, they reduce boilerplate so you can focus on business logic.

> **Note:** While examples in these docs use React, Reactables are framework-agnostic. Examples for other frameworks may be added over time — contributions welcome!

---

## Installation

Reactables require [RxJS](https://rxjs.dev/) 6 or above.  

```bash
# Core package (requires RxJS 6+)
npm i rxjs @reactables/core

# Optional: React bindings + form components
npm i @reactables/react
```

## Create your first Reactable!

```javascript
import { RxBuilder } from '@reactables/core';

export const RxToggle = (initialState = false) =>
  RxBuilder({
    initialState,
    reducers: {
      toggleOn: () => true,
      toggleOff: () => false,
      toggle: (state) => !state,
    },
  });

```

