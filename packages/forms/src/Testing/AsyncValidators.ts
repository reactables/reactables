import { of, delay, mergeMap } from 'rxjs';
import { ValidatorAsyncFn } from '../Models/Validators';

export const uniqueEmail: ValidatorAsyncFn = (control$) => {
  return control$.pipe(
    mergeMap(() => of({ uniqueEmail: true }).pipe(delay(250))),
  );
};

export const blacklistedEmail: ValidatorAsyncFn = (control$) => {
  return control$.pipe(
    mergeMap(() => of({ blacklistedEmail: true }).pipe(delay(300))),
  );
};

export const arrayLengthError: ValidatorAsyncFn = (control$) => {
  return control$.pipe(
    mergeMap(() => of({ arrayLengthError: true }).pipe(delay(350))),
  );
};

export const uniqueFirstAndLastName: ValidatorAsyncFn = (control$) => {
  return control$.pipe(
    mergeMap(() => of({ uniqueFirstAndLastName: true }).pipe(delay(400))),
  );
};

export const blacklistedDoctorType: ValidatorAsyncFn = (control$) => {
  return control$.pipe(
    mergeMap(() => of({ blacklistedDoctorType: true }).pipe(delay(500))),
  );
};
