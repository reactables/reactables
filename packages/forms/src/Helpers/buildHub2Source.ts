import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Action } from '@reactables/core';
import { BaseFormState } from '../Models/Controls';
import { getAsyncValidationActions } from './addAsyncValidationEffects';

export const buildHub2Source = <T>(
  hub1State$: Observable<BaseFormState<T>>,
): Observable<Action<T>> => {
  const hub1StateMapped$ = hub1State$.pipe(map((payload) => ({ type: 'formChange', payload })));

  const sourceForHub2$ = hub1StateMapped$.pipe(
    mergeMap((formChangeAction) => {
      const {
        payload: { changedControls },
      } = formChangeAction;

      const controlsToCheck = changedControls ? Object.values(changedControls) : [];
      const asyncValidationActions = getAsyncValidationActions(controlsToCheck);

      return of(formChangeAction, ...asyncValidationActions);
    }),
  );

  return sourceForHub2$ as Observable<Action<T>>;
};
