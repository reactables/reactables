# Angular Binding
```typescript
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
} from '@angular/core';
import { Reactable, ActionMap } from '@reactables/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[reactable]',
  standalone: true,
})
export class ReactableDirective<T, S extends ActionMap> implements OnDestroy {
  private $destroy = new Subject();
  state: unknown | null = null;
  actions: ActionMap | null = null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set reactable(reactable: Reactable<T, S>) {
    const [state$, actions] = reactable;

    state$.pipe(takeUntil(this.$destroy)).subscribe((state) => {
      this.state = state;
    });

    this.actions = actions;
    this.viewContainer.createEmbeddedView(this.templateRef, this);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.complete();
  }
}
```