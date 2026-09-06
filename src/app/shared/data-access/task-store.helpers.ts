import { AnalyticsSeries, AssigneeWorkload } from '../models/analytics.model';
import { TaskColumns } from '../models/kanban.model';
import { Statistic } from '../models/statistic.model';
import { StatusTab } from '../models/task-filter.model';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { Assignee } from '../models/user.model';
import { isTaskOverdue } from '../utils/task.utils';

export interface TaskFilters {
  search: string;
  status: StatusTab;
  priority: TaskPriority | null;
  assigneeId: string | null;
}

export type TaskStatusOverrides = Partial<Record<string, TaskStatus>>;

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assigneeId && task.assignee.id !== filters.assigneeId) return false;

    return (
      !query ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  });
}

export function collectAssignees(tasks: Task[]): Assignee[] {
  const assignees = new Map(tasks.map((task) => [task.assignee.id, task.assignee]));
  return [...assignees.values()];
}

export function groupTasks(
  tasks: Task[],
  overrides: TaskStatusOverrides,
  order: string[],
): TaskColumns {
  const columns = emptyTaskColumns();
  const ranks = new Map(order.map((taskId, index) => [taskId, index]));

  for (const task of tasks) {
    const status = overrides[task.id] ?? task.status;
    columns[status].push(status === task.status ? task : { ...task, status });
  }

  const compareByRank = (left: Task, right: Task): number =>
    (ranks.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
    (ranks.get(right.id) ?? Number.MAX_SAFE_INTEGER);
  columns.todo.sort(compareByRank);
  columns.in_progress.sort(compareByRank);
  columns.done.sort(compareByRank);
  return columns;
}

export function applyStatusOverrides(tasks: Task[], overrides: TaskStatusOverrides): Task[] {
  return tasks.map((task) => {
    const status = overrides[task.id];
    return status ? { ...task, status } : task;
  });
}

export function buildCurrentStatistics(
  tasks: Task[],
  statistics: Statistic[],
  now = new Date(),
): Statistic[] {
  const values: Record<Statistic['title'], number> = {
    'Total Tasks': tasks.length,
    Completed: tasks.filter((task) => task.status === 'done').length,
    'In Progress': tasks.filter((task) => task.status === 'in_progress').length,
    Overdue: tasks.filter(isTaskOverdue).length,
  };
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const weekStart = addDays(today, -((today.getDay() + 6) % 7));
  const yesterdayKey = dateKey(addDays(today, -1));
  const changes: Record<Statistic['title'], number> = {
    'Total Tasks': tasks.filter((task) => isWithin(task.createdAt, weekStart, tomorrow)).length,
    Completed: tasks.filter(
      (task) => task.completedAt && isWithin(task.completedAt, today, tomorrow),
    ).length,
    'In Progress': tasks.filter(
      (task) => task.status === 'in_progress' && isWithin(task.updatedAt, today, tomorrow),
    ).length,
    Overdue: tasks.filter((task) => isTaskOverdue(task) && task.dueDate === yesterdayKey).length,
  };

  return statistics.map((statistic) => {
    const change = changes[statistic.title];
    const unchangedProgress = statistic.title === 'In Progress' && change === 0;

    return {
      ...statistic,
      value: values[statistic.title],
      change: unchangedProgress ? '0' : `+${change}`,
      changeLabel: unchangedProgress ? 'Same as yesterday' : statistic.changeLabel,
      changeType: unchangedProgress ? 'neutral' : statistic.changeType,
    };
  });
}

function startOfDay(value: Date): Date {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(value: Date, days: number): Date {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
}

function dateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isWithin(value: string, start: Date, end: Date): boolean {
  const timestamp = Date.parse(value);
  return timestamp >= start.getTime() && timestamp < end.getTime();
}

export function buildAnalytics(tasks: Task[]): AnalyticsSeries {
  const byStatus: AnalyticsSeries['byStatus'] = { todo: 0, in_progress: 0, done: 0 };
  const byPriority: AnalyticsSeries['byPriority'] = { low: 0, medium: 0, high: 0 };
  const workload = new Map<string, AssigneeWorkload>();
  let overdue = 0;

  for (const task of tasks) {
    byStatus[task.status] += 1;
    byPriority[task.priority] += 1;
    overdue += Number(isTaskOverdue(task));
    updateWorkload(workload, task);
  }

  const total = tasks.length;
  const completed = byStatus.done;
  return {
    byStatus,
    byPriority,
    total,
    completed,
    overdue,
    completionRate: total === 0 ? 0 : completed / total,
    overdueRate: total === 0 ? 0 : overdue / total,
    byAssignee: [...workload.values()],
  };
}

export function mergeTaskOrder(order: string[], tasks: Task[]): string[] {
  const taskIds = new Set(tasks.map((task) => task.id));
  const retainedIds = order.filter((taskId) => taskIds.has(taskId));
  const retainedIdSet = new Set(retainedIds);
  const newIds = tasks.filter((task) => !retainedIdSet.has(task.id)).map((task) => task.id);
  return [...retainedIds, ...newIds];
}

export function taskOrderFromColumns(columns: TaskColumns): string[] {
  return [...columns.todo, ...columns.in_progress, ...columns.done].map((task) => task.id);
}

export function emptyTaskColumns(): TaskColumns {
  return { todo: [], in_progress: [], done: [] };
}

function updateWorkload(workload: Map<string, AssigneeWorkload>, task: Task): void {
  const current = workload.get(task.assignee.id) ?? {
    assignee: task.assignee,
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  };
  current.total += 1;
  current.todo += Number(task.status === 'todo');
  current.inProgress += Number(task.status === 'in_progress');
  current.done += Number(task.status === 'done');
  workload.set(task.assignee.id, current);
}
