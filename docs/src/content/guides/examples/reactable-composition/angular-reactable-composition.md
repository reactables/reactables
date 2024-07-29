<a href="https://stackblitz.com/edit/stackblitz-starters-i2ufm4?file=src%2Fmain.ts" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import {
  RxHotelSearch,
  HotelSearchState,
  HotelSearchActions,
} from './Rx/RxHotelSearch';
import { Reactable } from '@reactables/core';
import HotelService from './hotel-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="rxHotelSearch && rxHotelSearch[0] | async as state">
      <ng-container *ngIf="rxHotelSearch && rxHotelSearch[1] as actions">
        <h1>Hotel Search</h1>
        <button (click)="actions.toggleSmokingAllowed()">Smoking Allowed: {{ state.controls.smokingAllowed ? 'Yes' : 'No'}}</button>
        <button (click)="actions.togglePetsAllowed()">Pets Allowed: {{ state.controls.petsAllowed ? 'Yes' : 'No'}}</button>
        <br />
        <span *ngIf="state.searchResult.loading">Searching...</span>
        <br />
        <span *ngIf="state.searchResult.data">{{ state.searchResult.data }}</span>
      </ng-container>
    </div>

  `,
})
export class App implements OnInit {
  rxHotelSearch: Reactable<HotelSearchState, HotelSearchActions> | null = null;

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.rxHotelSearch = RxHotelSearch({ hotelService: this.hotelService });
  }
}

bootstrapApplication(App);
```