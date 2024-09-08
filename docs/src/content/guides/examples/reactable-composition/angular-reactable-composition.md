<a href="https://stackblitz.com/edit/stackblitz-starters-i2ufm4?file=src%2Fmain.ts" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RxHotelSearch,
  HotelSearchState,
  HotelSearchActions,
} from './Rx/RxHotelSearch';
import { Reactable } from '@reactables/core';
import HotelService from './hotel-service';

// See Reactable Directive
// at https://reactables.github.io/angular/reactable-directive
import { ReactableDirective } from './reactable.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactableDirective],
  template: `
    <div *reactable="rxHotelSearch; let state = state; let actions = actions;">
        <h1>Hotel Search</h1>
        <button (click)="actions.toggleSmokingAllowed()">Smoking Allowed: {{ state.controls.smokingAllowed ? 'Yes' : 'No'}}</button>
        <button (click)="actions.togglePetsAllowed()">Pets Allowed: {{ state.controls.petsAllowed ? 'Yes' : 'No'}}</button>
        <br />
        <span *ngIf="state.searchResult.loading">Searching...</span>
        <br />
        <span *ngIf="state.searchResult.data">{{ state.searchResult.data }}</span>
    </div>

  `,
})
export class App implements OnInit {
  rxHotelSearch!: Reactable<HotelSearchState, HotelSearchActions>;

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.rxHotelSearch = RxHotelSearch({ hotelService: this.hotelService });
  }
}
```