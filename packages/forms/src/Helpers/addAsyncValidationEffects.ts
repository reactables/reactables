import { Observable } from 'rxjs';
import { Action, Effect } from '@reactables/core';
import { map } from 'rxjs/operators';
import { BaseControl } from '../Models/Controls';
import { ControlAsyncValidationResponse } from '../Models/Payloads';

export const getScopedEffectsForControl = <T>(
  formControl: BaseControl<T>,
): Effect<BaseControl<T>, ControlAsyncValidationResponse>[] => {
  const { config, key } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<BaseControl<T>, ControlAsyncValidationResponse>[] = [];

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
            map((errors) => ({
              type: 'asyncValidationResponseSuccess',
              payload: {
                key,
                errors,
                validatorIndex,
              },
            })),
          );
        };

        return acc.concat(effect);
      },
      [],
    );
  }
  return scopedEffects;
};

export const getAsyncValidationActions = (formControls: BaseControl<unknown>[]) =>
  formControls.reduce((acc: Action<BaseControl<unknown>>[], control) => {
    const effects = getScopedEffectsForControl(control);

    if (!effects.length) return acc;

    const action = { type: 'asyncValidation', payload: control };

    return acc.concat(action);
  }, []);
