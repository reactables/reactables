import { of } from 'rxjs';
import { mergeMap, delay, debounceTime } from 'rxjs/operators';
import { ValidatorAsyncFn } from '@hubfx/forms';
export const blacklistedEmail: ValidatorAsyncFn = (control$) => {
  const blacklisted = ['not@allowed.com'];
  return control$.pipe(
    debounceTime(500),
    mergeMap((control) => {
      return of({
        blacklistedEmail: blacklisted.includes(control.value as string),
      }).pipe(delay(1000));
    }),
  );
};
