import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Injectable, signal } from '@angular/core';
import { TaskColumns, TaskDropEvent } from '../models/kanban.model';
import { Task } from '../models/task.model';
import {
  applyStatusOverrides,
  emptyTaskColumns,
  groupTasks,
  mergeTaskOrder,
  taskOrderFromColumns,
  TaskStatusOverrides,
} from './task-store.helpers';

export type TaskDropResult = 'ignored' | 'reordered' | 'status-change';

@Injectable({ providedIn: 'root' })
export class TaskBoardStore {
  private readonly statusOverrides = signal<TaskStatusOverrides>({});
  private readonly taskOrder = signal<string[]>([]);

  group(tasks: Task[]): TaskColumns {
    return groupTasks(tasks, this.statusOverrides(), this.taskOrder());
  }

  applyOverrides(tasks: Task[]): Task[] {
    return applyStatusOverrides(tasks, this.statusOverrides());
  }

  sync(tasks: Task[]): void {
    this.taskOrder.update((order) => mergeTaskOrder(order, tasks));
  }

  drop(
    event: TaskDropEvent,
    currentColumns: TaskColumns,
    blockStatusChange: boolean,
  ): TaskDropResult {
    const columns = this.copyColumns(currentColumns);
    const fromList = columns[event.fromStatus];
    const previousIndex = fromList.findIndex((task) => task.id === event.task.id);
    if (previousIndex < 0) {
      return 'ignored';
    }

    if (event.fromStatus === event.toStatus) {
      moveItemInArray(fromList, previousIndex, event.currentIndex);
      this.applyOrder(columns);
      return 'reordered';
    }

    if (blockStatusChange) {
      return 'ignored';
    }

    transferArrayItem(fromList, columns[event.toStatus], previousIndex, event.currentIndex);
    this.applyOrder(columns);
    this.statusOverrides.update((current) => ({
      ...current,
      [event.task.id]: event.toStatus,
    }));
    return 'status-change';
  }

  confirmStatus(taskId: string): void {
    this.clearStatusOverride(taskId);
  }

  rollbackStatus(taskId: string, tasks: Task[]): void {
    this.clearStatusOverride(taskId);
    const columns = emptyTaskColumns();
    for (const task of tasks) {
      columns[task.status].push(task);
    }
    this.applyOrder(columns);
  }

  private copyColumns(columns: TaskColumns): TaskColumns {
    return {
      todo: [...columns.todo],
      in_progress: [...columns.in_progress],
      done: [...columns.done],
    };
  }

  private applyOrder(columns: TaskColumns): void {
    this.taskOrder.set(taskOrderFromColumns(columns));
  }

  private clearStatusOverride(taskId: string): void {
    this.statusOverrides.update((current) => {
      const next = { ...current };
      delete next[taskId];
      return next;
    });
  }
}
