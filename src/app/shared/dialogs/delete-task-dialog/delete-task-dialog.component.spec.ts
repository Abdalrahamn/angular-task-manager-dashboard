import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { cacheInterceptor } from '../../../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { environment } from '../../../../environments/environment';
import { Task } from '../../models/task.model';
import { DeleteTaskDialog } from './delete-task-dialog.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };
const task: Task = {
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

async function setup() {
  const close = vi.fn();
  await TestBed.configureTestingModule({
    imports: [DeleteTaskDialog],
    providers: [
      provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
      provideHttpClientTesting(),
      provideAnimations(),
      { provide: MAT_DIALOG_DATA, useValue: { task } },
      { provide: MatDialogRef, useValue: { close } },
    ],
  }).compileComponents();
  const http = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(DeleteTaskDialog);
  TestBed.tick();
  http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([task]);
  http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
  TestBed.tick();
  fixture.detectChanges();
  return { fixture, http, close, dialog: fixture.componentInstance };
}

describe('DeleteTaskDialog', () => {
  it('should cancel without deleting', async () => {
    const { fixture, close } = await setup();
    fixture.nativeElement.querySelector('.dialog__cancel').click();
    expect(close).toHaveBeenCalledWith(false);
  });

  it('should confirm deletion and ignore a duplicate submit', async () => {
    const { fixture, http, close, dialog } = await setup();
    dialog.store.deleteTask(task).subscribe({ error: () => undefined });
    const pendingRequest = http.expectOne((req) => req.method === 'DELETE');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Deleting…');
    dialog.confirm();
    http.expectNone((req) => req.method === 'DELETE');
    pendingRequest.error(new ProgressEvent('error'), { status: 500 });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.dialog__confirm').click();
    http.expectOne((req) => req.method === 'DELETE').flush(null);
    await vi.waitFor(() => {
      TestBed.tick();
      expect(http.match(`${environment.apiBaseUrl}/tasks`).length).toBeGreaterThan(0);
    });
    http.match(`${environment.apiBaseUrl}/tasks`).forEach((item) => item.flush([]));
    expect(close).toHaveBeenCalledWith(true);

    dialog.confirm();
    http
      .expectOne((req) => req.method === 'DELETE')
      .error(new ProgressEvent('error'), { status: 500 });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
