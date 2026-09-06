import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Rejects strings that are only whitespace. Empty values are left to `Validators.required`. */
export const noWhitespaceValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (value == null || value === '') {
    return null;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { noWhitespace: true };
  }

  return null;
};
