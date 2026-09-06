import { FormControl } from '@angular/forms';
import { noWhitespaceValidator } from './no-whitespace.validator';

describe('noWhitespaceValidator', () => {
  it('should accept empty values so required can own that error', () => {
    expect(noWhitespaceValidator(new FormControl(''))).toBeNull();
    expect(noWhitespaceValidator(new FormControl(null))).toBeNull();
  });

  it('should reject whitespace-only strings', () => {
    expect(noWhitespaceValidator(new FormControl('   '))).toEqual({ noWhitespace: true });
  });

  it('should accept non-empty trimmed strings and non-strings', () => {
    expect(noWhitespaceValidator(new FormControl(' title '))).toBeNull();
    expect(noWhitespaceValidator(new FormControl(1))).toBeNull();
  });
});
