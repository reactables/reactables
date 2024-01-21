import { Observable } from 'rxjs';
import { Action, Effect } from '@reactables/core';
import { map } from 'rxjs/operators';
import { BaseControl } from '../Models/Controls';
import { ControlAsyncValidationResponse } from '../Models/Payloads';
import { RxFormProviders } from '../RxForm/RxForm';

export const getScopedEffectsForControl = <T>(
  formControl: BaseControl<T>,
  providers: RxFormProviders,
): Effect<BaseControl<T>, ControlAsyncValidationResponse>[] => {
  const { config, key } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<BaseControl<T>, ControlAsyncValidationResponse>[] = [];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce(
      (
        acc: Effect<BaseControl<T>, ControlAsyncValidationResponse>[],
        asyncValidator,
        validatorIndex,
      ) => {
        const effect: Effect<BaseControl<T>, ControlAsyncValidationResponse> = (
          actions$: Observable<Action<BaseControl<T>>>,
        ) => {
          if (!providers.asyncValidators[asyncValidator]) {
            throw `You have not provided an asyncValidator for "${asyncValidator}"`;
          }
          return actions$.pipe(
            map(({ payload: control }) => control),
            providers.asyncValidators[asyncValidator],
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
    if (!control.config.asyncValidators?.length) return acc;

    const action = { type: 'asyncValidation', payload: control };

    return acc.concat(action);
  }, []);
