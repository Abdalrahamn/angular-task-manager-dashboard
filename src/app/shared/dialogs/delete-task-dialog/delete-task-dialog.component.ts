import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TaskStoreService } from '../../data-access/task-store.service';
import { Task } from '../../models/task.model';

export interface DeleteTaskDialogData {
  task: Task;
}

@Component({
  selector: 'app-delete-task-dialog',
  imports: [MatDialogModule],
  templateUrl: './delete-task-dialog.component.html',
  styleUrl: './delete-task-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteTaskDialog {
  private readonly dialogRef = inject(MatDialogRef<DeleteTaskDialog, boolean>);
  readonly data = inject<DeleteTaskDialogData>(MAT_DIALOG_DATA);
  readonly store = inject(TaskStoreService);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.store.submitting()) {
      return;
    }

    this.store.deleteTask(this.data.task).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => undefined,
    });
  }
}
