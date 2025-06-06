import { Observable } from 'rxjs';
import { BaseControl } from './Controls';
import { FormErrors } from './FormErrors';
export type ValidatorFn = (value: unknown) => FormErrors;

export type ValidatorAsyncFn = <T>(
  control$: Observable<BaseControl<T>>,
) => Observable<Observable<FormErrors>>;
