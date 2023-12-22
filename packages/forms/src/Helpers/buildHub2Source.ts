import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Action, Reactable } from '@reactables/core';
import { BaseFormState } from '../Models/Controls';
import { getAsyncValidationActions } from './addAsyncValidationEffects';

export const buildHub2Source = <T, S>(
  rx: Reactable<BaseFormState<T>, S>,
): Observable<Action<T>> => {
  const hub1StateMapped$ = rx.state$.pipe(map((payload) => ({ type: 'formChange', payload })));

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
