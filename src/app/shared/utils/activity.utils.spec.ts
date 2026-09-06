import { activityDescription } from './activity.utils';

describe('activityDescription', () => {
  it('should describe each activity action', () => {
    expect(activityDescription({ action: 'create', title: 'A' })).toContain('Created');
    expect(activityDescription({ action: 'edit', title: 'A' })).toContain('Updated');
    expect(activityDescription({ action: 'delete', title: 'A' })).toContain('Deleted');
    expect(activityDescription({ action: 'complete', title: 'A' })).toContain('Completed');
    expect(activityDescription({ action: 'status_change', title: 'A' })).toContain('Moved');
  });
});
