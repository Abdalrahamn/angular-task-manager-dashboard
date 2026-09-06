import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { vi } from 'vitest';
import { cacheInterceptor } from '../../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/services/notification.service';
import { Statistic } from '../models/statistic.model';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';
import { TaskStoreService } from './task-store.service';

const jane = {
  id: 'user-001',
  name: 'Jane Doe',
  avatar: 'JD',
  email: 'jane@company.com',
};

const john = {
  id: 'user-002',
  name: 'John Smith',
  avatar: 'JS',
  email: 'john@company.com',
};

const todo: Task = {
  id: 'task-001',
  title: 'Design homepage',
  description: 'Create mockups',
  status: 'todo',
  priority: 'high',
  dueDate: '2099-01-01',
  assignee: jane,
  tags: ['Design'],
  createdAt: '2099-01-01T00:00:00.000Z',
  updatedAt: '2099-01-01T00:00:00.000Z',
};

const inProgress: Task = {
  ...todo,
  id: 'task-002',
  title: 'Build API',
  description: 'Implement endpoints',
  status: 'in_progress',
  priority: 'medium',
  assignee: john,
};

const done: Task = {
  ...todo,
  id: 'task-003',
  title: 'Ship it',
  description: 'Release the build',
  status: 'done',
  priority: 'low',
  assignee: john,
};

const overdue: Task = {
  ...todo,
  id: 'task-004',
  title: 'Late task',
  description: 'Was due last year',
  status: 'todo',
  priority: 'high',
  dueDate: '2020-01-01',
  assignee: jane,
};

const statistic: Statistic = {
  id: 'stat-001',
  title: 'Total Tasks',
  icon: '📊',
  value: 4,
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
  const store = TestBed.inject(TaskStoreService);
  const http = TestBed.inject(HttpTestingController);
  const notifications = TestBed.inject(NotificationService);
  TestBed.tick();
  return { store, http, notifications };
}

async function waitUntilIdle(store: TaskStoreService): Promise<void> {
  await vi.waitFor(() => {
    TestBed.tick();
    expect(store.isLoading()).toBe(false);
  });
}

async function flushReads(http: HttpTestingController, tasks: Task[]): Promise<void> {
  http.expectOne(`${environment.apiBaseUrl}/tasks`).flush(tasks);
  http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
  TestBed.tick();
}

async function flushTasksReload(http: HttpTestingController, tasks: Task[]): Promise<void> {
  await vi.waitFor(() => {
    TestBed.tick();
    const requests = http.match(`${environment.apiBaseUrl}/tasks`);
    expect(requests.length).toBeGreaterThan(0);
    requests.forEach((request) => request.flush(tasks));
  });
}

describe('TaskStoreService', () => {
  it('should expose loading, errors, tasks, and statistics', async () => {
    const { store, http } = setup();
    expect(store.isLoading()).toBe(true);
    await flushReads(http, [todo]);
    await waitUntilIdle(store);
    expect(store.tasks()).toEqual([todo]);
    expect(store.statistics()).toEqual([statistic]);
    expect(store.tasksError()).toBeUndefined();
    expect(store.statisticsError()).toBeUndefined();
  });

  it('should surface GET errors from httpResource after retry', async () => {
    const { store, http } = setup();
    http
      .expectOne(`${environment.apiBaseUrl}/tasks`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    http
      .expectOne(`${environment.apiBaseUrl}/tasks`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    http
      .expectOne(`${environment.apiBaseUrl}/statistics`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    http
      .expectOne(`${environment.apiBaseUrl}/statistics`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    TestBed.tick();

    await vi.waitFor(() => {
      TestBed.tick();
      expect(store.tasksError()).toBeTruthy();
      expect(store.statisticsError()).toBeTruthy();
    });
    expect(store.tasks()).toEqual([]);
    expect(store.isLoading()).toBe(false);
  });

  it('should filter, group, derive unique assignees, and compute analytics', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo, inProgress, done, overdue]);
    await waitUntilIdle(store);

    expect(store.uniqueAssignees().map((user) => user.id)).toEqual(['user-001', 'user-002']);
    expect(store.groupedColumns().todo.map((task) => task.id)).toEqual(['task-001', 'task-004']);
    expect(store.groupedColumns().in_progress[0].id).toBe('task-002');
    expect(store.groupedColumns().done[0].id).toBe('task-003');
    expect(store.analyticsSeries()).toEqual({
      byStatus: { todo: 2, in_progress: 1, done: 1 },
      byPriority: { high: 2, medium: 1, low: 1 },
      total: 4,
      completed: 1,
      overdue: 1,
      completionRate: 0.25,
      overdueRate: 0.25,
      byAssignee: [
        { assignee: jane, total: 2, todo: 2, inProgress: 0, done: 0 },
        { assignee: john, total: 2, todo: 0, inProgress: 1, done: 1 },
      ],
    });
    expect(store.currentStatistics()).toEqual([{ ...statistic, value: 4, change: '+0' }]);
    expect(store.activityItems().some((item) => item.id.startsWith('seed-'))).toBe(true);

    store.setSearch('homepage');
    expect(store.filteredTasks().map((task) => task.id)).toEqual(['task-001']);
    store.setSearch('mockups');
    expect(store.filteredTasks().map((task) => task.id)).toEqual(['task-001']);
    store.setSearch('');
    store.setStatusTab('done');
    expect(store.filteredTasks().map((task) => task.id)).toEqual(['task-003']);
    store.setStatusTab('all');
    store.setPriority('low');
    expect(store.filteredTasks().map((task) => task.id)).toEqual(['task-003']);
    store.setPriority(null);
    store.setAssigneeId('user-002');
    expect(store.filteredTasks().map((task) => task.id)).toEqual(['task-002', 'task-003']);
    store.setAssigneeId(null);
    store.setSearch('homepage');
    store.setStatusTab('todo');
    store.setPriority('high');
    store.setAssigneeId('user-001');
    store.clearFilters();
    expect(store.search()).toBe('');
    expect(store.statusTab()).toBe('all');
    expect(store.priority()).toBeNull();
    expect(store.assigneeId()).toBeNull();
    expect(store.hasActiveFilters()).toBe(false);
  });

  it('should create, update, change status, complete, and delete with activity', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo]);
    await waitUntilIdle(store);

    store.createTask(todo).subscribe();
    http.expectOne((req) => req.method === 'POST').flush(todo);
    await flushTasksReload(http, [todo]);
    expect(store.activityItems()[0].action).toBe('create');

    store.updateTask({ ...todo, title: 'New title' }).subscribe();
    http.expectOne((req) => req.method === 'PUT').flush({ ...todo, title: 'New title' });
    await flushTasksReload(http, [{ ...todo, title: 'New title' }]);
    expect(store.activityItems()[0].action).toBe('edit');

    store.changeTaskStatus(todo, 'in_progress').subscribe();
    http.expectOne((req) => req.method === 'PATCH').flush({ ...todo, status: 'in_progress' });
    await flushTasksReload(http, [{ ...todo, status: 'in_progress' }]);
    expect(store.activityItems()[0].action).toBe('status_change');

    store.changeTaskStatus(todo, 'done').subscribe();
    http.expectOne((req) => req.method === 'PATCH').flush({ ...todo, status: 'done' });
    await flushTasksReload(http, [{ ...todo, status: 'done' }]);
    expect(store.activityItems()[0].action).toBe('complete');

    store.deleteTask(todo).subscribe();
    http.expectOne((req) => req.method === 'DELETE').flush(null);
    await flushTasksReload(http, []);
    expect(store.activityItems()[0].action).toBe('delete');
  });

  it('should ignore duplicate submits and notify on mutation failure', async () => {
    const { store, http, notifications } = setup();
    await flushReads(http, [todo]);
    await waitUntilIdle(store);

    store.createTask(todo).subscribe({ error: () => undefined });
    let duplicateEmitted = false;
    store.createTask(todo).subscribe({
      next: () => {
        duplicateEmitted = true;
      },
    });
    expect(duplicateEmitted).toBe(false);
    http
      .expectOne((req) => req.method === 'POST')
      .error(new ProgressEvent('error'), { status: 500 });
    TestBed.tick();
    expect(notifications.message()).toBe('Unable to save the task.');
  });

  it('should show a user-friendly mutation message for non-Error failures', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TaskService,
          useValue: {
            tasksResource: {
              value: () => [],
              isLoading: () => false,
              error: () => undefined,
              reload: vi.fn(),
            },
            statisticsResource: {
              value: () => [],
              isLoading: () => false,
              error: () => undefined,
              reload: vi.fn(),
            },
            create: () => throwError(() => ({})),
          },
        },
      ],
    });

    const store = TestBed.inject(TaskStoreService);
    const notifications = TestBed.inject(NotificationService);
    store.createTask(todo).subscribe({ error: () => undefined });
    expect(notifications.message()).toBe('Unable to save the task.');
  });

  it('should use a timestamp activity id when crypto.randomUUID is unavailable', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo]);
    await waitUntilIdle(store);
    vi.stubGlobal('crypto', undefined);

    store.createTask(todo).subscribe();
    http.expectOne((req) => req.method === 'POST').flush(todo);
    TestBed.tick();
    await flushTasksReload(http, [todo]);
    expect(store.activityItems()[0].id).toMatch(/^activity-\d+$/);
    vi.unstubAllGlobals();
  });

  it('should expose an empty statistics list when that resource fails', async () => {
    const { store, http } = setup();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo, overdue]);
    http
      .expectOne(`${environment.apiBaseUrl}/statistics`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    http
      .expectOne(`${environment.apiBaseUrl}/statistics`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    await vi.waitFor(() => {
      TestBed.tick();
      expect(store.statisticsError()).toBeTruthy();
      expect(store.tasks().length).toBe(2);
    });
    expect(store.statistics()).toEqual([]);
    expect(store.groupedColumns().todo.map((task) => task.id)).toEqual(['task-001', 'task-004']);
  });

  it('should reload data through the store', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo]);
    await waitUntilIdle(store);
    store.retryReads();
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
  });

  it('should report empty analytics when there are no tasks', async () => {
    const { store, http } = setup();
    await flushReads(http, []);
    await waitUntilIdle(store);
    expect(store.analyticsSeries()).toEqual({
      byStatus: { todo: 0, in_progress: 0, done: 0 },
      byPriority: { low: 0, medium: 0, high: 0 },
      total: 0,
      completed: 0,
      overdue: 0,
      completionRate: 0,
      overdueRate: 0,
      byAssignee: [],
    });
    expect(store.activityItems()).toEqual([]);
  });

  it('should not overwrite activity that arrives before the first non-empty snapshot', async () => {
    const { store, http } = setup();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await waitUntilIdle(store);

    store.createTask(todo).subscribe();
    http.expectOne((request) => request.method === 'POST').flush(todo);
    await flushTasksReload(http, [todo]);
    await waitUntilIdle(store);

    expect(store.activityItems()[0].action).toBe('create');
    expect(store.groupedColumns().todo[0].id).toBe('task-001');
  });

  it('should reorder within a column without calling the API', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo, overdue]);
    await waitUntilIdle(store);
    store.dropTask({
      task: todo,
      previousIndex: 0,
      currentIndex: 1,
      fromStatus: 'todo',
      toStatus: 'todo',
    });
    expect(store.groupedColumns().todo.map((task) => task.id)).toEqual(['task-004', 'task-001']);
    http.expectNone((req) => req.method === 'PATCH');
  });

  it('should ignore a drop for a task that is not in the source column', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo]);
    await waitUntilIdle(store);
    store.dropTask({
      task: inProgress,
      previousIndex: 0,
      currentIndex: 0,
      fromStatus: 'todo',
      toStatus: 'in_progress',
    });
    expect(store.groupedColumns().todo[0].id).toBe('task-001');
  });

  it('should persist a cross-column drop and then clear the override', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo]);
    await waitUntilIdle(store);
    store.dropTask({
      task: todo,
      previousIndex: 0,
      currentIndex: 0,
      fromStatus: 'todo',
      toStatus: 'in_progress',
    });
    expect(store.groupedColumns().in_progress[0].id).toBe('task-001');
    expect(store.currentStatistics()[0].value).toBe(1);
    http.expectOne((req) => req.method === 'PATCH').flush({ ...todo, status: 'in_progress' });
    await flushTasksReload(http, [{ ...todo, status: 'in_progress' }]);
    expect(store.groupedColumns().in_progress[0].status).toBe('in_progress');
  });

  it('should roll back a failed cross-column drop and reload', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo]);
    await waitUntilIdle(store);
    store.dropTask({
      task: todo,
      previousIndex: 0,
      currentIndex: 0,
      fromStatus: 'todo',
      toStatus: 'done',
    });
    http
      .expectOne((req) => req.method === 'PATCH')
      .error(new ProgressEvent('error'), { status: 500 });
    TestBed.tick();
    await vi.waitFor(() => {
      TestBed.tick();
      expect(store.groupedColumns().todo[0].id).toBe('task-001');
    });
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
  });

  it('should not start a second cross-column drop while submitting', async () => {
    const { store, http } = setup();
    await flushReads(http, [todo, inProgress]);
    await waitUntilIdle(store);
    store.createTask(todo).subscribe({ error: () => undefined });
    store.dropTask({
      task: inProgress,
      previousIndex: 0,
      currentIndex: 0,
      fromStatus: 'in_progress',
      toStatus: 'done',
    });
    expect(store.groupedColumns().in_progress[0].id).toBe('task-002');
    http.expectOne((req) => req.method === 'POST').flush(todo);
    await flushTasksReload(http, [todo, inProgress]);
  });
});
