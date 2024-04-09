# Reactables Core

## Description

Reactive state management with RxJS.

## Table of Contents

1. [Installation](#installation)
1. [Core concepts](#core-concepts)
    1. [Reactables](#reactable-concept)
    1. [Hub and Store](#hub-stores)
    1. [Effects](#effects)
    1. [Scoped Effects](#scoped-effects)
    1. [Flow & Containment](#flow-containment)
1. [Examples](#examples)
    1. [Basic Counter](#basic-counter-example)
    1. [Scoped Effects - Updating Todos](#scoped-effects-example)
    1. [Connecting Multiple Reactables - Event Prices](#connecting-hub-example)
1. [API](#api)
    1. [Reactable](#reactable)
    1. [RxBuilder](#rx-builder)
        1. [RxConfig](#rx-config)
    1. [Other Interfaces](#interfaces)
        1. [Effect](#api-effect)
        1. [ScopedEffects](#api-scoped-effects)
        1. [Action](#api-action)
        1. [Reducer](#api-reducer)
1. [Testing Reactables](#testing)

## Installation <a name="installation"></a>

Installation will require [RxJS](https://rxjs.dev/) if not already installed.

`npm i rxjs @reactables/core`

## Core concepts <a name="core-concepts"></a>

**Prerequisite**: Basic understanding of [Redux](https://redux.js.org/introduction/core-concepts) and [RxJS](https://rxjs.dev/) is helpful.

In this documentation the term *stream* will refer to an RxJS observable stream.

### Reactables <a name="reactable-concept"></a>

[Reactables](#reactable) (prefixed with Rx) are objects that encapulate all the logic required for state management. They expose a `state$` observable and `actions` methods. Applications can subscribe to `state$` to receive state changes and call action methods to trigger them.

```javascript
import { RxCounter } from '@reactables/examples';

const [state$, actions] = RxCounter();

const { increment, reset } = actions;

state$.subscribe(({ count }) => {
  // Update the count when state changes.
  document.getElementById('count').innerHTML = count;
});

// Bind click handlers
document.getElementById('increment').addEventListener('click', increment);
document.getElementById('reset').addEventListener('click', reset);

```
For a full example, see [Basic Counter Example](#basic-counter-example).

### Hub and Store <a name="hub-stores"></a>

Internally, [Reactables](#reactable-concept) are composed of a hub and store.

The hub is responsible for dispatching actions to the store. It is also responsible for handling side effects.

<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideOneHubStore.jpg" width="600" />

### Effects<a name="effects"></a>

When initializing a [Reactable](#reactable-concept) we can declare effects. The hub will listen for various actions and perform side effects as needed. The store will receive actions resulting from these effects.

<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideTwoEffect.jpg" width="600" />

### Scoped Effects <a name="scoped-effects"></a>

Scoped Effects are dynamically created streams scoped to a particular action & key combination when an action is dispatched.

<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideThreeScopedEffects.jpg" width="600" />

### Flow & Containment <a name="flow-containment"></a>
Actions and logic flow through the App in one direction and are **contained** in their respective streams. This makes state updates more predictable and traceable during debugging.

<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideSevenEightUnidirectionalFlow.jpg" />

## Examples <a name="examples"></a>

### Basic Counter <a name="basic-counter-example"></a>

A basic counter example. Button clicks dispatch actions to increment or reset the counter.

Design Diagram           |  Reactable           | Try it out on StackBlitz.<br /> Choose your framework
:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/Slide11BasicCounterExample.jpg" width="400" />  | [See Code for RxCounter](https://github.com/reactables/reactables/tree/main/packages/examples/src/RxCounter/RxCounter.ts) |  <a href="https://stackblitz.com/edit/github-qtpo1k?file=src%2Findex.js"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/VanillaJS.jpg" width="50" /></a><br /><a href="https://stackblitz.com/edit/github-hfk1t1?file=src%2FCounter.tsx"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/React.png" width="60" /></a><br /><a href="https://stackblitz.com/edit/github-98unub?file=src%2Fapp%2Fcounter%2Fcounter.component.ts"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/Angular.png" width="60" /></a>

### Scoped Effects - Updating Todos <a name="scoped-effects-example"></a>

Updating statuses of todo items shows scoped effects in action. An 'update todo' stream is created for each todo during update. Pending async calls in their respective stream are cancelled if a new request comes in with a RxJS [switchMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap) operator.

Design Diagram           | Reactable      | Try it out on StackBlitz.<br /> Choose your framework
:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/Slide12ScopedEffectsExampleTodos.jpg" width="400" /> | [See Code for RxTodoUpdates](https://github.com/reactables/reactables/tree/main/packages/examples/src/RxTodoUpdates/RxTodoUpdates.ts) |  <a href="https://stackblitz.com/edit/github-6pgtev?file=src%2Findex.js"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/VanillaJS.jpg" width="50" /></a><br /><a href="https://stackblitz.com/edit/github-1r6pki?file=src%2FTodoUpdates.tsx"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/React.png" width="60" /><br /><a href="https://stackblitz.com/edit/github-zfmupm?file=src%2Fapp%2Fapp.component.ts,src%2Fapp%2Ftodos%2Ftodos.component.ts"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/Angular.png" width="60" /></a>

### Connecting Multiple Reactables - Event Tickets  <a name="connecting-hub-example"></a>

This examples shows two sets of reactables. The first is responsible for updating the state of user controls, while the second fetches prices based on input from the first.

Design Diagram           | Reactable     | Try it out on StackBlitz.<br /> Choose your framework
:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/Slide13ConnectingHubsExampleEventPrices.jpg" width="400" />|  [See Code for RxEventTickets](https://github.com/reactables/reactables/tree/main/packages/examples/src/RxEventTickets/RxEventTickets.ts) | <a href="https://stackblitz.com/edit/github-pgpwly?file=src%2findex.js"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/VanillaJS.jpg" width="50" /></a><br /><a href="https://stackblitz.com/edit/github-eypqvc?file=src%2FEventTickets.tsx"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/React.png" width="60" /></a><br /><a href="https://stackblitz.com/edit/github-66mbtu?file=src%2Fapp%2Fevent-tickets%2Fevent-tickets.component.ts"><img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/Angular.png" width="60" /></a>


## API <a name="api"></a>

### Reactable <a name="reactable"></a>

Reactables provide the API for applications and UI components to receive and trigger state updates.

It is a tuple with the first item being an Observable emitting state changes and the second item is a dictionary of action methods for triggering state updates. 

```typescript
export type Reactable<T, S = ActionMap> = [Observable<T>, S];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
```

### RxBuilder <a name="rx-builder"></a>

Factory function for building [Reactables](#reactable). Accepts a [RxConfig](#rx-confg) configuration object.

```typescript
type RxBuilder = <T, S extends Cases<T>>(config: RxConfig<T, S>) => Reactable<T, unknown>

```

#### RxConfig <a name="rx-config"></a>

Configuration object for creating Reactables.

```typescript
interface RxConfig <T, S extends Cases<T>>{
  initialState: T;
  reducers: S;
  storeValue?: boolean;
  debug?: boolean;
  effects?: Effect<unknown, unknown>[];
  sources?: Observable<Action<unknown>>[] | { [key: string]: Observable<unknown> };
}

interface Cases<T> {
  [key: string]: SingleActionReducer<T, unknown>
    | {
        reducer: SingleActionReducer<T, unknown>
        effects?: (payload?: unknown) => ScopedEffects<unknown>
      };
}

type SingleActionReducer<T, S> = (state: T, action: Action<S>) => T;
```
| Property | Description |
| -------- | ----------- |
| initialState | Initial state of the Reactable |
| reducers | Dictionary of cases for the Reactable to handle. Each case can be a reducer function or a configuration object. RxBuilder will use this to generate Actions, Reducers, and add [ScopedEffects](#api-scoped-effects). |
| debug (optional) | to turn on debugging to console.log all messages received by the store and state changes |
| storeValue (optional) | Option to store value if Reactable is used to persist application state. Subsequent subscriptions will receive the latest stored value. Default to false |
| effects (optional) | Array of [Effects](#api-effects) to be registered to the Reactable |
| sources (optional) <a name="hub-sources"></a> | Additional [Action](#api-actions) Observables the Reactable is listening to. Can be an array or a dictionary where key is the action type and value is the Observable emitting the payload |

Debug Example:

<img src="https://raw.githubusercontent.com/reactables/reactables/main/documentation/SlideSixDebug.jpg" width="500" />

### Other Interfaces <a name="interfaces"></a>

#### Effect <a name="api-effect"></a>

Effects are expressed as [RxJS Operator Functions](https://rxjs.dev/api/index/interface/OperatorFunction). They pipe the [dispatcher$](#hub-dispatcher) stream and run side effects on incoming [Actions](#api-action).

```typescript
type Effect<T, S> = OperatorFunction<Action<T>, Action<S>>;
```

#### ScopedEffects <a name="api-scoped-effects"></a>

Scoped Effects are declared when defining reducers in [RxConfig](#rx-config). They are dynamically created stream(s) scoped to an Action `type` & `key` combination.

```typescript
interface ScopedEffects<T> {
  key?: string;
  effects: Effect<T, unknown>[];
}
```
| Property | Description |
| -------- | ----------- |
| key (optional) | key to be combined with the Action `type` to generate a unique signature for the effect stream(s). Example: An id for the entity the action is being performed on. |
| effects | Array of [Effects](#api-effects) scoped to the Action `type` & `key` |


#### Action <a name="api-action"></a>
```typescript
interface Action<T = undefined> {
  type: string;
  payload?: T;
  scopedEffects?: ScopedEffects<T>;
}
```
| Property | Description |
| -------- | ----------- |
| type | type of Action being dispatched |
| payload (optional) | payload associated with Action |
| scopedEffects (optional) | [See ScopedEffects](#api-scoped-effects) |

#### Reducer <a name="api-reducer"></a>

From the [Redux Docs](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers):
> Reducers are functions that take the current state and an action as arguments, and return a new state result

```typescript
type Reducer<T> = (state?: T, action?: Action<unknown>) => T;
```

## Testing Reactables<a name="testing"></a>

We can use RxJS's built in [Marble Testing](https://rxjs.dev/guide/testing/marble-testing) for testing [Reactables](#reactable).

[Test for RxCounter](https://github.com/reactables/reactables/blob/main/packages/examples/src/RxCounter/RxCounter.test.ts)

```typescript
import { RxCounter } from './RxCounter';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

describe('RxCounter', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });
  afterEach(() => {
    subscription?.unsubscribe();
  });

  it('should increment and reset', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      // Create Counter Reactable
      const [
        state$,
        { increment, reset },
      ] = RxCounter();

      // Call actions
      subscription = cold('--b-c', {
        b: increment,
        c: reset,
      }).subscribe((action) => action());

      // Assertions
      expectObservable(state$).toBe('a-b-c', {
        a: { count: 0 },
        b: { count: 1 },
        c: { count: 0 },
      });
    });
  });
});
```
