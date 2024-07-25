## Installation

Installation will require [RxJS](https://rxjs.dev/) if not already installed.

`npm i rxjs @reactables/core`

## Create your first Reactable!

```typescript
import { RxBuilder } from '@reactables/core';

export const RxToggle = (initialState = false) =>
  RxBuilder({
    initialState,
    name: 'rxToggle',
    reducers: {
      toggleOn: () => true,
      toggleOff: () => false,
      toggle: (state) => !state,
    },
  });

```

## Bind to the View!

[See full example on StackBlitz](https://stackblitz.com/edit/github-qtpo1k-gvgbvy?file=src%2Findex.js)

```typescript

const [state$, { toggleOn, toggleOff, toggle }] = RxToggle();

state$.subscribe((toggleState) => {
  // Update the view when state changes.
  document.getElementById('toggle-state').innerHTML = toggleState ? 'On' : 'Off';
});

// Bind click handlers
document.getElementById('toggle-on').addEventListener('click', toggleOn);
document.getElementById('toggle-off').addEventListener('click', toggleOff);
document.getElementById('toggle').addEventListener('click', toggle);


```

