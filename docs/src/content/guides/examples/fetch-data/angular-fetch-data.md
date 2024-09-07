<a href="https://stackblitz.com/edit/stackblitz-starters-a3nnyc?file=src%2Fmain.ts" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxFetchData, FetchDataReactable } from './RxFetchData';
import DataService from './data-service';
import { ReactableDirective } from './reactable.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactableDirective],
  template: `
    <div *reactable="rxFetchData; let state = state; let actions = actions">
        <h1>Reactable fetching data</h1>
        <span *ngIf="state.data">{{ state.data }}</span>
        <br />
        <button (click)="actions.fetch()">Fetch Data!</button>
        <br />
        <span *ngIf="state.loading">Fetching...</span>
    </div>

  `,
})
export class App implements OnInit {
  rxFetchData!: FetchDataReactable;
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.rxFetchData = RxFetchData({ dataService: this.dataService });
  }
}
```