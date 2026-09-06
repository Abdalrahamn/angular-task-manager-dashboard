import { MatDialog } from '@angular/material/dialog';
import { Task } from '../models/task.model';
import { DeleteTaskDialog } from './delete-task-dialog/delete-task-dialog.component';
import { TaskFormDialog } from './task-form-dialog/task-form-dialog.component';

const dialogConfig = {
  autoFocus: 'first-tabbable' as const,
  restoreFocus: true,
  panelClass: 'app-dialog-panel',
  maxWidth: 'calc(100vw - 32px)',
  width: 'min(480px, calc(100vw - 32px))',
};

export function openTaskFormDialog(dialog: MatDialog, task: Task | null = null) {
  return dialog.open(TaskFormDialog, { ...dialogConfig, data: { task } });
}

export function openDeleteTaskDialog(dialog: MatDialog, task: Task) {
  return dialog.open(DeleteTaskDialog, { ...dialogConfig, data: { task } });
}
