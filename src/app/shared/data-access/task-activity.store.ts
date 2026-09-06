import { Injectable, signal } from '@angular/core';
import { ActivityAction, ActivityItem } from '../models/activity.model';
import { Task } from '../models/task.model';
import { seedActivityItems } from './task-store.helpers';

@Injectable({ providedIn: 'root' })
export class TaskActivityStore {
  private readonly itemsState = signal<ActivityItem[]>([]);
  private seeded = false;

  readonly items = this.itemsState.asReadonly();

  append(action: ActivityAction, task: Pick<Task, 'id' | 'title'>): void {
    const item: ActivityItem = {
      id: globalThis.crypto?.randomUUID?.() ?? `activity-${Date.now()}`,
      action,
      taskId: task.id,
      title: task.title,
      at: new Date().toISOString(),
    };
    this.itemsState.update((items) => [item, ...items]);
  }

  seed(tasks: Task[], loading: boolean, error: unknown): void {
    if (this.seeded || loading || error || tasks.length === 0) {
      return;
    }

    this.seeded = true;
    if (this.itemsState().length === 0) {
      this.itemsState.set(seedActivityItems(tasks));
    }
  }
}
