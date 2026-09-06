import { Task } from '../models/task.model';

type TaskCardStatusIcon = 'warning' | 'check_circle' | 'calendar_month';

interface TaskCardStatus {
  icon: TaskCardStatusIcon;
  label: string;
}

export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'status' | 'isOverdue'>): boolean {
  if (task.status === 'done') {
    return false;
  }

  if (task.isOverdue === true) {
    return true;
  }

  return calendarDayDiff(new Date(task.dueDate), new Date()) > 0;
}

export function taskCategory(task: Pick<Task, 'tags'>): string | undefined {
  return task.tags[0];
}

/** Relative due/completed copy for TaskCard, derived from existing task fields. */
export function taskCardStatus(
  task: Pick<Task, 'status' | 'dueDate' | 'completedAt' | 'updatedAt' | 'isOverdue'>,
  now = new Date(),
): TaskCardStatus {
  if (task.status === 'done') {
    const completedOn = new Date(task.completedAt ?? task.updatedAt);
    const elapsed = Math.max(0, calendarDayDiff(completedOn, now));
    if (elapsed === 0) return { icon: 'check_circle', label: 'Completed today' };
    if (elapsed === 1) return { icon: 'check_circle', label: 'Completed yesterday' };
    return { icon: 'check_circle', label: `Completed ${elapsed} days ago` };
  }

  const dueDiff = calendarDayDiff(new Date(task.dueDate), now);
  if (task.isOverdue === true || dueDiff > 0) {
    const elapsed = Math.max(1, dueDiff);
    return {
      icon: 'warning',
      label: elapsed === 1 ? 'Overdue by 1 day' : `Overdue by ${elapsed} days`,
    };
  }

  const remaining = -dueDiff;
  if (remaining === 0) return { icon: 'calendar_month', label: 'Due today' };
  if (remaining === 1) return { icon: 'calendar_month', label: 'Due tomorrow' };
  return { icon: 'calendar_month', label: `Due in ${remaining} days` };
}

function calendarDayDiff(from: Date, to: Date): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}
