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