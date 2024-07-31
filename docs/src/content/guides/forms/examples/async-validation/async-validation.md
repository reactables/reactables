## Async Validation

`FormControl`s have a `pending: boolean` state when their value changes and are awaiting the result from asynchronous validation.

```typescript
import { control, build, group } from '@reactables/forms';
import { of } from 'rxjs';
import { switchMap, delay } from 'rxjs/operators';

export const RxFormAsyncValidation = () => build(
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
            switchMap(({ value }) =>
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