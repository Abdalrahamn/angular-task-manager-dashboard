import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DeferBlockState } from '@angular/core/testing';
import { vi } from 'vitest';
import { cacheInterceptor } from '../../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { environment } from '../../../environments/environment';
import { ErrorState } from '../../shared/components/error-state/error-state.component';
import { Task } from '../../shared/models/task.model';
import { Analytics } from './analytics.component';

vi.mock('chart.js', () => {
  class Chart {
    static register = vi.fn();
    destroy = vi.fn();
  }
  return {
    Chart,
    DoughnutController: class {},
    BarController: class {},
    ArcElement: class {},
    BarElement: class {},
    CategoryScale: class {},
    LinearScale: class {},
    Tooltip: class {},
    Legend: class {},
  };
});

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

describe('Analytics', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Analytics],
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should show loading rather than an empty state while tasks are pending', () => {
    const fixture = TestBed.createComponent(Analytics);
    TestBed.tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('No task data yet');
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
  });

  it('should render metrics from loaded tasks', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Analytics);
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Completion rate');
    });
    const deferBlocks = await fixture.getDeferBlocks();
    for (const block of deferBlocks) {
      await block.render(DeferBlockState.Complete);
    }
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Overdue rate');
    expect(fixture.componentInstance.statusValues()).toEqual([1, 0, 0]);
    expect(fixture.componentInstance.priorityValues()).toEqual([1, 0, 0]);
    expect(fixture.componentInstance.assigneeLabels()).toEqual(['Jane Doe']);
    expect(fixture.componentInstance.assigneeValues()).toEqual([1]);
  });

  it('should show an empty state when there are no tasks', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Analytics);
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No task data yet');
    });
  });

  it('should show an error state', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Analytics);
    TestBed.tick();
    http
      .expectOne(`${environment.apiBaseUrl}/tasks`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    http
      .expectOne(`${environment.apiBaseUrl}/tasks`)
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Couldn't load analytics");
    });
    fixture.debugElement.query(By.directive(ErrorState)).componentInstance.retry.emit();
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
  });
});
