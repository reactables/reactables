import { Observable, of } from 'rxjs';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Action } from '@hub-fx/core';
import { getControlBranch } from './getControlBranch';
import { getAncestorControls } from './getAncestorControls';
import { getControl } from './getControl';
import { BaseForm, BaseControl } from '../Models/Controls';
import { Reducer } from '@hub-fx/core';
import { ControlRef } from '../Models/ControlRef';
import { HubFactory } from '@hub-fx/core';
import { formChange } from '../Actions/Hub2/formChange';
import { getAsyncValidationActions } from '../Actions/Hub2/valueChange';

import { FORMS_CONTROL_CHANGE } from '../Actions/Hub1/controlChange';
import { FORMS_ADD_CONTROL } from '../Actions/Hub1/addControl';
import { FORMS_RESET_CONTROL } from '../Actions/Hub1/resetControl';
import { FORMS_REMOVE_CONTROL } from '../Actions/Hub1/removeControl';

import { ControlChange } from '../Models/Payloads';
import { AddControl } from '../Models/Payloads';

export const buildHub2Source = <T extends BaseForm<unknown>>(
  reducer: Reducer<T>,
  hub = HubFactory(),
): Observable<Action<T>> => {
  const { messages$ } = hub;

  const store$ = hub.store({ reducer }).pipe(map((form) => formChange(form)));

  const sourceForHub2$ = store$.pipe(
    withLatestFrom(messages$),
    mergeMap(([formChangeAction, action]) => {
      const newForm = formChangeAction.payload;

      let controlsToCheck: BaseControl<unknown>[];

      switch (action?.type) {
        case FORMS_CONTROL_CHANGE:
          controlsToCheck = getControlBranch(
            (<Action<ControlChange<unknown>>>action).payload.controlRef,
            newForm,
          );
          break;
        case FORMS_ADD_CONTROL:
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
        case FORMS_REMOVE_CONTROL:
          controlsToCheck = getAncestorControls(
            (<Action<ControlRef>>action).payload.slice(0, -1),
            newForm,
          );
          break;
        case FORMS_RESET_CONTROL:
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
