# Hubfx Core (WIP)

## Description

Reactive state management with RxJS.

## Table of Contents

1. [Installation](#installation)
1. [Core concepts](#core-concepts)
    1. [Reactables](#reactable-concept)
    1. [Hub and Stores](#hub-stores)
    1. [Effects](#effects)
    1. [Scoped Effects](#scoped-effects)
    1. [Flow & Containment](#flow-containment)
1. [Examples](#examples)
    1. [Basic Counter](#basic-counter-example)
    1. [Scoped Effects - Updating Todos](#scoped-effects-example)
    1. [Connecting Multiple Hubs - Event Prices](#connecting-hub-example)
1. [API](#api)
    1. [Reactable](#reactable)
    1. [RxBuilder](#rx-builder)
        1. [createSlice](#create-slice)
        1. [createHub](#create-hub)
        1. [addEffects](#add-effects)
        1. [HubConfig](#hub-config)
    1. [Hub](#hub)
        1. [Store Config](#store-config)
    1. [Effect](#api-effect)
    1. [ScopedEffects](#api-scoped-effects)
    1. [Action](#api-action)
    1. [Reducer](#api-reducer)
1. [Testing](#testing)
    1. [Reactables](#testing-reactables)
    1. [messages$](#testing-messages)

## Installation <a name="installation"></a>

`npm i @hub-fx/core`

## Core concepts <a name="core-concepts"></a>

**Prerequisite**: Basic understanding of [Redux](https://redux.js.org/introduction/core-concepts) and [RxJS](https://rxjs.dev/) is helpful.

In this documentation the term *stream* will refer to an RxJS observable stream.

### Reactables <a name="reactable-concept"></a>

[Reactables](#reactable) are objects that encapulates all the logic required for managing state. They exposes a `state$` observable and actions methods. Applications can subscribe to `state$` to receive state changes and call action methods to trigger them.

```javascript
import { RxCounter } from '@hub-fx/examples';

const counterReactable = RxCounter();

const { state$, actions: { increment, reset } } = counterReactable;

state$.subscribe(({ count }) => {
  // Update the count when state changes.
  document.getElementById('count').innerHTML = count;
});

// Bind click handlers
document.getElementById('increment').addEventListener('click', increment);
document.getElementById('reset').addEventListener('click', reset);

```
For full example see [Basic Counter Example](#basic-counter-example).

### Hub and Stores <a name="hub-stores"></a>

[Reactables](#reactable-concept) are composed of Hubs & Stores.

The **Hub** is responsible for dispatching actions to the store(s) registered to the hub. It is also responsible for handling side effects. The main stream that initiates all actions and effects is the `dispatcher$` 

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideOneHubStore.jpg" width="600" />

### Effects<a name="effects"></a>

When initializing a hub we can declare effects. The hub can listen for various actions and perform side-effects as needed. Stores that are registered to the hub will be listening to these effects as well the `dispatcher$`.

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideTwoEffect.jpg" width="600" />

### Scoped Effects <a name="scoped-effects"></a>

Scoped Effects are dynamically created streams scoped to a particular action & key combination when an action is dispatch.

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideThreeScopedEffects.jpg" width="600" />

### Flow & Containment <a name="flow-containment"></a>
Actions and logic flow through the App in one direction and are **contained** in their respective streams. This makes state updates more predictable and traceable during debugging.

Avoid [tapping](https://rxjs.dev/api/operators/tap) your streams. This prevents **logic leaking** from the stream(s).

  - i.e do not [tap](https://rxjs.dev/api/operators/tap) stream A to trigger an action on stream B. Instead consider declaring stream A as a [source](#hub-sources) for stream B so the dependency is explicit.

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideSevenEightUnidirectionalFlow.jpg" />

## Examples <a name="examples"></a>

### Basic Counter <a name="basic-counter-example"></a>

Basic counter example. Button clicks dispatches actions to increment or reset the counter.

Basic Counter             |  Design Diagram           | Try it out on StackBlitz.<br /> Choose your framework
:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/BasicCounterExamplePic.jpg" width="200" />  | <img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/Slide11BasicCounterExample.jpg" width="400" />  |  <a href="https://stackblitz.com/edit/github-pefgx1?file=src%2findex.js"><img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/VanillaJS.jpg" width="50" /></a><br /><a href="https://stackblitz.com/edit/github-ifcss4?file=src%2FCounter.tsx"><img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/React.png" width="60" /></a>

### Scoped Effects - Updating Todos <a name="scoped-effects-example"></a>

Updating statuses of todo items shows scoped effects in action. An 'update todo' stream is created for each todo during update. Pending async calls in their respective stream are cancelled if a new request comes in with RxJS [switchMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap) operator.

Todo Status Updates             |  Design Diagram           | Try it out on StackBlitz.<br /> Choose your framework
:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/ScopedEffectsTodosPic.jpg" width="200" />  | <img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/Slide12ScopedEffectsExampleTodos.jpg" width="400" />  |  <a href="https://stackblitz.com/edit/github-ktscac?file=src%2Findex.js"><img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/VanillaJS.jpg" width="50" /></a><br /></a><br /><a href="https://stackblitz.com/edit/github-mwhyzk?file=src%2FTodoUpdates.tsx"><img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/React.png" width="60" />

### Connecting Multiple Hubs - Event Prices  <a name="connecting-hub-example"></a>

This examples shows two sets of hub & stores. The first set is responsible for updating state of the user controls. The second set fetches prices based on input from the first set.

Event Prices             |  Design Diagram           | Try it out on StackBlitz.<br /> Choose your framework
:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/ConnectingHubsEventPricesPic.jpg" width="200" />  | <img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/Slide13ConnectingHubsExampleEventPrices.jpg" width="400" />  | <a href="https://stackblitz.com/edit/github-mkurfe?file=src%2Findex.js"><img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/VanillaJS.jpg" width="50" /></a><br /><a href="https://stackblitz.com/edit/github-s8z2ne?file=src%2FEventTickets.tsx"><img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/React.png" width="60" /></a><br />


## API <a name="api"></a>

### Reactable <a name="reactable"></a>

Reactables provide the API for applications and UI components to receive and trigger state updates.

```typescript
export interface Reactable<T, S extends ActionMap> {
  state$: Observable<T>;
  actions?: S;
}

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void;
}
```
| Property | Description |
| -------- | ----------- |
| state$ | Observable that emit state changes |
| actions (optional) | Dictionary of methods that dispatches actions to update state |

### RxBuilder <a name="rx-builder"></a>

RxBuilder provides utilities to help build [Reactables](#reactable)

#### `createSlice` <a name="create-slice"></a>
Generates a reducer and actions for state updates. Inspired by [`@reduxjs/toolkit/createSlice`](https://redux-toolkit.js.org/api/createSlice). 

```typescript
type createSlice <T, S extends Cases<T>>(config: SliceConfig<T, S>) => Slice<T>

export interface SliceConfig<T, S extends Cases<T>> {
  initialState: T;
  reducers: S;
  name?: string; // for namespacing if your slice is part of a larger state
}

interface Slice<T> {
  actions: { [key: string]: ActionCreator<unknown> };
  reducer: Reducer<T>;
}
```

#### `addEffects` <a name="add-effects"></a>

Decorator function that accepts an action creator and extends the behaviour with a [ScopedEffects](#scoped-effects) for triggering side effects. 


```typescript
type addEffects = <T>(
  actionCreator: ActionCreator<T>,
  scopedEffects: (payload: T) => ScopedEffects<T>
) => ActionCreator<T>
```

#### `createHub` <a name="create-hub">

Creates a [Hub](#hub)

```typescript
type createHub = (config?: HubConfig) => Hub;

```

#### HubConfig <a name="hub-config"></a>

```typescript
interface HubConfig {
  effects?: Effect<unknown, unknown>[];
  sources?: Observable<Action<unknown>>[];
}
```
| Property | Description |
| -------- | ----------- |
| effects (optional) | Array of [Effects](#api-effects) to be registered to the Hub |
| sources (optional) <a name="hub-sources"></a> | Additional [Action](#api-actions) Observables the Hub is listening to |



### Hub <a name="hub"></a>
```typescript
interface Hub {
  messages$: Observable<Action<unknown>>;
  store: <T>(config: StoreConfig<T>) => Observable<T>;
  dispatch: (...actions: Action<unknown>[]) => void;
}
```
| Property | Description |
| -------- | ----------- |
| messages$ <a name="hub-messages"></a> | Observable of all [Actions](#api-actions) sent to store(s) listening to the hub |

| Method | Description |
| -------- | ----------- |
| store | creates a store that will receive actions emitted from the hub via `messages$`. Accepts a configuration object (see [StoreConfig](#store-config)) |
| dispatch | dispatches [Action(s)](#api-actions) to the store(s) and effects (if any) |

#### Store Config <a name="store-config"></a>

```typescript
export interface StoreConfig<T> {
  reducer: Reducer<T>;
  initialState?: T;
  name?: string;
  debug?: boolean;
}
```
| Property | Description |
| -------- | ----------- |
| reducer | [Reducer](#api-reducer) function handle state updates in store |
| intitialState (optional) | for seeding an initial state |
| name (optional) | name of stream to show up during debugging |
| debug (optional) | to turn on debugging to console.log all messages received by the store and state changes |

Debug Example:

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideSixDebug.jpg" width="500" />

### Effect <a name="api-effect"></a>

Effects are expressed as [RxJS Operator Functions](https://rxjs.dev/api/index/interface/OperatorFunction). They pipe the [dispatcher$](#hub-dispatcher) stream and run side effects on incoming [Actions](#api-action).

```typescript
type Effect<T, S> = OperatorFunction<Action<T>, Action<S>>;
```

### ScopedEffects <a name="api-scoped-effects"></a>

Scoped Effects are declared in [Actions](#api-action). They are dynamically created stream(s) scoped to an Action `type` & `key` combination.

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

Example:

```typescript

const UPDATE_TODO = 'UPDATE_TODO';
const UPDATE_TODO_SUCCESS = 'UPDATE_TODO_SUCCESS';
const updateTodo = ({ id, message }, todoService: TodoService) => ({
  type: UPDATE_TODO,
  payload: { id, message },
  scopedEffects: {
    key: id,
    effects: [
      (updateTodoActions$: Observable<Action<string>>) =>
        updateTodoActions$.pipe(
          mergeMap(({ payload: { id, message } }) => todoService.updateTodo(id, message))
          map(({ data }) => ({
            type: UPDATE_TODO_SUCCESS,
            payload: data
          }))
        )
    ]
  }
})
```

### Action <a name="api-action"></a>
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

### Reducer <a name="api-reducer"></a>

From [Redux Docs](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers)
> Reducers are functions that take the current state and an action as arguments, and return a new state result

```typescript
type Reducer<T> = (state?: T, action?: Action<unknown>) => T;
```

## Testing <a name="testing"></a>

We can use RxJS's built in [Marble Testing](https://rxjs.dev/guide/testing/marble-testing) for testing [Reactables](#reactable).

### Reactables <a name="testing-reactables"></a>

```typescript
// https://github.com/hub-fx/hub-fx/blob/main/packages/examples/src/Counter/Counter.test.ts
import { Counter } from './Counter';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

describe('Counter', () => {
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
      const {
        state$,
        actions: { increment, reset },
      } = Counter();

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

### messages$ <a name="testing-messages"></a>

You can test the Hub's [messages$](hub-messages) stream to see that dispatched actions and results from side effects are being handled correctly.


Example of testing an effect:
```typescript
  it('should detect a generic effect', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const successAction = {
        type: TEST_ACTION_SUCCESS,
        payload: 'test action success',
      };
      const effect = (action$: Observable<unknown>) =>
        action$.pipe(
          switchMap(() => of(successAction).pipe(delay(2000))),
        );

      const { messages$, dispatch } = HubFactory({ effects: [effect] });
      const action = { type: TEST_ACTION, payload: 'test' };

      // Remember to unsubscribe this in your afterEach block
      subscription = cold('a', { a: action }).subscribe(
        dispatch,
      );

      expectObservable(messages$).toBe('a 1999ms b', {
        a: action,
        b: successAction,
      });
    });
  });
```

