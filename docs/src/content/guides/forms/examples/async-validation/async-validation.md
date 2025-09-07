## Async Validation

`FormControl`s have a `pending: boolean` state when their value changes and are awaiting the result from asynchronous validation.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/forms/examples/async-validation/async-validation.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```typescript
import { control, build, group } from '@reactables/forms';
import { of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export const RxFormAsyncValidation = () =>
  build(
    group({
      controls: {
        email: control(['', ['required', 'email'], ['blacklistedEmail']]),
      },
    }),
    {
      providers: {
        asyncValidators: {
          blacklistedEmail: (control$) =>
            control$.pipe(
              map(({ value }) =>
                of({
                  blacklistedEmail: value === 'black@listed.com',
                }).pipe(delay(1000))
              )
            ),
        },
      },
    }
  );

```