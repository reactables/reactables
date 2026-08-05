# Background

`ActionObservableWithTypes<T>` (the third member of the `Reactable` type in `packages/core/src/Models/Reactable.ts`) exposes a stream of every action emitted by a Reactable.

Today, consumers typically listen for specific actions by calling `ofTypes(...)` and passing one or more action type strings.

```ts
const [,,actions$] = rxSomeReactable;
actions$.ofTypes(['loginSucceeded']).subscribe(action => {
  // ...
});
```

While flexible, this approach has a few drawbacks:

- It relies on string literals, making it easy to introduce typos.
- Developers need to know or look up the available action types.
- The API is less discoverable since IntelliSense cannot suggest available actions.
- Payload types are inferred from a union and must be narrowed.

# Proposal

Extend `ActionObservableWithTypes<T>` with a new `actionMap` property.

`actionMap` will be a dictionary of Observables. The map may be nested, but every leaf will be an `Observable` that emits exactly one action type.

Instead of filtering a generic action stream, developers can subscribe directly to the action they are interested in.

```ts
const [,,actions$] = rxSomeReactable;
actions$.actionMap.loginSucceeded.subscribe(action => {
  // action.payload is fully typed
});
```

For combined Reactables, the structure naturally mirrors the Reactable hierarchy.

```ts
const [,,actions$] = rxSomeReactable;
actions$.actionMap.user.loginSucceeded.subscribe(action => {
  // ...
});
```

This provides several benefits:

- **Better discoverability.** Developers can browse available actions through IntelliSense instead of remembering action names.
- **No string literals.** Action names become compile-time checked, making refactoring safer.
- **Stronger type safety.** Each Observable emits a single, correctly typed action, including its payload.
- **Cleaner API.** The common case becomes subscribing directly to an action rather than filtering a generic stream.
- **Improved developer experience.** Developers can simply navigate to the action they want instead of repeatedly calling `ofTypes(...)`.

`ofTypes(...)` will continue to exist for scenarios where dynamic filtering or listening to multiple action types is desired. `actionMap` is intended to provide a more ergonomic and type-safe API for the common case.

# Task

Update `packages/core/src/Helpers/RxBuilder.ts` and all relevant types/interfaces to support this feature.

The resulting `ActionObservableWithTypes<T>` should always expose an `actionMap` property that is fully typed based on the actions declared when the Reactable is created.

Existing functionality, including `ofTypes(...)`, should continue to work unchanged.

# Scope

This change is limited to the `core` package.

Implement support for Reactable primitives created by `packages/core/src/Helpers/RxBuilder.ts` only. This work is expected to be a feature branch and may be implemented incrementally.

Support for combined Reactables (`packages/core/src/Helpers/combine.ts`) is intentionally out of scope for this change and will be implemented in a later phase. At that point, `actionMap` will mirror the combined Reactable hierarchy, with Observables at each leaf.