import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Action, Reactable } from '@hub-fx/core';
import { getControlBranch } from './getControlBranch';
import { getAncestorControls } from './getAncestorControls';
import { getControl } from './getControl';
import { BaseForm, BaseControl, BaseFormState } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getAsyncValidationActions } from './addAsyncValidationEffects';
import { ControlChange } from '../Models/Payloads';
import { AddControl } from '../Models/Payloads';

export const buildHub2Source = <T, S>(
  rx: Reactable<BaseFormState<T>, S>,
): Observable<Action<T>> => {
  const hub1StateMapped$ = rx.state$.pipe(map((payload) => ({ type: 'formChange', payload })));

  const sourceForHub2$ = hub1StateMapped$.pipe(
    mergeMap((formChangeAction) => {
      const {
        payload: { form, action },
      } = formChangeAction;
      const newForm = form as BaseForm<unknown>;

      let controlsToCheck: BaseControl<unknown>[];

      switch (action?.type) {
        case 'updateValues':
          controlsToCheck = getControlBranch(
            (<Action<ControlChange<unknown>>>action).payload.controlRef,
            newForm,
          );
          break;
        case 'addControl':
          const changedControl = getControl(
            (<Action<AddControl>>action).payload.controlRef,
            newForm,
          );

          if (Array.isArray(changedControl.config.controls)) {
            const index = (changedControl.value as Array<unknown>).length - 1;
            const ref = (<Action<AddControl>>action).payload.controlRef.concat(index);
            controlsToCheck = getControlBranch(ref, newForm);
            break;
          } else {
            controlsToCheck = getControlBranch(
              (<Action<ControlChange<unknown> | AddControl>>action).payload.controlRef,
              newForm,
            );
            break;
          }
        case 'removeControl':
          controlsToCheck = getAncestorControls(
            (<Action<ControlRef>>action).payload.slice(0, -1),
            newForm,
          );
          break;
        case 'resetControl':
          controlsToCheck = getControlBranch((<Action<ControlRef>>action).payload, newForm);
          break;
        default:
          controlsToCheck = [];
      }

      const asyncValidationActions = getAsyncValidationActions(controlsToCheck);

      return of(formChangeAction, ...asyncValidationActions);
    }),
  );

  return sourceForHub2$ as Observable<Action<T>>;
};
