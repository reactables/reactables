## Custom Reducers

You can declare [`CustomReducer`s](/references/forms-api#api-custom-reducers) during form initialization to implement custom behaviour.

Below the form reactable will have a `doubleOrder` action method which can be called to double the order amount.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/forms/examples/custom-reducers/custom-reducers.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

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

        state = updateValues(state, { controlRef: ['donuts'], value });

  /**
   * You can perform any number of operations imperatively
   * with formReducers i.e addControl, removeControl etc...
   * until you get your desired result,
   * and then return the new state.
   **/

        return state;
      };,
    },
  }
);

```

**IMPORTANT**: When updating the form with custom reducers, it must be done **imperatively** with the provided [`FormReducers`](/references/forms-api#api-form-reducers). This will propagate the change appropriately to all ancestor and descendant controls - maintaining the integrity of the state tree.
