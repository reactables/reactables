## Extending Functionality

Extending functionality for a reactable is straight forward as we can just pass in extra [`reducers`](/references/core-api#rx-config) as an option. To illustrate, we can make a slight modification to `RxToggle` and make a `RxExtendedToggle`.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/extending-functionality.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```javascript
import { RxBuilder } from '@reactables/core';

export const RxToggle = ({initialState = false, reducers }) =>
  RxBuilder({
    initialState,
    reducers: {
      toggleOn: () => true,
      toggleOff: () => false,
      toggle: (state) => !state,
      ...reducers,
    },
  });

export const RxExtendedToggle = ({ initialState }) =>
  RxToggle({
    initialState,
    reducers: {
      numberToggle: (state, { payload }) => {
        switch (payload) {
          case 0:
            return false;
          case 1:
            return true;
          default:
            return state;
        }
      },
    },
  });

```