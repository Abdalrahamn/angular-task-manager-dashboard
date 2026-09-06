import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpGetCache } from '../../core/interceptors/cache.interceptor';
import { Statistic } from '../models/statistic.model';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(HttpGetCache);
  private readonly tasksUrl = `${environment.apiBaseUrl}/tasks`;
  private readonly statisticsUrl = `${environment.apiBaseUrl}/statistics`;

  readonly tasksResource = httpResource<Task[]>(() => this.tasksUrl, {
    defaultValue: [],
  });

  readonly statisticsResource = httpResource<Statistic[]>(() => this.statisticsUrl, {
    defaultValue: [],
  });

  create(task: Task): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl, task).pipe(tap(() => this.afterWrite()));
  }

  update(task: Task): Observable<Task> {
    return this.http
      .put<Task>(`${this.tasksUrl}/${task.id}`, task)
      .pipe(tap(() => this.afterWrite()));
  }

  patch(id: string, changes: Partial<Task>): Observable<Task> {
    return this.http
      .patch<Task>(`${this.tasksUrl}/${id}`, changes)
      .pipe(tap(() => this.afterWrite()));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${id}`).pipe(tap(() => this.afterWrite()));
  }

  reload(): void {
    this.cache.invalidateResource(this.tasksUrl);
    this.cache.invalidateResource(this.statisticsUrl);
    this.tasksResource.reload();
    this.statisticsResource.reload();
  }

  reloadTasks(): void {
    this.cache.invalidateResource(this.tasksUrl);
    this.tasksResource.reload();
  }

  private afterWrite(): void {
    // Statistics supplies fixed card metadata; all displayed numbers come from tasks.
    this.reloadTasks();
  }
}
