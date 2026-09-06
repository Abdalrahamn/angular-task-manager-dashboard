import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { cacheInterceptor } from '../../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { environment } from '../../../environments/environment';
import { ErrorState } from '../../shared/components/error-state/error-state.component';
import { Task } from '../../shared/models/task.model';
import { Team } from './team.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };
const todo: Task = {
  id: 'task-001',
  title: 'Design homepage',
  description: 'Create mockups',
  status: 'in_progress',
  priority: 'high',
  dueDate: '2099-01-01',
  assignee: jane,
  tags: ['Design'],
  createdAt: '2099-01-01T00:00:00.000Z',
  updatedAt: '2099-01-01T00:00:00.000Z',
};

describe('Team', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Team],
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should show loading rather than an empty state while tasks are pending', () => {
    const fixture = TestBed.createComponent(Team);
    TestBed.tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('No teammates yet');
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
  });

  it('should render derived teammate counts', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Team);
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Jane Doe');
    });
    expect(fixture.nativeElement.textContent).toContain('Assigned');
  });

  it('should show an empty state without assignees', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Team);
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
    await vi.waitFor(() => {
      TestBed.tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No teammates yet');
    });
  });

  it('should show an error state', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Team);
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
      expect(fixture.nativeElement.textContent).toContain("Couldn't load the team");
    });
    fixture.debugElement.query(By.directive(ErrorState)).componentInstance.retry.emit();
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([todo]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
  });
});
