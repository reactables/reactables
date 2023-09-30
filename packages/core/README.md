# Hubfx Core (WIP)

## Description

Reactive state management with RxJS.

## Table of Contents

1. [Installation](#installation)
1. [Core concepts](#core-concepts)
    1. [Hub and Stores](#hub-stores)
    1. [Effects](#effects)
    1. [Scoped Effects](#scoped-effects)
    1. [Integrating with UI](#integration)
    1. [Flow & Containment](#flow-containment)
1. [Examples](#examples)
    1. [Basic Usage](#api-usage)
    1. [Angular Example](#hub-angular-example)
    1. [React Example](#hub-react-example)
    1. [Action with Scoped Effect](#scoped-effect-example)
    1. [Advanced: Connecting two hubs (Hubfx Forms) ](#advanced-hubfx-forms)
1. [API](#api)
    1. [Effect](#api-effect)
    1. [Action](#api-action)
    1. [Reducer](#api-reducer)
    1. [ScopedEffects](#api-scoped-effects)
    1. [HubFactory](#hub-factory)
        1. [HubConfig](#hub-config)
    1. [Hub](#hub)
        1. [Store Config](#store-config)
1. [Testing](#testing)
    1. [messages$](#testing-messages)
    1. [store](#testing-store)

## Installation <a name="installation"></a>

`npm i @hub-fx/core`

## Core concepts <a name="core-concepts"></a>

**Prerequisite**: Basic understanding of [Redux](https://redux.js.org/introduction/core-concepts) and [RxJS](https://rxjs.dev/) is helpful.

Hubfx uses the same concepts from [Redux](https://redux.js.org/introduction/core-concepts) regarding Actions, Reducers, Store. These concepts are coupled with [RxJS](https://rxjs.dev/) observables to manage state modelled as reactive streams.

In this documentation the term *stream* will refer to an RxJS observable stream.

### Hub and Stores <a name="hub-stores"></a>

The **Hub** is responsible for dispatching actions to the store(s) registered to the hub. It is also responsible for handling side effects. The main stream that initiates all actions and effects is the `dispatcher$` 

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideOneHubStore.jpg" width="600" />

### Effects<a name="effects"></a>

When initializing a hub we can declare effects. The hub can listen for various actions and perform side-effects as needed. Stores that are registered to the hub will be listening to these effects as well the `dispatcher$`.

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideTwoEffect.jpg" width="600" />

### Scoped Effects <a name="scoped-effects"></a>

Scoped Effects are dynamically created streams scoped to a particular action & key combination when an action is dispatch.

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideThreeScopedEffects.jpg" width="600" />

### Integrating with UI <a name="integration"></a>
A network of hubs and stores can be integrated with UI components without tight coupling. Separating presentation concerns improves testability and allows developers to decide how to integrate with UI components.

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideFourFiveIntegration.jpg" />

### Flow & Containment <a name="flow-containment"></a>
Actions and logic flow through the App in one direction and are **contained** in their respective streams. This makes state updates more predictable and traceable during debugging.

Avoid [tapping](https://rxjs.dev/api/operators/tap) your streams. This prevents **logic leaking** from the stream(s).

  - i.e do not [tap](https://rxjs.dev/api/operators/tap) stream A to trigger an action on stream B. Instead consider declaring stream A as a [source](#hub-sources) for stream B so the dependency is explicit.

<img src="https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/SlideSevenEightUnidirectionalFlow.jpg" />

## Examples <a name="examples"></a>

### Basic Usage <a name="api-usage"></a>

```typescript
import { HubFactory } from '@hub-fx/core';

// Create a hub
const hub = HubFactory();

// Pure reducer function to handle state updates
const countReducer = (state = { counter: 0 }, action) => {
  switch (action.type) {
    case 'increment':
      return { counter: state.counter + 1 };
    default:
      return state;
  }
}

// Create a store listening to `hub`
const count$ = hub.store({ reducer: countReducer });

// Subscribe to store for updates
count$.subscribe((count) => console.log(count));

hub.dispatch({ type: 'increment' });

// Output
// 1
```

### Angular Example <a name="hub-angular-example"></a>

Using our above count example we can integrate with an Angular component. 

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { HubFactory } from '@hub-fx/core';
import { countReducer } from '/countReducer';

export class CounterComponent {
  // A component can have its own hub or connect to one from an ancestor component
  @Input() hub = HubFactory();
  count$: Observable<number>;

  increment() {
    this.hub.dispatch({ type: 'increment' });
  }

  ngOnInit() {
    this.count$ = this.hub.store({ reducer: countReducer });
  }
}

```

### React Example <a name="hub-react-example"></a>

Using our above count example we can integrate with a React component. 

```typescript
import { useHub } from './useHub';
import { useObservable } from './useObservable';
import { countReducer } from './countReducer';

// A component can have its own hub or connect to one from an ancestor component
const Counter = (({ hub = useHub() })) => {

  const count = useObservable(hub.store(countReducer));

  return (
    <div>
      Count: {count}
      <button onClick={ () => {hub.dispatch({ type: 'increment' }); }}>
        Increment
      </button>
    </div>
  )
}


```

Hook to store a hub reference.

```typescript
// useHub.ts

import { useRef } from 'react';
import { HubFactory } from '@hub-fx/core';

export const useHub = () => {
  return useRef(HubFactory()).current;
};
```

Hook to bind observable to React state.

```typescript
// useObservable.ts

import { useEffect, useState, useRef } from 'react';
import { Observable } from 'rxjs';

export const useObservable = <T>(obs$: Observable<T>) => {
  const currentObs$ = useRef(obs$).current;
  const [state, setState] = useState<T | undefined>(undefined);

  useEffect(() => {
    const subscription = currentObs$.subscribe((result) => {
      setState(result);
    });

    const unsubscribe = subscription.unsubscribe.bind(
      subscription,
    ) as () => void;

    return unsubscribe;
  }, []);

  return state;
};
```

### Action with Scoped Effect <a name="scoped-effect-example"></a>

Example of an action that when dispatched will dynamically create a effect stream scoped to the Action `type` and `key` combination.

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
### Advanced: Connecting two hubs (example with [Hubfx Forms](https://github.com/hub-fx/hub-fx/tree/main/packages/forms)) <a name="advanced-hubfx-forms"></a>

The following diagram visualizes the architecture of [Hubfx Forms](https://github.com/hub-fx/hub-fx/tree/main/packages/forms) - a state management model for building reactive forms.

There are two sets of hub and stores. The first set is responsible for handling user input and updating the form. The second set is responsible for reacting to the form change in the first store and handling both synchronous and asynchronous validation.

![Hubfx architecture](https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/Slide10HubfxForms.jpg)

See [Hubfx Forms](https://github.com/hub-fx/hub-fx/tree/main/packages/forms) for more details.

## API <a name="api"></a>

### Effect <a name="api-effect"></a>
```typescript
type Effect<T, S> = OperatorFunction<Action<T>, Action<S>>;
```
Effects are expressed as [RxJS Operator Functions](https://rxjs.dev/api/index/interface/OperatorFunction). They pipe the [dispatcher$](#hub-dispatcher) stream and run side effects on incoming [Actions](#api-action).

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

### ScopedEffects <a name="api-scoped-effects"></a>
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

Scoped Effects are declared in [Actions](#api-action). They are dynamically created stream(s) scoped to an Action `type` & `key` combination.

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

### Reducer <a name="api-reducer"></a>

```typescript
type Reducer<T> = (state?: T, action?: Action<unknown>) => T;
```
From [Redux Docs](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers)
> Reducers are functions that take the current state and an action as arguments, and return a new state result

### HubFactory <a name="hub-factory"></a>

Factory function for creating [Hubs](#hub)

```typescript
type HubFactory = (config?: HubConfig) => Hub;

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

## Testing <a name="testing"></a>

### messages$ <a name="testing-messages"></a>

You can test the Hub's [messages$](hub-messages) stream to see that dispatched actions and results from side effects are being handled correctly.

We can use RxJS's built in [Marble Testing](https://rxjs.dev/guide/testing/marble-testing) for testing our observable streams.

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

### store <a name="testing-store"></a>
#### Testing Reducers
Testing reducer functions is easily done since they are pure functions. Just provide the neccessary inputs and assert the expected new state.

#### Testing the stream
We can also test the stream created from [Hub.store](#hub).

Example of testing with [marble](https://rxjs.dev/guide/testing/marble-testing):

```typescript
  describe('store', () => {
    const INCREMENT = 'INCREMENT';
    const increment = (): Action => ({ type: INCREMENT });

    const initialState = { count: 0 };
    const reducer: Reducer<{ count: number }> = (
      state = initialState,
      action,
    ) => {
      switch (action?.type) {
        case INCREMENT:
          return {
            ...state,
            count: state.count + 1,
          };
        default:
          return state;
      }
    };

    it('should response to messages and update', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const state$ = hub.store({ reducer });
        const action = increment();
        // Remember to unsubscribe this in an afterEach block
        subscription = cold('-a-b-c', {
          a: action,
          b: action,
          c: action,
        }).subscribe(hub.dispatch);

        expectObservable(state$).toBe('0 1-2-3', [
          { count: 0 },
          { count: 1 },
          { count: 2 },
          { count: 3 },
        ]);
      });
    });
  });

```