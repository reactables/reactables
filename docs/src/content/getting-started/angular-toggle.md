<a href="https://stackblitz.com/edit/stackblitz-starters-iqgx6u?file=src%2Fmain.ts" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { RxToggle } from './RxToggle';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>Angular Reactable Toggle {{ (state$ | async) ? 'on' : 'off' }}</h1>
      <button (click)="actions.toggleOn()">Toggle On </button>
      <button (click)="actions.toggleOff()">Toggle Off </button>
      <button (click)="actions.toggle()">Toggle </button>
    </div>

  `,
})
export class App {
  rxToggle = RxToggle();
  state$ = this.rxToggle[0];
  actions = this.rxToggle[1];
}
```