import { Observable, of } from 'rxjs';
import isEqual from 'lodash.isequal';
import { map, mergeMap, pairwise, startWith } from 'rxjs/operators';
import { Action } from '@reactables/core';
import { BaseFormState } from '../Models/Controls';
import { getAsyncValidationEffects } from './addAsyncValidationEffects';

export const buildHub2Source = (
  hub1State$: Observable<BaseFormState<any>>,
  initialBaseState: BaseFormState<any>,
): Observable<Action<any>> => {
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

        const asyncValidationEffectActions = getAsyncValidationEffects(controlsToCheck);

        return of(currAction, ...asyncValidationEffectActions);
      },
    ),
  );

  return sourceForHub2$ as Observable<Action<any>>;
};
