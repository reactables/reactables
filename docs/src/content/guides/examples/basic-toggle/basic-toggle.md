## Basic Toggle

```typescript
import { RxBuilder, Reactable } from '@reactables/core';

type ToggleState = boolean;

type ToggleActions = {
  toggleOn: () => void;
  toggleOff: () => void;
  toggle: () => void;
};

export const RxToggle = (
  initialState = false
): Reactable<ToggleState, ToggleActions> =>
  RxBuilder({
    initialState,
    reducers: {
      toggleOn: () => true,
      toggleOff: () => false,
      toggle: (state: ToggleState) => !state,
    },
  });

```
## Debugging

When creating a reactable primitive with [`RxBuilder`](/references/core-api#rx-builder), a [`debug`](/references/core-api#rx-config) option is available to `console.log` all the actions and state updates occuring within that primitive.

Debug Example:

<img src="/debug-example.png" width="500" />