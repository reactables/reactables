## Basic Toggle

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/basic-toggle/basic-toggle.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

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
