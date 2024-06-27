import { Observable, of } from 'rxjs';
import isEqual from 'lodash.isequal';
import { map, mergeMap, pairwise, startWith } from 'rxjs/operators';
import { Action } from '@reactables/core';
import { BaseFormState, BaseControl, BaseForm } from '../Models/Controls';
import { getAsyncValidationActions } from './addAsyncValidationEffects';

export const buildHub2Source = <T>(
  hub1State$: Observable<BaseFormState<T>>,
  initialBaseState: BaseFormState<T>,
): Observable<Action<T>> => {
  const hub1StateMapped$ = hub1State$.pipe(map((payload) => ({ type: 'formChange', payload })));

  const initialAction = { type: 'formChange', payload: initialBaseState };

  const sourceForHub2$ = hub1StateMapped$.pipe(
    startWith(initialAction),
    pairwise(),
    mergeMap(
      ([
        {
          payload: { form: prevForm },
        },
        currAction,
      ]) => {
        const {
          payload: { _changedControls, form: currentForm },
        } = currAction;

        const valueChanged = !isEqual(prevForm.root.value, currentForm.root.value);

        const controlsToCheck =
          _changedControls && valueChanged ? Object.values(_changedControls) : [];

        const asyncValidationActions = getAsyncValidationActions(controlsToCheck);

        return of(currAction, ...asyncValidationActions);
      },
    ),
  );

  return sourceForHub2$ as Observable<Action<T>>;
};
