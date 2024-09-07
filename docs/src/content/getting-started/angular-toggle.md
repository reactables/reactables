<a href="https://stackblitz.com/edit/stackblitz-starters-iqgx6u?file=src%2Fmain.ts" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

```