import { Observable, of } from 'rxjs';
import isEqual from 'lodash.isequal';
import { map, mergeMap, pairwise } from 'rxjs/operators';
import { Action } from '@reactables/core';
import { BaseFormState, BaseControl, BaseForm } from '../Models/Controls';
import { getAsyncValidationActions } from './addAsyncValidationEffects';

export const buildHub2Source = <T>(
  hub1State$: Observable<BaseFormState<T>>,
): Observable<Action<T>> => {
  const hub1StateMapped$ = hub1State$.pipe(map((payload) => ({ type: 'formChange', payload })));

  const sourceForHub2$ = hub1StateMapped$.pipe(
    pairwise(),
    mergeMap(
      ([
        {
          payload: { form: prevForm },
        },
        currAction,
      ]) => {
        const {
          payload: { _changedControls },
        } = currAction;

        const findControl = (control: BaseControl<unknown>, form: BaseForm<unknown>) => {
          const { controlRef, key } = control;
          if (form[controlRef.join('.')]?.key === key) {
            return form[controlRef.join('.')];
          } else {
            return Object.values(form).find(({ key }) => key === key);
          }
        };

        const controlsToCheck = _changedControls
          ? Object.values(_changedControls).filter((control) => {
              const prevControl = findControl(control, prevForm);

              return !isEqual(prevControl?.value, control.value);
            })
          : [];

        const asyncValidationActions = getAsyncValidationActions(controlsToCheck);

        return of(currAction, ...asyncValidationActions);
      },
    ),
  );

  return sourceForHub2$ as Observable<Action<T>>;
};
