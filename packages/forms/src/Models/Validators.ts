import { Observable } from 'rxjs';
import { AbstractControl } from './Controls';
import { FormErrors } from './FormErrors';
export type ValidatorFn = (value: unknown) => FormErrors;

export type ValidatorAsyncFn = <T>(
  control$: Observable<AbstractControl<T>>,
) => Observable<FormErrors>;
