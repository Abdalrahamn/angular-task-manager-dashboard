import { FormControl } from '@angular/forms';
import { dueDateValidator, parseLocalDate } from './due-date.validator';

describe('parseLocalDate', () => {
  it('should copy a valid Date to midnight', () => {
    const parsed = parseLocalDate(new Date(2026, 8, 5, 15, 30));
    expect(parsed?.getHours()).toBe(0);
    expect(parsed?.getDate()).toBe(5);
  });

  it('should reject invalid dates and empty strings', () => {
    expect(parseLocalDate(new Date('not-a-date'))).toBeNull();
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate('  ')).toBeNull();
    expect(parseLocalDate(12)).toBeNull();
    expect(parseLocalDate('13-01-2026')).toBeNull();
  });

  it('should parse an ISO date prefix', () => {
    const parsed = parseLocalDate('2026-09-05T12:00:00.000Z');
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(5);
  });
});

describe('dueDateValidator', () => {
  it('should skip empty values', () => {
    expect(dueDateValidator()(new FormControl(''))).toBeNull();
    expect(dueDateValidator()(new FormControl(null))).toBeNull();
  });

  it('should reject unparseable dates', () => {
    expect(dueDateValidator()(new FormControl(new Date('not-a-date')))).toEqual({
      dueDate: 'invalid',
    });
  });

  it('should reject past dates unless allowPast is set', () => {
    expect(dueDateValidator()(new FormControl('2000-01-01'))).toEqual({ dueDate: 'past' });
    expect(dueDateValidator({ allowPast: true })(new FormControl('2000-01-01'))).toBeNull();
  });

  it('should accept today and future dates', () => {
    const today = new Date();
    const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(dueDateValidator()(new FormControl(stamp))).toBeNull();
    expect(dueDateValidator()(new FormControl('2099-12-31'))).toBeNull();
  });
});
