import { Observable, of, concat } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Action, Effect } from '@reactables/core';
import { map, switchMap } from 'rxjs/operators';
import { BaseControl } from '../Models/Controls';
import { ControlAsyncValidationResponse } from '../Models/Payloads';
import { RxFormProviders } from '../RxForm/RxForm';
import { ControlRef } from '../Models';

type ControlScopedEffect<T> = Effect<BaseControl<T>, ControlAsyncValidationResponse | ControlRef>;

export const getScopedEffectsForControl = <T>(
  formControl: BaseControl<T>,
  providers: RxFormProviders,
): ControlScopedEffect<T>[] => {
  const { config, key, controlRef } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: ControlScopedEffect<T>[] = [];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce(
      (acc: ControlScopedEffect<T>[], asyncValidator, validatorIndex) => {
        const effect: ControlScopedEffect<T> = (actions$: Observable<Action<BaseControl<T>>>) => {
          if (!providers.asyncValidators[asyncValidator]) {
            throw `You have not provided an asyncValidator for "${asyncValidator}"`;
          }
          return actions$.pipe(
            map(({ payload: control }) => control),
            providers.asyncValidators[asyncValidator],
            switchMap((errors$) => {
              return concat(
                of({ type: 'asyncValidation', payload: controlRef }),
                errors$.pipe(
                  map((errors) => ({
                    type: 'asyncValidationResponse',
                    payload: {
                      key,
                      errors,
                      validatorIndex,
                    },
                  })),
                  catchError(() =>
                    of({
                      type: 'asyncValidationResponse',
                      payload: {
                        key,
                        errors: { asyncValidationApiError: true },
                        validatorIndex,
                      },
                    }),
                  ),
                ),
              );
            }),
          );
        };

        return acc.concat(effect);
      },
      [],
    );
  }
  return scopedEffects;
};

export const getAsyncValidationEffects = (formControls: BaseControl<unknown>[]) =>
  formControls.reduce((acc: Action<BaseControl<unknown>>[], control) => {
    if (!control.config.asyncValidators?.length) return acc;

    const action = { type: 'asyncValidationEffect', payload: control };

    return acc.concat(action);
  }, []);
