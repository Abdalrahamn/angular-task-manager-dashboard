import { assigneeHandle } from './user.utils';

describe('assigneeHandle', () => {
  it('should prefix the first name', () => {
    expect(assigneeHandle('Jane Doe')).toBe('@Jane');
  });

  it('should use the whole name when there is no space', () => {
    expect(assigneeHandle('Jane')).toBe('@Jane');
  });

  it('should use an empty handle when the name is blank', () => {
    expect(assigneeHandle('   ')).toBe('@');
  });
});
