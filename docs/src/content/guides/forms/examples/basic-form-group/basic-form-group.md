## Basic Form Group <a name="basic-form-group"></a>

```typescript
import { control, build, group } from '@reactables/forms';

export const RxBasicFormGroup = build(
  group({
    controls: {
      name: control(['']),
    },
  })
);

```