import { Task, TaskStatus } from './task.model';

export interface TaskColumns {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
}

export interface TaskDropEvent {
  task: Task;
  previousIndex: number;
  currentIndex: number;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
}
