import { Injectable, computed, signal } from '@angular/core';
import { StatusTab } from '../models/task-filter.model';
import { TaskPriority } from '../models/task.model';
import { TaskFilters } from './task-store.helpers';

@Injectable({ providedIn: 'root' })
export class TaskFilterStore {
  private readonly searchState = signal('');
  private readonly statusState = signal<StatusTab>('all');
  private readonly priorityState = signal<TaskPriority | null>(null);
  private readonly assigneeIdState = signal<string | null>(null);

  readonly search = this.searchState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly priority = this.priorityState.asReadonly();
  readonly assigneeId = this.assigneeIdState.asReadonly();
  readonly hasActiveFilters = computed(
    () =>
      this.search().trim() !== '' ||
      this.status() !== 'all' ||
      this.priority() !== null ||
      this.assigneeId() !== null,
  );

  snapshot(): TaskFilters {
    return {
      search: this.search(),
      status: this.status(),
      priority: this.priority(),
      assigneeId: this.assigneeId(),
    };
  }

  setSearch(value: string): void {
    this.searchState.set(value);
  }

  setStatus(value: StatusTab): void {
    this.statusState.set(value);
  }

  setPriority(value: TaskPriority | null): void {
    this.priorityState.set(value);
  }

  setAssigneeId(value: string | null): void {
    this.assigneeIdState.set(value);
  }

  clear(): void {
    this.searchState.set('');
    this.statusState.set('all');
    this.priorityState.set(null);
    this.assigneeIdState.set(null);
  }
}
