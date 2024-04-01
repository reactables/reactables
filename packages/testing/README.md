# Reactables Testing

## Description

Testing helpers for reactables

## Table of Contents

1. [Installation](#installation)
1. [API](#api)
    1. [testFlow](#test-flow)
    1. [FlowTest](#flow-test)
    1. [Flow](#flow)
    1. [FlowFactory](#flow-factory)

## Installation <a name="installation"></a>

`npm i -D @reactables/testing`

## API <a name="api"></a>

### `testFlow` <a name="test-flow"></a>
Function for running a [`FlowTest`](#flow-test) on a reactable.

```typescript
// T = reactable state
// S = reactable actions
// U = reactable dependencies
// V = expected result
type testFlow = <T, S, U extends unknown[], V = T>(
  flowTest: FlowTest<T, S, U, V>,
) => void;
```

### `FlowTest` <a name="flow-test"></a>

Configuration for testing a [`Flow`](#flow) on a reactable.

```typescript
// T = reactable state
// S = reactable actions
// U = reactable dependencies
// V = expected result
export interface FlowTest<T, S, U extends unknown[] = undefined, V = T> {
  description: string;
  factories: {
    flow: FlowFactory<S>;
    reactable: (...deps: U) => Reactable<T, S>;
    dependencies?: () => U;
  };
  expectedResult: V;
  operator?: OperatorFunction<T, V | T>;
  assertFunc?: (actual, expected) => void | boolean;
}
```

| Property | Description |
| -------- | ----------- |
| description  | Describes the test. |
| factories.flow  | [`FlowFactory`](#flow-factory) that will create the flow to be tested. |
| factories.reactable | Factory method creating the reactable.
| factories.dependencies | Factory function creating the reactable's dependencies.
| expectedResult  | Expected result for the test. |
| operator (optional) | Operator function for manipulating the final value emitted by the reactable's state observable.
| assertFunc (optional) | Function that will assert actual vs expected. (default `isEqual`)|
| actionInterval (optional) | Time interval between action calls in the flow run. (default 5000ms) |

### `Flow` <a name="flow"></a>

Used to simulate a user flow. An array of functions used to envoke a reactable's action methods.

```typescript
type Flow = (() => void)[];
```
### `FlowFactory` <a name="flow-factory"></a>

Factory function for creating a [`Flow`](#flow) from a reactable's action methods.

```typescript
type FlowFactory<T> = (actions: T) => Flow;
```
