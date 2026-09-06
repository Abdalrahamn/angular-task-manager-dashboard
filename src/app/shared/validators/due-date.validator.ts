import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface DueDateValidatorOptions {
  /** When true, past dates stay valid so an already-overdue task can be edited and saved. */
  allowPast?: boolean;
}

export function parseLocalDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const copy = new Date(value);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setHours(0, 0, 0, 0);
  return date;
}

export function dueDateValidator(options: DueDateValidatorOptions = {}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || control.value === '') {
      return null;
    }

    const date = parseLocalDate(control.value);
    if (!date) {
      return { dueDate: 'invalid' };
    }

    if (!options.allowPast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return { dueDate: 'past' };
      }
    }

    return null;
  };
}
