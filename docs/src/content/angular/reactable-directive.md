# Reactable Directive

RxJS observables are already integrated with Angular and developers can easily subscribe to a reactable's state observable via the `subscribe` method or with Angular's `async` pipe.

Alternatively, we can create a [structural directive](https://angular.dev/guide/directives/structural-directives) that subscribes to a reactable's state observable and makes the state and action methods easily accessible in the template.

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

## Example Usage

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import { RxToggle } from './RxToggle';
import { ReactableDirective } from './reactable.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactableDirective],
  template: `
    <div *reactable="rxToggle; let state = state; let actions = actions;">
      <h1>Angular Reactable Toggle: {{ state ? 'on' : 'off' }}</h1>
      <button (click)="actions.toggleOn()">Toggle On </button>
      <button (click)="actions.toggleOff()">Toggle Off </button>
      <button (click)="actions.toggle()">Toggle </button>
    </div>

  `,
})
export class App {
  rxToggle = RxToggle();
}

bootstrapApplication(App);

```
