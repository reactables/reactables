import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action, Effect } from '@hub-fx/core';
import { BaseControl } from '../../Models/Controls';
import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { ControlAsyncValidationResponse } from '../../Models/Payloads';

const getScopedEffectsForControl = <T>(
  formControl: BaseControl<T>,
): Effect<BaseControl<T>, ControlAsyncValidationResponse>[] => {
  const { config, key } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<BaseControl<T>, ControlAsyncValidationResponse>[] =
    [];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce(
      (
        acc: Effect<BaseControl<T>, ControlAsyncValidationResponse>[],
        validator,
        validatorIndex,
      ) => {
        const effect: Effect<BaseControl<T>, ControlAsyncValidationResponse> = (
          actions$: Observable<Action<BaseControl<T>>>,
        ) => {
          return actions$.pipe(
            map(({ payload: control }) => control),
            validator,
            map((errors) =>
              asyncValidationResponseSuccess({
                key,
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
  formControls: BaseControl<unknown>[],
) =>
  formControls.reduce(
    (
      acc: Action<BaseControl<unknown>, ControlAsyncValidationResponse>[],
      control,
    ) => {
      const effects = getScopedEffectsForControl(control);
      if (!effects.length) return acc;

      return acc.concat({
        type: FORMS_ASYNC_VALIDATE_CONTROL,
        payload: control,
        scopedEffects: {
          key: control.key,
          effects,
        },
      });
    },
    [],
  );
