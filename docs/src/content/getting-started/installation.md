## Installation

Installation requires [RxJS](https://rxjs.dev/) if not already installed.

`npm i rxjs @reactables/core`

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
