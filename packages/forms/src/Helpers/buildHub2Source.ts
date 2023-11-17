import { Observable, of } from 'rxjs';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Action, Hub, Reducer } from '@hub-fx/core';
import { getControlBranch } from './getControlBranch';
import { getAncestorControls } from './getAncestorControls';
import { getControl } from './getControl';
import { BaseForm, BaseControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getAsyncValidationActions } from './addAsyncValidationEffects';
import { ControlChange } from '../Models/Payloads';
import { AddControl } from '../Models/Payloads';
import { hub2Slice } from '../RxForm/hub2Slice';

export const buildHub2Source = <T extends BaseForm<unknown>>(
  reducer: Reducer<T>,
  hub: Hub,
): Observable<Action<T>> => {
  const { messages$ } = hub;

  const {
    actions: { formChange },
  } = hub2Slice;

  const hub1StateMapped$ = hub.store({ reducer }).pipe(map((form) => formChange(form)));

  const sourceForHub2$ = hub1StateMapped$.pipe(
    withLatestFrom(messages$),
    mergeMap(([formChangeAction, action]) => {
      const newForm = formChangeAction.payload as BaseForm<unknown>;

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
