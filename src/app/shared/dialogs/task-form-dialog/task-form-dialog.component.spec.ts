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
import { TaskFormDialog } from './task-form-dialog.component';

const extra = { id: 'user-009', name: 'Pat Extra', avatar: 'PE', email: 'pat@company.com' };

const task: Task = {
  id: 'task-001',
  title: 'Design homepage',
  description: 'Create mockups',
  status: 'todo',
  priority: 'high',
  dueDate: '2000-01-01',
  assignee: extra,
  tags: ['Design', 'UI'],
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

async function setup(data: { task: Task | null }) {
  const close = vi.fn();
  await TestBed.configureTestingModule({
    imports: [TaskFormDialog],
    providers: [
      provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
      provideHttpClientTesting(),
      provideAnimations(),
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close } },
    ],
  }).compileComponents();

  const http = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(TaskFormDialog);
  TestBed.tick();
  http.expectOne(`${environment.apiBaseUrl}/tasks`).flush(data.task ? [task] : [task]);
  http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([statistic]);
  TestBed.tick();
  fixture.detectChanges();
  return { fixture, http, close, dialog: fixture.componentInstance };
}

describe('TaskFormDialog', () => {
  it('should enable tag removal only when more than one tag exists', async () => {
    const { fixture, dialog } = await setup({ task: null });
    const removeButton = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector('.tag-row__remove');

    expect(removeButton().disabled).toBe(true);
    dialog.removeTag(0);
    expect(dialog.tags.length).toBe(1);

    dialog.addTag();
    fixture.detectChanges();
    expect(removeButton().disabled).toBe(false);

    removeButton().click();
    fixture.detectChanges();
    expect(dialog.tags.length).toBe(1);
    expect(removeButton().disabled).toBe(true);
  });

  it('marks every required field visibly and accessibly', async () => {
    const { fixture } = await setup({ task: null });
    const requiredFields = [
      ['title', 'Title *'],
      ['description', 'Description *'],
      ['priority', 'Priority *'],
      ['status', 'Status *'],
      ['dueDate', 'Due Date *'],
      ['assigneeId', 'Assignee *'],
    ];

    for (const [controlName, label] of requiredFields) {
      const control = fixture.nativeElement.querySelector(`[formControlName="${controlName}"]`);
      expect(control.required).toBe(true);
      expect(control.getAttribute('aria-required')).toBe('true');
      expect(control.closest('label').textContent).toContain(label);
    }
  });

  it('should keep the form closed when invalid', async () => {
    const { fixture, close, dialog } = await setup({ task: null });
    dialog.submit();
    fixture.detectChanges();
    expect(dialog.showError('title', 'required')).toBe(true);
    expect(dialog.showError('tags', 'required')).toBe(false);
    expect(close).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('.dialog__link').click();
    fixture.nativeElement.querySelector('.tag-row__remove').click();
    dialog.form.controls.priority.setErrors({ required: true });
    dialog.form.controls.status.setErrors({ required: true });
    dialog.form.controls.dueDate.setValue('2000-01-01');
    dialog.form.controls.dueDate.markAsDirty();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Due date cannot be in the past.');
    expect(dialog.dueDateMessage()).toBe('Due date cannot be in the past.');
    dialog.form.controls.dueDate.setErrors({ dueDate: 'invalid' });
    expect(dialog.dueDateMessage()).toBe('Enter a valid date.');
    expect(fixture.nativeElement.textContent).toContain('Priority is required.');
    expect(fixture.nativeElement.textContent).toContain('Status is required.');
    fixture.nativeElement.querySelector('.dialog__submit').click();
    fixture.nativeElement.querySelector('.dialog__cancel').click();
    expect(close).toHaveBeenCalledWith(false);
  });

  it('should create a task, manage tags, and close on success', async () => {
    const { fixture, http, close, dialog } = await setup({ task: null });
    dialog.form.patchValue({
      title: '  New work  ',
      description: '  Details  ',
      dueDate: '2099-12-31',
      assigneeId: 'user-009',
      status: 'done',
    });
    dialog.addTag();
    dialog.tags.at(0).setValue('QA');
    dialog.tags.at(1).setValue('   ');
    expect(dialog.showTagError(1, 'noWhitespace')).toBe(false);
    dialog.submitted.set(true);
    fixture.detectChanges();
    expect(dialog.showTagError(1, 'noWhitespace')).toBe(true);
    dialog.tags.at(1).setValue('Ship');
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-1111-1111-111111111111',
    );
    fixture.nativeElement.querySelector('.dialog__submit').click();
    const request = http.expectOne((req) => req.method === 'POST');
    expect(request.request.body.title).toBe('New work');
    expect(request.request.body.status).toBe('done');
    expect(request.request.body.completedAt).toBeTruthy();
    expect(request.request.body.tags).toEqual(['QA', 'Ship']);
    request.flush({ ...request.request.body, id: 'task-new' });
    await vi.waitFor(() => {
      TestBed.tick();
      expect(http.match(`${environment.apiBaseUrl}/tasks`).length).toBeGreaterThan(0);
    });
    http.match(`${environment.apiBaseUrl}/tasks`).forEach((item) => item.flush([task]));
    expect(close).toHaveBeenCalledWith(true);
  });

  it('should edit an overdue task, restore a tag row, and cancel', async () => {
    vi.stubGlobal('crypto', undefined);
    const { fixture, http, close, dialog } = await setup({ task });
    expect(dialog.assignees().some((user) => user.id === 'user-009')).toBe(true);
    dialog.tags.at(0).setValue('  ');
    dialog.tags.at(0).markAsTouched();
    expect(dialog.showTagError(0, 'noWhitespace')).toBe(true);
    dialog.removeTag(0);
    dialog.removeTag(0);
    expect(dialog.tags.length).toBe(1);
    dialog.form.patchValue({
      title: 'Updated',
      description: 'Still overdue',
      assigneeId: 'user-009',
    });
    dialog.submit();
    const request = http.expectOne((req) => req.method === 'PUT');
    expect(request.request.body.isOverdue).toBe(true);
    expect(request.request.body.id).toBe('task-001');
    request.flush(request.request.body);
    await vi.waitFor(() => {
      TestBed.tick();
      expect(http.match(`${environment.apiBaseUrl}/tasks`).length).toBeGreaterThan(0);
    });
    http.match(`${environment.apiBaseUrl}/tasks`).forEach((item) => item.flush([task]));
    dialog.cancel();
    expect(close).toHaveBeenCalledWith(false);
    fixture.destroy();
    vi.unstubAllGlobals();
  });

  it('should create a done task with a timestamp id when randomUUID is missing', async () => {
    vi.stubGlobal('crypto', {});
    const { http, close, dialog } = await setup({ task: null });
    dialog.form.patchValue({
      title: 'Stamp id',
      description: 'Fallback id',
      dueDate: '2099-12-31',
      assigneeId: 'user-009',
      status: 'todo',
    });
    dialog.tags.at(0).setValue('QA');
    dialog.submit();
    const request = http.expectOne((req) => req.method === 'POST');
    expect(request.request.body.id).toMatch(/^task-\d+$/);
    request.flush({ ...request.request.body });
    await vi.waitFor(() => {
      TestBed.tick();
      expect(http.match(`${environment.apiBaseUrl}/tasks`).length).toBeGreaterThan(0);
    });
    http.match(`${environment.apiBaseUrl}/tasks`).forEach((item) => item.flush([task]));
    expect(close).toHaveBeenCalledWith(true);
    vi.unstubAllGlobals();
  });

  it('should keep an existing completedAt when editing a done task', async () => {
    const completed = {
      ...task,
      status: 'done' as const,
      dueDate: '2099-12-31',
      completedAt: '2099-01-02T00:00:00.000Z',
    };
    const { http, dialog } = await setup({ task: completed });
    dialog.form.patchValue({
      title: 'Still done',
      description: 'Keep stamp',
      assigneeId: 'user-009',
      status: 'done',
      dueDate: '2099-12-31',
    });
    dialog.submit();
    const request = http.expectOne((req) => req.method === 'PUT');
    expect(request.request.body.completedAt).toBe('2099-01-02T00:00:00.000Z');
    request.flush(request.request.body);
    await vi.waitFor(() => {
      TestBed.tick();
      expect(http.match(`${environment.apiBaseUrl}/tasks`).length).toBeGreaterThan(0);
    });
    http.match(`${environment.apiBaseUrl}/tasks`).forEach((item) => item.flush([completed]));
  });

  it('should block submit without a matching assignee and while submitting', async () => {
    const { http, close, dialog } = await setup({ task: null });
    dialog.form.patchValue({
      title: 'Blocked',
      description: 'No assignee match',
      dueDate: '2099-12-31',
      assigneeId: 'missing',
    });
    dialog.submit();
    expect(dialog.form.controls.assigneeId.hasError('required')).toBe(true);
    http.expectNone((req) => req.method === 'POST');

    dialog.form.patchValue({ assigneeId: 'user-009' });
    dialog.store.createTask(task).subscribe({ error: () => undefined });
    const pendingRequest = http.expectOne((req) => req.method === 'POST');
    dialog.submit();
    http.expectNone((req) => req.method === 'POST');

    pendingRequest.error(new ProgressEvent('error'), { status: 500 });
    dialog.submit();
    http
      .expectOne((req) => req.method === 'POST')
      .error(new ProgressEvent('error'), { status: 500 });
    expect(close).not.toHaveBeenCalled();
  });
});
