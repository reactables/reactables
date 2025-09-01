## Communication between Reactables

The [composition example](#reactable-composition) shows one reactable responding to another’s state.  

Reactables also emit actions for others can react to, via the **actions observable** (the third item of the [Reactable interface](/reactables/references/core-api/#reactable)). 

Below is an example where a counter reactable, `RxCounter`, is extended to react to `toggle` actions emitted by `RxToggle`.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/communication/communication.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

<br>

```typescript
import { ofTypes, Action, Reactable, combine } from '@reactables/core';
import { Observable } from 'rxjs';

import { RxToggle, ToggleActions, ToggleState } from './RxToggle';
import { RxCounter, CounterState, CounterActions } from './RxCounter';

interface ToggleCounter {
  toggle: ToggleState;
  counter: CounterState;
}

interface ToggleCounterActions {
  toggle: ToggleActions;
  counter: CounterActions;
}

export const RxToggleCounter = (): Reactable<
  ToggleCounter,
  ToggleCounterActions
> => {
  const rxToggle = RxToggle();

  const toggled$ = (rxToggle[2] as Observable<Action<unknown>>).pipe(
    ofTypes(['toggle'])
  );

  const rxCounter = RxCounter({
    sources: [toggled$],
    reducers: {
      toggle: (state) => ({ count: state.count + 1 }),
    },
  });

  return combine({
    toggle: rxToggle,
    counter: rxCounter,
  });
};

```
