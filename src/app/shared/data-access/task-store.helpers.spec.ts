import { Task } from '../models/task.model';
import {
  applyStatusOverrides,
  buildAnalytics,
  buildCurrentStatistics,
  collectAssignees,
  emptyTaskColumns,
  filterTasks,
  groupTasks,
  mergeTaskOrder,
  seedActivityItems,
  taskOrderFromColumns,
} from './task-store.helpers';

const jane = {
  id: 'user-001',
  name: 'Jane Doe',
  avatar: 'JD',
  email: 'jane@company.com',
};

const john = {
  id: 'user-002',
  name: 'John Smith',
  avatar: 'JS',
  email: 'john@company.com',
};

const todo: Task = {
  id: 'task-001',
  title: 'Design homepage',
  description: 'Create mockups',
  status: 'todo',
  priority: 'high',
  dueDate: '2020-01-01',
  assignee: jane,
  tags: ['Design'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const inProgress: Task = {
  ...todo,
  id: 'task-002',
  title: 'Build API',
  description: 'Implement endpoints',
  status: 'in_progress',
  priority: 'medium',
  dueDate: '2099-01-01',
  assignee: john,
  updatedAt: '2026-01-02T00:00:00.000Z',
};

const done: Task = {
  ...todo,
  id: 'task-003',
  title: 'Ship release',
  description: 'Deploy the build',
  status: 'done',
  priority: 'low',
  assignee: john,
  completedAt: '2026-01-03T00:00:00.000Z',
  updatedAt: '2026-01-03T00:00:00.000Z',
};

describe('task store helpers', () => {
  it('filters tasks by each supported criterion', () => {
    const tasks = [todo, inProgress, done];
    const defaults = { search: '', status: 'all' as const, priority: null, assigneeId: null };

    expect(filterTasks(tasks, defaults)).toEqual(tasks);
    expect(filterTasks(tasks, { ...defaults, search: 'HOMEPAGE' })).toEqual([todo]);
    expect(filterTasks(tasks, { ...defaults, search: 'endpoints' })).toEqual([inProgress]);
    expect(filterTasks(tasks, { ...defaults, status: 'done' })).toEqual([done]);
    expect(filterTasks(tasks, { ...defaults, priority: 'medium' })).toEqual([inProgress]);
    expect(filterTasks(tasks, { ...defaults, assigneeId: jane.id })).toEqual([todo]);
  });

  it('collects unique assignees in task order', () => {
    expect(collectAssignees([todo, inProgress, done])).toEqual([jane, john]);
  });

  it('groups by effective status and applies known board ranks first', () => {
    const columns = groupTasks([todo, inProgress, done], { 'task-001': 'done' }, ['task-003']);
    const unranked = groupTasks([todo, { ...todo, id: 'task-unranked' }], {}, []);

    expect(columns.todo).toEqual([]);
    expect(columns.in_progress).toEqual([inProgress]);
    expect(columns.done.map((task) => task.id)).toEqual(['task-003', 'task-001']);
    expect(columns.done[1]).toEqual({ ...todo, status: 'done' });
    expect(unranked.todo.map((task) => task.id)).toEqual(['task-001', 'task-unranked']);
  });

  it('applies status overrides without cloning unchanged tasks', () => {
    const tasks = applyStatusOverrides([todo, done], { 'task-001': 'in_progress' });

    expect(tasks[0]).toEqual({ ...todo, status: 'in_progress' });
    expect(tasks[1]).toBe(done);
  });

  it('builds current statistics and analytics', () => {
    const tasks = [todo, inProgress, done];

    expect(
      buildCurrentStatistics(tasks, new Date('2026-01-03T12:00:00')).map(({ value }) => value),
    ).toEqual([3, 1, 1, 1]);
    expect(buildAnalytics(tasks)).toEqual({
      byStatus: { todo: 1, in_progress: 1, done: 1 },
      byPriority: { low: 1, medium: 1, high: 1 },
      total: 3,
      completed: 1,
      overdue: 1,
      completionRate: 1 / 3,
      overdueRate: 1 / 3,
      byAssignee: [
        { assignee: jane, total: 1, todo: 1, inProgress: 0, done: 0 },
        { assignee: john, total: 2, todo: 0, inProgress: 1, done: 1 },
      ],
    });
    expect(buildAnalytics([]).completionRate).toBe(0);
    expect(buildAnalytics([]).overdueRate).toBe(0);
  });

  it('derives change text from task dates instead of fixed statistics', () => {
    const today = new Date('2026-01-07T12:00:00');
    const statistics = buildCurrentStatistics(
      [
        { ...todo, createdAt: '2026-01-05T10:00:00' },
        {
          ...inProgress,
          createdAt: '2025-12-01T10:00:00',
          updatedAt: '2026-01-07T09:00:00',
        },
        { ...done, completedAt: '2026-01-07T08:00:00' },
        { ...todo, id: 'new-overdue', dueDate: '2026-01-06' },
      ],
      today,
    );

    expect(statistics[0]).toMatchObject({
      value: 4,
      change: '+1',
      changeLabel: 'this week',
      changeType: 'positive',
    });
    expect(statistics[1]).toMatchObject({ change: '+1', changeLabel: 'today' });
    expect(statistics[2]).toMatchObject({
      value: 1,
      change: '+1',
      changeLabel: 'today',
      changeType: 'positive',
    });
    expect(statistics[3]).toMatchObject({ change: '+1', changeLabel: 'today' });
  });

  it('shows the neutral progress copy when no in-progress task changed today', () => {
    const statistics = buildCurrentStatistics([inProgress], new Date('2026-01-07T12:00:00'));

    expect(statistics[2]).toMatchObject({
      change: '',
      changeLabel: 'Same as yesterday',
      changeType: 'neutral',
    });
    expect(statistics[3]).toMatchObject({ change: '+0', changeLabel: 'today' });
  });

  it('merges and flattens board order', () => {
    expect(mergeTaskOrder(['removed', 'task-002'], [todo, inProgress])).toEqual([
      'task-002',
      'task-001',
    ]);
    expect(taskOrderFromColumns({ todo: [todo], in_progress: [inProgress], done: [done] })).toEqual(
      ['task-001', 'task-002', 'task-003'],
    );
    expect(emptyTaskColumns()).toEqual({ todo: [], in_progress: [], done: [] });
  });

  it('seeds at most eight newest activity items with completion timestamps', () => {
    const completedWithoutStatus: Task = {
      ...todo,
      id: 'task-004',
      completedAt: '2026-01-04T00:00:00.000Z',
      updatedAt: '2026-01-04T00:00:00.000Z',
    };
    const olderTasks = Array.from({ length: 6 }, (_, index) => ({
      ...todo,
      id: `old-${index}`,
      updatedAt: `2025-01-0${index + 1}T00:00:00.000Z`,
    }));
    const activity = seedActivityItems([
      todo,
      inProgress,
      done,
      completedWithoutStatus,
      ...olderTasks,
    ]);

    expect(activity).toHaveLength(8);
    expect(activity[0]).toMatchObject({
      id: 'seed-task-004',
      action: 'complete',
      at: completedWithoutStatus.completedAt,
    });
    expect(activity.find((item) => item.taskId === done.id)?.action).toBe('complete');
    expect(activity.find((item) => item.taskId === inProgress.id)).toMatchObject({
      action: 'edit',
      at: inProgress.updatedAt,
    });
  });
});
