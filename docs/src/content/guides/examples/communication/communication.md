## Communication between Reactables

We have seen in the [reactable composition example](#reactable-composition) above one reactable can react to the state changes of another.

Reactables can also expose their actions for other reactables to receive. The [reactable interface](/reactables/references/core-api/#reactable) has a third optional item which is an observable emitting the reactable's actions.

All reactable primitives created with [RxBuilder](/reactables/references/core-api/#rx-builder) provides the actions observable.

When composing reactables the developer can decide what actions to expose (if any).

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/communication/communication.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

<br>

```typescript
import { ofTypes, Action, Reactable } from '@reactables/core';
import { Observable, combineLatest } from 'rxjs';

import { RxToggle, ToggleActions, ToggleState } from './RxToggle';
import { RxCounter, CounterState } from './RxCounter';

interface ToggleCounter {
  toggle: ToggleState;
  counter: CounterState;
}

interface ToggleCounterActions {
  toggle: ToggleActions;
  resetCounter: () => void;
}

export const RxToggleCounter = (): Reactable<
  ToggleCounter,
  ToggleCounterActions
> => {
  const [toggleState$, toggleActions, toggleActions$] = RxToggle();

  const toggled$ = (toggleActions$ as Observable<Action<unknown>>).pipe(
    ofTypes(['toggle'])
  );

  const [counter$, { reset }] = RxCounter({
    sources: [toggled$],
    reducers: {
      toggle: (state) => ({ count: state.count + 1 }),
    },
  });

  const state$ = combineLatest({
    toggle: toggleState$,
    counter: counter$,
  });

  const actions = {
    toggle: toggleActions,
    resetCounter: reset,
  };

  return [state$, actions];
};

```
