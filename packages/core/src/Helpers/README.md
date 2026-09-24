# Selector API Design for Reactables

## Understanding the constraints

A few important things the current architecture tells us:

- `RxBuilder` returns a raw tuple (`[storedState$, actions, actions$]`). There's no builder class — it's a function returning a value, so `.selectors()` would need to be a method added to the returned tuple object.
- `storedState$` is a `ReplaySubject(1)`. This is the natural upstream source for derived selector observables.
- `combine` uses `combineLatest(states)` — the combined state is `{ [K in keyof T]: ObservedValueOf<T[K][0]> }`. This is the natural state type for combined-level selectors.
- Existing call sites destructure tuples: `const [state$, actions, actions$] = RxBuilder(...)`. Any change must preserve this.

---

## Memoization semantics

The right model for selectors in an RxJS system is **derived observables, not functions**. Each selector should become:

```ts
state$.pipe(
  map(selectorFn),
  distinctUntilChanged(),
  shareReplay(1),
)
```

This gives you:

| Property | How achieved |
|---|---|
| Recompute only when state changes | `state$` only emits on state change |
| Suppress downstream emission when result unchanged | `distinctUntilChanged()` |
| Multiple consumers without redundant computation | `shareReplay(1)` multicasts |
| Immediate value on subscription | `shareReplay(1)` replays last value |

`distinctUntilChanged()` uses `===` by default. This is correct for primitive results (numbers, booleans, strings) and for selectors that return the same object reference when inputs haven't changed. Selectors that build new object literals on every call (`state => ({ ...state })`) will defeat it — this is a well-understood constraint, shared with Reselect and similar libraries. Document it explicitly.

**This is reactive memoization**, not function-call memoization. The selector doesn't "run when called" — it runs when state changes and the result is cached. This fits the RxJS model naturally.

---

## Selector composition

For selectors that depend on other selectors, the simplest ergonomic approach is plain function calls:

```ts
const fns = {
  double: (state: CounterState) => state.count * 2,
  isPositiveDouble: (state: CounterState) => fns.double(state) > 0,
};

const counter = RxBuilder({...}).selectors(fns);
```

This works because both selectors derive independently from `state$`. The `distinctUntilChanged()` on `isPositiveDouble$` suppresses re-emissions even if `double` was the intermediate computation. Since the selector functions are pure and run only on state change, there's no meaningful overhead from calling `fns.double(state)` inside another selector.

For cross-selector composition across **different reactables**, use the selector observables directly with `combineLatest`:

```ts
const combined$ = combineLatest([
  counter.selectors.double,
  toggle.selectors.isActive,
]).pipe(map(([d, active]) => d * (active ? 1 : -1)));
```

Whether selectors should be able to reference each other inside the `.selectors({...})` definition (à la Reselect's `createSelector`) is a separate question. My recommendation: **don't build this into the core API**. It adds complexity, and the compose-via-functions pattern above covers 95% of cases. If a user wants full Reselect-style DAG composition, they can combine selector observables with `combineLatest` as above. Keep the selector definition API simple.

---

## TypeScript type design

The key challenge is making `state` inside each selector function automatically resolve to the correct state type, and having the result type of each selector preserved through the chain. Here's how it works:

**TypeScript will infer `Defs[K]` as the literal function type**, so `ReturnType<Defs[K]>` gives the correct return type for each selector. The key is constraining `Defs` to `Record<string, (state: T) => unknown>` where `T` is the reactable's state type — TypeScript then fixes `T` from context and checks each selector function against it.

Here's the full type system:

```ts
// ---- Core types ----

// Maps selector defs to observables of their return types
type SelectorsFromDefs<T, Defs extends Record<string, (state: T) => unknown>> = {
  [K in keyof Defs]: Observable<ReturnType<Defs[K]>>
};

// Extracts the selector map from a reactable that has one
type SelectorsOf<R> =
  R extends { selectors: infer Sel } ? Sel : never;

// Maps a record of reactables to their inherited selector maps
// (only includes keys where the child actually has selectors)
type InheritedSelectors<T extends Record<string, any>> = {
  [K in keyof T as SelectorsOf<T[K]> extends never ? never : K]: SelectorsOf<T[K]>
};

// A Reactable tuple augmented with a .selectors property
type ReactableWithSelectors<T, S extends DestroyAction, U, M, Sel extends Record<string, unknown>> =
  Reactable<T, S, U, M> & { selectors: Sel };

// ---- RxBuilder return type ----
// Has a .selectors() method before it's called
type RxBuilderResult<T, S extends DestroyAction, U, M> =
  Reactable<T, S, U, M> & {
    selectors<Defs extends Record<string, (state: T) => unknown>>(
      defs: Defs
    ): ReactableWithSelectors<T, S, U, M, SelectorsFromDefs<T, Defs>>;
  };

// ---- combine return type ----
// Has a .selectors() method that receives the combined state type
// and merges inherited child selectors with any new ones
type CombineResult<
  T extends Record<string, Reactable<unknown, unknown & DestroyAction>>,
  CombinedState extends { [K in keyof T]: ObservedValueOf<T[K][0]> },
  Actions extends { [K in keyof T]: T[K][1] } & DestroyAction,
  ActionsObs,
> =
  [Observable<CombinedState>, Actions, ActionsObs] & {
    selectors<
      Defs extends Record<
        // Prevent name conflicts with inherited child keys at the type level
        Exclude<string, keyof InheritedSelectors<T>>,
        (state: CombinedState) => unknown
      >
    >(
      defs: Defs
    ): ReactableWithSelectors<
      CombinedState, Actions, any, any,
      InheritedSelectors<T> & SelectorsFromDefs<CombinedState, Defs>
    >;
  };
```

---

## Name conflict handling

The design above handles this at the **type level**: the `Defs` constraint for combined selectors uses `Exclude<string, keyof InheritedSelectors<T>>` as the key type, which makes TypeScript report an error if you define a top-level selector with a key that collides with a child key.

This is the right policy. There's no sane merge semantics — if `combine({ user, settings })` has `settings.selectors.isReady` and you define `isReady` at the top level too, silently shadowing the inherited one would be a subtle bug. Erroring at the type level forces the developer to rename one of them.

At runtime, you could additionally log a warning when the `.selectors()` method is called and detects a collision, as a belt-and-suspenders guard.

---

## Implementation sketch

**In `RxBuilder`** (`RxBuilder.ts`):

```ts
const result = [storedState$, actions, actions$] as RxBuilderResult<T, ...>;

(result as any).selectors = <Defs extends Record<string, (state: T) => unknown>>(
  defs: Defs,
) => {
  const selectorObservables = Object.fromEntries(
    Object.entries(defs).map(([key, fn]) => [
      key,
      storedState$.pipe(map(fn), distinctUntilChanged(), shareReplay(1)),
    ]),
  );

  return Object.assign(result, { selectors: selectorObservables });
};

return result;
```

**In `combine`** (`combine.ts`):

```ts
// Collect inherited selectors from children
const inheritedSelectors = Object.fromEntries(
  Object.entries(sourceReactables)
    .filter(([, r]) => {
      const sel = (r as any).selectors;
      return sel != null && typeof sel === 'object';
    })
    .map(([key, r]) => [key, (r as any).selectors]),
) as InheritedSelectors<T>;

const result = [states$, actions, mergedActions$] as CombineResult<T, ...>;

(result as any).selectors = <Defs extends Record<string, (state: CombinedState) => unknown>>(
  defs: Defs,
) => {
  const newSelectors = Object.fromEntries(
    Object.entries(defs).map(([key, fn]) => [
      key,
      states$.pipe(map(fn as any), distinctUntilChanged(), shareReplay(1)),
    ]),
  );

  (result as any).selectors = { ...inheritedSelectors, ...newSelectors };
  return result;
};
```

---

## Usage examples

```ts
// Primitive reactable with selectors
const counter = RxBuilder({
  initialState: { count: 0 },
  reducers: { increment: state => ({ count: state.count + 1 }) },
}).selectors({
  double: state => state.count * 2,          // state: { count: number } — inferred
  isPositive: state => state.count > 0,       // Observable<boolean>
});

counter.selectors.double      // Observable<number>
counter.selectors.isPositive  // Observable<boolean>
const [state$, actions] = counter; // tuple destructuring still works

// Combined reactable
const app = combine({ user, settings }).selectors({
  // state: { user: UserState, settings: SettingsState } — inferred
  displayNameAndTheme: state => `${state.user.name} - ${state.settings.theme}`,
});

app.selectors.user.displayName        // inherited from user
app.selectors.settings.isDarkMode     // inherited from settings
app.selectors.displayNameAndTheme     // Observable<string>

// Nested combine
const root = combine({ app, auth }).selectors({
  isFullyReady: state => state.app.user.isLoggedIn && state.auth.token != null,
});

root.selectors.app.user.displayName   // nested inherited
root.selectors.app.settings.isDarkMode
root.selectors.isFullyReady           // Observable<boolean>
```

---

## TypeScript limitations to be aware of

1. **`distinctUntilChanged` on object results.** If a selector returns a new object reference on every call (e.g. `state => state.items.filter(...)`) TypeScript won't warn you, but the memoization won't suppress emissions. Document this clearly. A custom comparator overload on `.selectors()` could help: `selectors({ key: { fn, equals } })`.

2. **Deeply nested `combine` chains.** TypeScript's type checker works well here, but the `InheritedSelectors` conditional type becomes deeply nested with multiple levels of `combine`. In practice this stays manageable for 2–3 levels but can produce slow type-checking at 4+ levels. This is the same tradeoff as Redux Toolkit's deeply nested slices.

3. **`ReturnType` on overloaded functions.** If a selector function has overload signatures, `ReturnType` picks the last overload. Not a concern for the typical inline arrow-function selectors, but worth knowing.

4. **`Exclude<string, keyof InheritedSelectors<T>>`** for the combined `.selectors()` method. This works correctly when `InheritedSelectors<T>` resolves to a concrete type, but if `T` is still generic at the call site (e.g. inside a factory function), TypeScript may widen it to `string` and lose the conflict detection. This is a known limitation with conditional types on partially-resolved generics.

5. **Mutation vs immutable return.** The `Object.assign(result, { selectors: ... })` approach mutates the original tuple. If the same reactable is passed to two different `.selectors()` chains, they'd conflict at runtime (last write wins). This is unlikely in practice but worth noting — you can guard against it by cloning the tuple first.

---

## Architectural notes

The `shareReplay(1)` on each selector observable means **selector observables hold a reference to the last value**. This is intentional (same as `storedState$` being a `ReplaySubject(1)`), but it means they won't garbage-collect until explicitly completed. Since selectors are tied to the reactable's lifetime, they should be completed when the reactable's `destroy()` is called. This requires piping with `takeUntil(destroy$)` before the `shareReplay`:

```ts
storedState$.pipe(
  map(fn),
  distinctUntilChanged(),
  takeUntil(destroy$),
  shareReplay(1),
)
```

This is important for correctness in long-running applications where reactables are created and destroyed dynamically.

For `combine`, the inherited selector observables from children already carry their own `takeUntil(destroy$)` from when they were created. The combined-level selectors should use the combined `destroy$` chain, which already exists via the `actions.destroy()` cascade.

---

## Results

### What was implemented

**`Models/Reactable.ts`** — 5 new exported types:

| Type | Purpose |
|---|---|
| `SelectorsFromDefs<T, Defs>` | Maps selector defs to `{ key: Observable<ReturnType<fn>> }` |
| `SelectorsOf<R>` | Extracts the `.selectors` property map from a reactable; returns `never` if `.selectors` is still the method (a function) rather than the resolved property map |
| `InheritedSelectors<T>` | Maps a record of reactables to their nested selector maps, omitting children that have no selectors |
| `ReactableWithSelectors<T,S,U,M,Sel>` | The final type after `.selectors()` is called — the original tuple intersected with `{ selectors: Sel }` |
| `RxBuilderResult<T,S,U,M>` | What `RxBuilder` now returns — the tuple intersected with the `.selectors()` method |
| `CombinedState<T>` | Convenience alias for the combined `{ [K]: ObservedValueOf<T[K][0]> }` state shape |

**`Helpers/RxBuilder.ts`** — the returned array gets a `.selectors(defs)` method attached. Each selector becomes `storedState$.pipe(map(fn), distinctUntilChanged(), takeUntil(destroy$), shareReplay(1))`. Calling the method replaces itself with the resulting observable map and returns the same array cast to `ReactableWithSelectors`.

**`Helpers/combine.ts`** — at construction time, child reactables with a `.selectors` property object are collected into `inheritedSelectors`. The result array gets a `.selectors(defs)` method that derives new selectors from `states$` (the `combineLatest` stream), then merges inherited + new selectors onto the same object.

**`Helpers/selectors.test.ts`** — 15 tests covering the full matrix: primitive selectors, memoization via `distinctUntilChanged`, `shareReplay(1)` for late subscribers, tuple destructuring still working, selector composition, combined state inference, inherited selectors, and deep nesting through multiple `combine()` levels.

---

## Backwards compatibility vs `feature/v3-upgrade`

**`core` — `Reactable.ts` & `index.ts`**
Pure additions: new types (`SelectFromDefs`, `RxBuilderResult`, `ReactableWithSelect`, etc.) and new exports. Nothing removed or changed. ✅

**`core` — `RxBuilder.ts`**
Return type changed from `Reactable<...>` → `RxBuilderResult<...>`.
`RxBuilderResult = Reactable<...> & { selectors(...) }` — it's a strict supertype that adds a method. Existing destructuring `const [state$, actions, actions$] = RxBuilder(...)` and any code typed against `Reactable<...>` still works. The `.selectors()` method on the array object is invisible to existing callers. ✅

**`core` — `combine.ts`**
Same story — return type gains `.selectors()`. Tuple destructuring and `Reactable<...>` typings unaffected. ✅

**`forms` — `RxForm.ts`**
Same as RxBuilder — `createReactable` now returns `RxBuilderResult<...>`. Added `formDestroy$` subject only for teardown inside the new `.selectors()` path; the existing `destroy()` action already called `hub1Actions.destroy()` / `hub2Actions.destroy()`, and the new `formDestroy$.complete()` is a no-op for callers who never use selectors. ✅

**`react` — `useReactable.ts`**
- `HookedReactable<T>` when `T`'s factory has no `.select` → intersects with `unknown`, which is a no-op. Resolves to the exact same tuple type as before. ✅
- Added `F` type parameter with a default — existing call sites work identically; `F` is inferred as the factory type, and for plain `Reactable`-returning factories the result type is unchanged. ✅
- At runtime: `hookedSelect.current` is only set if `(rx.current as any).select` exists. Factories from `feature/v3` never set `.select`, so the `if` branch is never entered and the returned tuple is bit-for-bit identical. ✅

**Summary**: Every change is additive — new types, new exports, new optional methods on existing return values. No existing type signatures were narrowed, no runtime behaviour was changed for code that doesn't call `.selectors()`. Both compile-time and runtime compatibility are preserved across all packages.
