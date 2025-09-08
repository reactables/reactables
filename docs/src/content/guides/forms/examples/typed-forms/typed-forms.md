### Typed Forms <a name="typed-forms"></a>

You can pass explicit type parameters when calling `build` to get stronger type inference for both your form state and your custom reducers. This ensures that `state$`, `actions`, and `actions$` are all fully typed, reducing mistakes when using the form reactable.

#### Example 

[✏️ Edit this snippet](https://github.com/reactables/reactables/edit/main/docs/src/content/guides/forms/examples/typed-forms/typed-forms.md)
 

```typescript
// Define the form's value type
type FormValue = {
  name: string;
};

// Define a custom reducer
const customReducers = {
  set: (
    { updateValues }: FormReducers,
    state: BaseFormState<FormValue>,
    action: Action<string>
  ) =>
    updateValues(state, {
      controlRef: ['name'],
      value: action.payload,
    }),
};

// Build the form with type parameters and custom reducers
const [state$, actions, actions$] = build<FormValue, typeof customReducers>(
  group({
    controls: {
      name: control(['']),
    },
  }),
  { reducers: customReducers }
);

// ✅ Typed:
// - state$: Observable<Form<FormValue>>
// - actions: { set: (payload: string) => void } & RxFormActions
// - actions$: typed stream with constants for RxFormActions & customReducers
```
