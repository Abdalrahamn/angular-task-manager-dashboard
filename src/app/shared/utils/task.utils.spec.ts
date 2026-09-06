import { isTaskOverdue, taskCardStatus, taskCategory } from './task.utils';

describe('isTaskOverdue', () => {
  it('should not treat done tasks as overdue', () => {
    expect(isTaskOverdue({ status: 'done', dueDate: '2000-01-01', isOverdue: true })).toBe(false);
  });

  it('should honor an explicit overdue flag', () => {
    expect(isTaskOverdue({ status: 'todo', dueDate: '2099-01-01', isOverdue: true })).toBe(true);
  });

  it('should derive overdue from a past due date', () => {
    expect(isTaskOverdue({ status: 'in_progress', dueDate: '2000-01-01' })).toBe(true);
  });

  it('should not mark a future due date overdue', () => {
    expect(isTaskOverdue({ status: 'todo', dueDate: '2099-01-01' })).toBe(false);
  });
});

describe('taskCategory', () => {
  it('should use the first tag', () => {
    expect(taskCategory({ tags: ['Design', 'UI'] })).toBe('Design');
  });

  it('should be undefined without tags', () => {
    expect(taskCategory({ tags: [] })).toBeUndefined();
  });
});

describe('taskCardStatus', () => {
  const now = new Date('2026-09-05T12:00:00');
  const base = {
    status: 'todo' as const,
    dueDate: '2026-09-10',
    updatedAt: '2026-09-05T08:00:00.000Z',
  };

  it('should describe overdue, due, and completed relative states', () => {
    expect(taskCardStatus({ ...base, dueDate: '2026-09-03' }, now)).toEqual({
      icon: 'warning',
      label: 'Overdue by 2 days',
    });
    expect(taskCardStatus({ ...base, dueDate: '2026-09-04' }, now)).toEqual({
      icon: 'warning',
      label: 'Overdue by 1 day',
    });
    expect(taskCardStatus({ ...base, dueDate: '2099-01-01', isOverdue: true }, now)).toEqual({
      icon: 'warning',
      label: 'Overdue by 1 day',
    });
    expect(taskCardStatus({ ...base, dueDate: '2026-09-05' }, now)).toEqual({
      icon: 'calendar_month',
      label: 'Due today',
    });
    expect(taskCardStatus({ ...base, dueDate: '2026-09-06' }, now)).toEqual({
      icon: 'calendar_month',
      label: 'Due tomorrow',
    });
    expect(taskCardStatus(base, now)).toEqual({
      icon: 'calendar_month',
      label: 'Due in 5 days',
    });
    expect(
      taskCardStatus(
        {
          ...base,
          status: 'done',
          completedAt: '2026-09-05T08:00:00.000Z',
        },
        now,
      ),
    ).toEqual({
      icon: 'check_circle',
      label: 'Completed today',
    });
    expect(
      taskCardStatus(
        {
          ...base,
          status: 'done',
          completedAt: '2026-09-04T08:00:00.000Z',
        },
        now,
      ),
    ).toEqual({
      icon: 'check_circle',
      label: 'Completed yesterday',
    });
    expect(
      taskCardStatus(
        {
          ...base,
          status: 'done',
          completedAt: undefined,
          updatedAt: '2026-09-02T08:00:00.000Z',
        },
        now,
      ),
    ).toEqual({
      icon: 'check_circle',
      label: 'Completed 3 days ago',
    });
  });
});
