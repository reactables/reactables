## Validation <a name="validation-example"></a>

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/forms/examples/validation/validation.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

`@reactable/forms` comes with 3 built in validators, `required`, `email` & `arrayNotEmpty`. The developer can implement their own [`ValidatorFn`](/references/forms-api#api-validator-fn)s and provide them when building the reactable.

```typescript
import { control, build, group } from '@reactables/forms';

export const RxFormValidation = () => build(
  group({
    controls: {
      donuts: control(['0', ['required', 'min4']]),
    },
  }),
  {
    providers: {
      validators: {
        min4: (value) => ({ min4: Number(value) < 4 }),
      },
    },
  }
);

```
