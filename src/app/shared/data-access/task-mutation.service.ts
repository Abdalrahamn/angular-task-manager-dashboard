import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class TaskMutationService {
  private readonly tasksApi = inject(TaskService);
  private readonly notifications = inject(NotificationService);
  private readonly submittingState = signal(false);

  readonly submitting = this.submittingState.asReadonly();

  create(task: Task): Observable<Task> {
    return this.run(this.tasksApi.create(task), 'Unable to save the task.');
  }

  update(task: Task): Observable<Task> {
    const updatedTask = { ...task, updatedAt: new Date().toISOString() };
    return this.run(this.tasksApi.update(updatedTask), 'Unable to save the task.');
  }

  delete(task: Task): Observable<void> {
    return this.run(this.tasksApi.delete(task.id), 'Unable to delete the task.');
  }

  changeStatus(task: Task, status: Task['status']): Observable<Task> {
    const updatedAt = new Date().toISOString();
    const completedAt = status === 'done' ? updatedAt : null;
    return this.run(
      this.tasksApi.patch(task.id, { status, completedAt, updatedAt }),
      'Unable to update the task status.',
    );
  }

  private run<T>(
    work: Observable<T>,
    failureMessage: string,
    onSuccess?: (value: T) => void,
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
