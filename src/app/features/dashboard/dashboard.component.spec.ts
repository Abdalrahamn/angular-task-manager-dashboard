import { By } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { cacheInterceptor } from '../../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { environment } from '../../../environments/environment';
import { ErrorState } from '../../shared/components/error-state/error-state.component';
import { Task } from '../../shared/models/task.model';
import { TaskStoreService } from '../../shared/data-access/task-store.service';
import { FilterBar } from './components/filter-bar/filter-bar.component';
import { KanbanBoard } from './components/kanban-board/kanban-board.component';
import { KanbanColumn } from './components/kanban-column/kanban-column.component';
import { Dashboard } from './dashboard.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };
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
const statistic = {
  id: 'stat-001',
  title: 'Total Tasks',
  icon: '📊',
  value: 1,
  change: '+1',
  changeLabel: 'today',
  changeType: 'positive' as const,
  color: '#1976D2',
};

async function configure() {
  await TestBed.configureTestingModule({
    imports: [Dashboard],
    providers: [
      provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
      provideHttpClientTesting(),
      provideAnimations(),
    ],
  }).compileComponents();
  const http = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(Dashboard);
  TestBed.tick();
  return { fixture, http, store: TestBed.inject(TaskStoreService) };
}

describe('Dashboard', () => {
  it('should render stats and cards after a successful load', async () => {
    const { fixture, http } = await configure();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Total Tasks');
    });
    expect(fixture.nativeElement.textContent).toContain('Design homepage');

    const bar = fixture.debugElement.query(By.directive(FilterBar)).componentInstance as FilterBar;
    bar.statusTabChange.emit('todo');
    bar.priorityChange.emit('high');
    bar.assigneeIdChange.emit('user-001');
    bar.clear.emit();
    bar.create.emit();

    const board = fixture.debugElement.query(By.directive(KanbanBoard))
      .componentInstance as KanbanBoard;
    board.editTask.emit(todo);
    board.deleteTask.emit(todo);
    board.moveTask.emit({ task: todo, status: 'done' });
    board.dropped.emit({
      task: todo,
      previousIndex: 0,
      currentIndex: 0,
      fromStatus: 'todo',
      toStatus: 'todo',
    });

    const column = fixture.debugElement.query(By.directive(KanbanColumn))
      .componentInstance as KanbanColumn;
    column.editTask.emit(todo);
    column.deleteTask.emit(todo);
    column.moveTask.emit({ task: todo, status: 'in_progress' });
    column.dropped.emit({
      task: todo,
      previousIndex: 0,
      currentIndex: 0,
      fromStatus: 'todo',
      toStatus: 'todo',
    });
  });

  it('should show skeletons while loading', async () => {
    const { fixture } = await configure();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
  });

  it('should show GET errors and retry', async () => {
    const { fixture, http } = await configure();
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
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Couldn't load tasks");
    });
    fixture.debugElement.queryAll(By.directive(ErrorState)).forEach((debug) => {
      debug.componentInstance.retry.emit();
    });
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Design homepage');
    });
  });

  it('should show empty and no-result states', async () => {
    const { fixture, http } = await configure();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No tasks yet');
    });

    TestBed.resetTestingModule();
    const second = await configure();
    second.http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    second.http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await vi.waitFor(() => {
      TestBed.tick();
      second.fixture.detectChanges();
      expect(second.fixture.nativeElement.textContent).toContain('Design homepage');
    });
    second.store.setSearch('zzzz-no-match');
    second.fixture.detectChanges();
    expect(second.fixture.nativeElement.textContent).toContain('No matching tasks');
  });

  it('should open dialogs and move a task', async () => {
    const { fixture, http } = await configure();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Design homepage');
    });

    const dialog = TestBed.inject(MatDialog);
    const open = vi.spyOn(dialog, 'open').mockReturnValue({ close: vi.fn() } as never);
    fixture.componentInstance.openCreate();
    fixture.componentInstance.openEdit(todo);
    fixture.componentInstance.openDelete(todo);
    expect(open).toHaveBeenCalledTimes(3);

    fixture.componentInstance.moveTask({ task: todo, status: 'done' });
    http.expectOne((req) => req.method === 'PATCH').flush({ ...todo, status: 'done' });
    await vi.waitFor(() => {
      TestBed.tick();
      expect(http.match(`${environment.apiBaseUrl}/tasks`).length).toBeGreaterThan(0);
    });
    http
      .match(`${environment.apiBaseUrl}/tasks`)
      .forEach((item) => item.flush([{ ...todo, status: 'done' }]));
  });

  it('should ignore a failed status move from the board', async () => {
    const { fixture, http } = await configure();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Design homepage');
    });

    fixture.componentInstance.moveTask({ task: todo, status: 'done' });
    http
      .expectOne((req) => req.method === 'PATCH')
      .error(new ProgressEvent('error'), { status: 500 });
    TestBed.tick();
  });
});
