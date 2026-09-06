import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { Task } from '../models/task.model';
import { TaskActivityStore } from './task-activity.store';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class TaskMutationService {
  private readonly tasksApi = inject(TaskService);
  private readonly notifications = inject(NotificationService);
  private readonly activity = inject(TaskActivityStore);
  private readonly submittingState = signal(false);

  readonly submitting = this.submittingState.asReadonly();

  create(task: Task): Observable<Task> {
    return this.run(this.tasksApi.create(task), 'Unable to save the task.', (created) => {
      this.activity.append('create', created);
    });
  }

  update(task: Task): Observable<Task> {
    return this.run(this.tasksApi.update(task), 'Unable to save the task.', (updated) => {
      this.activity.append('edit', updated);
    });
  }

  delete(task: Task): Observable<void> {
    return this.run(this.tasksApi.delete(task.id), 'Unable to delete the task.', () => {
      this.activity.append('delete', task);
    });
  }

  changeStatus(task: Task, status: Task['status']): Observable<Task> {
    const completedAt = status === 'done' ? new Date().toISOString() : null;
    return this.run(
      this.tasksApi.patch(task.id, { status, completedAt }),
      'Unable to update the task status.',
      (updated) => this.activity.append(status === 'done' ? 'complete' : 'status_change', updated),
    );
  }

  private run<T>(
    work: Observable<T>,
    failureMessage: string,
    onSuccess: (value: T) => void,
  ): Observable<T> {
    if (this.submittingState()) {
      return EMPTY;
    }

    this.submittingState.set(true);
    return work.pipe(
      tap(onSuccess),
      catchError((error: unknown) => {
        this.notifications.show(failureMessage);
        return throwError(() => error);
      }),
      finalize(() => this.submittingState.set(false)),
    );
  }
}
