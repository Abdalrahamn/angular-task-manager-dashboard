import { TaskPriority, TaskStatus } from './task.model';
import { Assignee } from './user.model';

export interface AnalyticsSeries {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
  overdueRate: number;
  byAssignee: AssigneeWorkload[];
}

export interface AssigneeWorkload {
  assignee: Assignee;
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}
