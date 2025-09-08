## Custom Reducers

You can define custom reducers when initializing a form to add custom behavior.  

In this example, the form reactable gets a `doubleOrder` action that doubles the donut order amount:

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

**IMPORTANT**: Note: Always update the form imperatively using [`FormReducers`](/reactables/references/forms-api#api-form-reducers). This ensures all related controls are updated correctly, preserving the integrity of the state tree.
