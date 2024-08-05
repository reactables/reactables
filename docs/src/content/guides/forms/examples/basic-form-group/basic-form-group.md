## Basic Form Group <a name="basic-form-group"></a>
<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/forms/examples/basic-form-group/basic-form-group.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

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