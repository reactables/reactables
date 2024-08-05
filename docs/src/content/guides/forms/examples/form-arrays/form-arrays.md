## Form Arrays 
<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/forms/examples/form-arrays/form-arrays.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

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