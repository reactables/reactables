import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action, Effect } from '@hub-fx/core';
import { BaseAbstractControl } from '../../Models/Controls';
import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { ControlAsyncValidationResponse } from '../../Models/Payloads';

const getScopedEffectsForControl = <T>(
  formControl: BaseAbstractControl<T>,
): Effect<BaseAbstractControl<T>, ControlAsyncValidationResponse>[] => {
  const { config, controlRef } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<
    BaseAbstractControl<T>,
    ControlAsyncValidationResponse
  >[] = [];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce(
      (
        acc: Effect<BaseAbstractControl<T>, ControlAsyncValidationResponse>[],
        validator,
        validatorIndex,
      ) => {
        const effect: Effect<
          BaseAbstractControl<T>,
          ControlAsyncValidationResponse
        > = (actions$: Observable<Action<BaseAbstractControl<T>>>) => {
          return actions$.pipe(
            map(({ payload: control }) => control),
            validator,
            map((errors) =>
              asyncValidationResponseSuccess({
                controlRef,
                errors,
                validatorIndex,
              }),
            ),
          );
        };

        return acc.concat(effect);
      },
      [],
    );
  }
  return scopedEffects;
};

export const FORMS_ASYNC_VALIDATE_CONTROL = 'FORMS_ASYNC_VALIDATE_CONTROL';

export const getAsyncValidationActions = (
  formControls: BaseAbstractControl<unknown>[],
) =>
  formControls.reduce(
    (acc: Action<BaseAbstractControl<unknown>>[], control) => {
      const { controlRef } = control;

      const effects = getScopedEffectsForControl(control);
      if (!effects.length) return acc;

      return acc.concat({
        type: FORMS_ASYNC_VALIDATE_CONTROL,
        payload: control,
        scopedEffects: {
          key: controlRef.join(':'),
          effects,
        },
      });
    },
    [],
  );
