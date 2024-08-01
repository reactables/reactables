## Custom Reducers

You can declare [`CustomReducer`s](#api-custom-reducers) during form initialization to implement custom behaviour.

Below the form reactable will have a `doubleOrder` action method which can be called to double the order amount.

```typescript
import { control, build, group } from '@reactables/forms';

export const RxCustomReducers = () => build(
  group({
    controls: {
      donuts: control(['1', 'min4']),
    },
  }),
  {
    providers: {
      validators: {
        min4: (value) => ({ min4: Number(value) < 4 }),
      },
    },
    reducers: {
      doubleOrder:  (formReducers, state) => {
        /** Use built in Form Reducers for updating the form tree. **/
        const { updateValues } = formReducers;

        const orders = Number(state.form.donuts.value);
        const value = (orders * 2).toString();

        return updateValues(state, { controlRef: ['donuts'], value });
      };,
    },
  }
);

```

**IMPORTANT**: When updating the form with custom reducers, it must be done with the provided `FormReducers`. This will propagate the change appropriately to all ancestor and descendant controls - maintaining the integrity of the state tree.
