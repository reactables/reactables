import { Observable, of } from 'rxjs';
import { switchMap, delay, debounceTime, mergeMap } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { TEST_ACTION_SUCCESS } from './Actions';

export const switchMapTestEffect = (action$: Observable<Action<string>>) =>
  action$.pipe(
    switchMap((action) =>
      of({
        type: TEST_ACTION_SUCCESS,
        payload: action.payload + ' switchMap succeeded',
      }).pipe(delay(100)),
    ),
  );

export const debounceTestEffect = (action$: Observable<Action<string>>) =>
  action$.pipe(
    debounceTime(60),
    mergeMap((action) =>
      of({
        type: TEST_ACTION_SUCCESS,
        payload: action.payload + ' debounceTime and mergeMap succeeded',
      }).pipe(delay(100)),
    ),
  );
