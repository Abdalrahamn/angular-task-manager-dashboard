import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { cacheInterceptor } from '../../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { Task } from '../models/task.model';
import { DeleteTaskDialog } from './delete-task-dialog/delete-task-dialog.component';
import { openDeleteTaskDialog, openTaskFormDialog } from './open-task-dialogs';
import { TaskFormDialog } from './task-form-dialog/task-form-dialog.component';

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

describe('open-task-dialogs', () => {
  it('should open create and delete dialogs with the shared panel config', async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        provideAnimations(),
      ],
    }).compileComponents();

    const dialog = TestBed.inject(MatDialog);
    const createRef = openTaskFormDialog(dialog);
    expect(createRef.componentInstance).toBeInstanceOf(TaskFormDialog);
    createRef.close();

    const deleteRef = openDeleteTaskDialog(dialog, task);
    expect(deleteRef.componentInstance).toBeInstanceOf(DeleteTaskDialog);
    deleteRef.close();
  });
});
