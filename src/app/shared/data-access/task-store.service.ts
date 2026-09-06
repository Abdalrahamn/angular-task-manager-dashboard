import { Injectable, computed, effect, inject, untracked } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskDropEvent } from '../models/kanban.model';
import { StatusTab } from '../models/task-filter.model';
import { Task, TaskPriority } from '../models/task.model';
import { TaskBoardStore } from './task-board.store';
import { TaskFilterStore } from './task-filter.store';
import { TaskMutationService } from './task-mutation.service';
import { TaskService } from './task.service';
import {
  buildAnalytics,
  buildCurrentStatistics,
  collectAssignees,
  filterTasks,
} from './task-store.helpers';

/**
 * Stable task-domain façade for components.
 * Focused stores own filters, board state, and mutation lifecycle.
 */
@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly tasksApi = inject(TaskService);
  private readonly filters = inject(TaskFilterStore);
  private readonly board = inject(TaskBoardStore);
  private readonly mutations = inject(TaskMutationService);

  readonly search = this.filters.search;
  readonly statusTab = this.filters.status;
  readonly priority = this.filters.priority;
  readonly assigneeId = this.filters.assigneeId;
  readonly hasActiveFilters = this.filters.hasActiveFilters;
  readonly submitting = this.mutations.submitting;

  readonly tasks = computed(() =>
    this.tasksApi.tasksResource.error() ? [] : this.tasksApi.tasksResource.value(),
  );
  readonly statistics = computed(() =>
    this.tasksApi.statisticsResource.error() ? [] : this.tasksApi.statisticsResource.value(),
  );
  readonly tasksLoading = computed(() => this.tasksApi.tasksResource.isLoading());
  readonly statisticsLoading = computed(() => this.tasksApi.statisticsResource.isLoading());
  readonly tasksError = computed(() => this.tasksApi.tasksResource.error());
  readonly statisticsError = computed(() => this.tasksApi.statisticsResource.error());
  readonly isLoading = computed(() => this.tasksLoading() || this.statisticsLoading());
  readonly uniqueAssignees = computed(() => collectAssignees(this.tasks()));
  readonly filteredTasks = computed(() => filterTasks(this.tasks(), this.filters.snapshot()));
  readonly groupedColumns = computed(() => this.board.group(this.filteredTasks()));
  readonly currentStatistics = computed(() =>
    buildCurrentStatistics(this.board.applyOverrides(this.tasks()), this.statistics()),
  );
  readonly analyticsSeries = computed(() => buildAnalytics(this.tasks()));

  constructor() {
    effect(() => {
      const tasks = this.tasksError() ? [] : this.tasks();
      untracked(() => {
        this.board.sync(tasks);
      });
    });
  }

  setSearch(value: string): void {
    this.filters.setSearch(value);
  }

  setStatusTab(value: StatusTab): void {
    this.filters.setStatus(value);
  }

  setPriority(value: TaskPriority | null): void {
    this.filters.setPriority(value);
  }

  setAssigneeId(value: string | null): void {
    this.filters.setAssigneeId(value);
  }

  clearFilters(): void {
    this.filters.clear();
  }

  retryReads(): void {
    this.tasksApi.reload();
  }

  /** Same-column order is local; cross-column status changes are optimistic. */
  dropTask(event: TaskDropEvent): void {
    const result = this.board.drop(event, this.groupedColumns(), this.submitting());
    if (result !== 'status-change') {
      return;
    }

    this.changeTaskStatus(event.task, event.toStatus).subscribe({
      next: () => this.board.confirmStatus(event.task.id),
      error: () => {
        this.board.rollbackStatus(event.task.id, this.tasks());
        this.retryReads();
      },
    });
  }

  createTask(task: Task): Observable<Task> {
    return this.mutations.create(task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.mutations.update(task);
  }

  deleteTask(task: Task): Observable<void> {
    return this.mutations.delete(task);
  }

  changeTaskStatus(task: Task, status: Task['status']): Observable<Task> {
    return this.mutations.changeStatus(task, status);
  }
}
