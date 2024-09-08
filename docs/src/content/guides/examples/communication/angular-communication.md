<a href="https://stackblitz.com/edit/stackblitz-starters-bx1wgt?file=src%2Fmain.ts" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxToggleCounter } from './RxToggleCounter';

// See Reactable Directive
// at https://reactables.github.io/angular/reactable-directive
import { ReactableDirective } from './reactable.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactableDirective],
  template: `
    <div *reactable="rxToggleCounter; let state = state; let actions = actions;">
        <h1>Angular Reactable Toggle</h1>
        <h2>Toggle is {{ state.toggle ? 'on' : 'off' }}</h2>
        <button (click)="actions.toggle.toggleOn()">Turn On </button>
        <button (click)="actions.toggle.toggleOff()">Turn Off </button>
        <button (click)="actions.toggle.toggle()">Toggle </button>
        <br>
        <br>  
        <h2>Toggle Button Count: {{ state.counter.count }}</h2>
        <br>
        <button (click)="actions.resetCounter()">Reset Counter </button>
    </div>

  `,
})
export class App {
  rxToggleCounter = RxToggleCounter();
}
```