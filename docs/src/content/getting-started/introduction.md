Managing application (global) state and/or component (local) state? Reactables provides a simple and scalable API for handling both.

Reactables leverages RxJS and reactive/declarative patterns to allow more time to **focus on what** you want to achieve in your buisness logic and **save time on how** it is implemented.

## Installation

Requires <a href="https://rxjs.dev/" target="_blank" rel="noreferrer">RxJS</a> 6 or above. If not already installed, run `npm i rxjs`

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

