## Global State with Reactables

Your global state can be managed by **one** Reactable. This Reactable can be created with <a href="https://reactables.github.io/reactables/references/core-api/#rx-builder" target="_blank">RxBuilder</a> or via composition.

**Reactables are unopinionated on how they are stored and accessed for global state management**.

In React you can use a `Context` or prop drilling. <a href="https://reactables.github.io/reactables/react/react-bindings/" target="_blank">`@reactables/react`</a> package has a <a href="https://reactables.github.io/reactables/react/react-bindings/#providers" target="_blank">`StoreProvider`</a> component if you want to use a context to store your reactable. The state can then be accessed with the <a href="https://reactables.github.io/reactables/react/react-bindings/#useappstore" target="_blank">`useAppStore`</a> hook.

In Angular, initializing your Reactable in a service provided in `root` is an easy choice.

You can use the APIs available in your framework for storing Reactable(s) in the global scope.

**Decorate Reactable with <a href="https://reactables.github.io/reactables/references/core-api/#store-value" target="_blank">`storeValue`</a>**

By default, the state observable from a Reactable is just an <a href="https://rxjs.dev/guide/observable" target="_blank">`Observable`</a>. It does not hold a value and only emits a new state object when an action is invoked.

When using a Reactable for managing global state, it needs to be decorated with the <a href="https://reactables.github.io/reactables/references/core-api/#store-value" target="_blank">`storeValue`</a> decorator which extends the Reactable to return a <a href="https://rxjs.dev/api/index/class/ReplaySubject" target="_blank">`ReplaySubject`</a> instead of the default state `Observable`.  This ensures subsequent subscriptions from UI components will always receive the latest value. 

Example:
```typescript
const [
  state$, // state$ is now a ReplaySubject
  actions
] = storeValue(RxToggle());

```