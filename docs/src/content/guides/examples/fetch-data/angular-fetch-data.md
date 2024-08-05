<a href="https://stackblitz.com/edit/stackblitz-starters-a3nnyc?file=src%2Fmain.ts" target="_blank" rel="noreferrer">
 <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import { RxFetchData, FetchDataReactable } from './RxFetchData';
import DataService from './data-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="rxFetchData && rxFetchData[0] | async as state">
      <ng-container *ngIf="rxFetchData && rxFetchData[1] as actions">
        <h1>Reactable fetching data</h1>
        <span *ngIf="state.data">{{ state.data }}</span>
        <br />
        <button (click)="actions.fetch()">Fetch Data!</button>
        <br />
        <span *ngIf="state.loading">Fetching...</span>
      </ng-container>
    </div>

  `,
})
export class App implements OnInit {
  rxFetchData: FetchDataReactable | null = null;
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.rxFetchData = RxFetchData({ dataService: this.dataService });
  }
}

bootstrapApplication(App);
```