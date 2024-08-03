Managing application (global) state and/or component (local) state? Reactables provides a simple and scalable API for handling both.

Reactables leverages RxJS and reactive/declarative patterns to allow more time to **focus on what** you want to achieve in your buisness logic and **save time on how** it is implemented.

## Installation

`npm i rxjs` (requires [RxJS](https://rxjs.dev/) if not already installed)

`npm i @reactables/core`

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

