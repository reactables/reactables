Reactables provide a consistent API for state management across diverse use cases and any UI framework.

By leveraging RxJS and reactive/declarative patterns, they let you spend less time on implementation and more time on business logic.

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

