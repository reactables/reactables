import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action, Effect } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { ControlAsyncValidationResponse } from '../Models/Payloads';

const getScopedEffectsForControl = <T>(
  formControl: AbstractControl<T>,
): Effect<AbstractControl<T>, ControlAsyncValidationResponse>[] => {
  const { config, controlRef } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<
    AbstractControl<T>,
    ControlAsyncValidationResponse
  >[] = [];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce(
      (
        acc: Effect<AbstractControl<T>, ControlAsyncValidationResponse>[],
        validator,
        validatorIndex,
      ) => {
        const effect: Effect<
          AbstractControl<T>,
          ControlAsyncValidationResponse
        > = (actions$: Observable<Action<AbstractControl<T>>>) => {
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

export const FORMS_VALUE_CHANGE_EFFECT = 'FORMS_ARRAY_VALUE_CHANGE_EFFECT';

export const getValueChangeEffects = (
  formControls: AbstractControl<unknown>[],
) =>
  formControls.reduce((acc: Action<AbstractControl<unknown>>[], control) => {
    const { controlRef } = control;

    const effects = getScopedEffectsForControl(control);
    if (!effects.length) return acc;

    return acc.concat({
      type: FORMS_VALUE_CHANGE_EFFECT,
      payload: control,
      scopedEffects: {
        key: controlRef.join(':'),
        effects,
      },
    });
  }, []);
