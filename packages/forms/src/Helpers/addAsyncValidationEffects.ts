import { Observable } from 'rxjs';
import { Action, Effect, RxBuilder } from '@hub-fx/core';
import { map } from 'rxjs/operators';
import { BaseControl } from '../Models/Controls';
import { asyncValidationResponseSuccess } from '../Actions/Hub2/asyncValidationResponseSuccess';
import { ControlAsyncValidationResponse } from '../Models/Payloads';
import { hub2Slice } from '../RxForm/hub2Slice';

const getScopedEffectsForControl = <T>(
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

export const getAsyncValidationActions = (formControls: BaseControl<unknown>[]) =>
  formControls.reduce((acc: Action<BaseControl<unknown>>[], control) => {
    const effects = getScopedEffectsForControl(control);
    if (!effects.length) return acc;

    const {
      actions: { asyncValidation },
    } = hub2Slice;

    const asyncValidationWithEffect = RxBuilder.addEffects(asyncValidation, () => ({
      key: control.key,
      effects,
    }));

    const action = asyncValidationWithEffect(control) as Action<BaseControl<unknown>>;

    return acc.concat(action);
  }, []);
