## Form Arrays 

```typescript
import { build, group, control, array } from '@reactables/forms';

export const userConfig = group({
  controls: {
    name: control(['', 'required']),
    email: control(['', ['required', 'email']]),
  },
});

export const RxFormArray = () => build(
  group({
    controls: {
      contacts: array({
        controls: [userConfig],
      }),
    },
  })
);

```