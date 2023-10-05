import { Observable } from 'rxjs';
import { BaseAbstractControl } from './Controls';
import { FormErrors } from './FormErrors';
export type ValidatorFn = (value: unknown) => FormErrors;

export type ValidatorAsyncFn = <T>(
  control$: Observable<BaseAbstractControl<T>>,
) => Observable<FormErrors>;
