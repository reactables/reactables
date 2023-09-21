import { Observable, of } from 'rxjs';
import { switchMap, delay, debounceTime, mergeMap } from 'rxjs/operators';
import { Action, TEST_ACTION_SUCCESS } from '@hubfx/core';

export const switchMapEffect = (action$: Observable<Action<string>>) =>
  action$.pipe(
    switchMap((action) =>
      of({
        type: TEST_ACTION_SUCCESS,
        payload: action.payload + ' switchMap succeeded',
      }).pipe(delay(100)),
    ),
  );

export const debounceEffect = (action$: Observable<Action<string>>) =>
  action$.pipe(
    debounceTime(60),
    mergeMap((action) =>
      of({
        type: TEST_ACTION_SUCCESS,
        payload: action.payload + ' debounceTime and mergeMap succeeded',
      }).pipe(delay(100)),
    ),
  );
