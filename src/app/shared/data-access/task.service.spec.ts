import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { cacheInterceptor } from '../../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task.model';
import { Statistic } from '../models/statistic.model';
import { TaskService } from './task.service';

const assignee = {
  id: 'user-001',
  name: 'Jane Doe',
  avatar: 'JD',
  email: 'jane@company.com',
};

const task: Task = {
  id: 'task-001',
  title: 'Design homepage',
  description: 'Create mockups',
  status: 'todo',
  priority: 'high',
  dueDate: '2099-01-01',
  assignee,
  tags: ['Design'],
  createdAt: '2099-01-01T00:00:00.000Z',
  updatedAt: '2099-01-01T00:00:00.000Z',
};

const statistic: Statistic = {
  id: 'stat-001',
  title: 'Total Tasks',
  icon: '📊',
  value: 1,
  change: '+1',
  changeLabel: 'today',
  changeType: 'positive',
  color: '#1976D2',
};

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  const service = TestBed.inject(TaskService);
  TestBed.tick();
  const http = TestBed.inject(HttpTestingController);
  return { service, http };
}

function flushInitialReads(http: HttpTestingController): void {
  http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([task]);
  http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
  TestBed.tick();
}

async function waitUntilResolved(resource: { status: () => string }): Promise<void> {
  await vi.waitFor(() => {
    TestBed.tick();
    expect(resource.status()).toBe('resolved');
  });
}

async function flushTasksReload(http: HttpTestingController, tasks: Task[]): Promise<void> {
  await vi.waitFor(() => {
    TestBed.tick();
    const requests = http.match(`${environment.apiBaseUrl}/tasks`);
    expect(requests.length).toBeGreaterThan(0);
    requests.forEach((request) => request.flush(tasks));
  });
}

describe('TaskService', () => {
  it('should load tasks and statistics through httpResource', async () => {
    const { service, http } = setup();
    flushInitialReads(http);
    await waitUntilResolved(service.tasksResource);
    await waitUntilResolved(service.statisticsResource);
    expect(service.tasksResource.value()).toEqual([task]);
    expect(service.statisticsResource.value()).toEqual([statistic]);
  });

  it('should create, update, patch, and delete then reload tasks', async () => {
    const { service, http } = setup();
    flushInitialReads(http);
    await waitUntilResolved(service.tasksResource);

    service.create(task).subscribe();
    http
      .expectOne((req) => req.method === 'POST' && req.url === `${environment.apiBaseUrl}/tasks`)
      .flush(task);
    await flushTasksReload(http, [task]);
    await waitUntilResolved(service.tasksResource);

    service.update(task).subscribe();
    http
      .expectOne(
        (req) => req.method === 'PUT' && req.url === `${environment.apiBaseUrl}/tasks/${task.id}`,
      )
      .flush(task);
    await flushTasksReload(http, [task]);
    await waitUntilResolved(service.tasksResource);

    service.patch(task.id, { status: 'done' }).subscribe();
    http
      .expectOne(
        (req) => req.method === 'PATCH' && req.url === `${environment.apiBaseUrl}/tasks/${task.id}`,
      )
      .flush({ ...task, status: 'done' });
    await flushTasksReload(http, [{ ...task, status: 'done' }]);
    await waitUntilResolved(service.tasksResource);

    service.delete(task.id).subscribe();
    http
      .expectOne(
        (req) =>
          req.method === 'DELETE' && req.url === `${environment.apiBaseUrl}/tasks/${task.id}`,
      )
      .flush(null);
    await flushTasksReload(http, []);
    await waitUntilResolved(service.tasksResource);
  });

  it('should reload both resources', async () => {
    const { service, http } = setup();
    flushInitialReads(http);
    await waitUntilResolved(service.tasksResource);
    service.reload();
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([task]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await waitUntilResolved(service.statisticsResource);
  });
});
