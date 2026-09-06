import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TaskStoreService } from '../../data-access/task-store.service';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { isTaskOverdue } from '../../utils/task.utils';
import { dueDateValidator } from '../../validators/due-date.validator';
import { noWhitespaceValidator } from '../../validators/no-whitespace.validator';

export interface TaskFormDialogData {
  task: Task | null;
}

@Component({
  selector: 'app-task-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormDialog {
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog, boolean>);
  private readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);
  readonly store = inject(TaskStoreService);

  readonly submitted = signal(false);
  readonly isEdit = this.data.task !== null;
  readonly title = this.isEdit ? 'Edit Task' : 'New Task';

  readonly assignees = computed(() => {
    const list = [...this.store.uniqueAssignees()];
    const current = this.data.task?.assignee;
    if (current && !list.some((assignee) => assignee.id === current.id)) {
      list.push(current);
    }
    return list;
  });

  readonly form = new FormGroup({
    title: new FormControl(this.data.task?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, noWhitespaceValidator],
    }),
    description: new FormControl(this.data.task?.description ?? '', {
      nonNullable: true,
      validators: [Validators.required, noWhitespaceValidator],
    }),
    priority: new FormControl<TaskPriority>(this.data.task?.priority ?? 'medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<TaskStatus>(this.data.task?.status ?? 'todo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dueDate: new FormControl(this.data.task?.dueDate?.slice(0, 10) ?? '', {
      nonNullable: true,
      validators: [Validators.required, dueDateValidator({ allowPast: this.isEdit })],
    }),
    assigneeId: new FormControl(this.data.task?.assignee.id ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tags: new FormArray(
      (this.data.task?.tags.length ? this.data.task.tags : ['']).map((tag) =>
        this.createTagControl(tag),
      ),
    ),
  });

  get tags(): FormArray<FormControl<string>> {
    return this.form.controls.tags;
  }

  addTag(): void {
    this.tags.push(this.createTagControl(''));
  }

  removeTag(index: number): void {
    if (this.tags.length <= 1) {
      return;
    }

    this.tags.removeAt(index);
  }

  showError(controlName: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[controlName];
    if (control instanceof FormArray) {
      return false;
    }
    return control.hasError(error) && (control.touched || control.dirty || this.submitted());
  }

  showTagError(index: number, error: string): boolean {
    const control = this.tags.at(index);
    return control.hasError(error) && (control.touched || control.dirty || this.submitted());
  }

  dueDateMessage(): string {
    return this.form.controls.dueDate.getError('dueDate') === 'past'
      ? 'Due date cannot be in the past.'
      : 'Enter a valid date.';
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.store.submitting()) {
      return;
    }

    const value = this.form.getRawValue();
    const assignee = this.assignees().find((item) => item.id === value.assigneeId);
    if (!assignee) {
      this.form.controls.assigneeId.setErrors({ required: true });
      return;
    }

    const now = new Date().toISOString();
    const existing = this.data.task;
    const tags = value.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    const task: Task = {
      id: existing?.id ?? `task-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      priority: value.priority,
      dueDate: value.dueDate,
      assignee,
      tags,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (value.status === 'done') {
      task.completedAt = existing?.completedAt ?? now;
    } else {
      task.completedAt = null;
    }

    if (isTaskOverdue({ dueDate: task.dueDate, status: task.status })) {
      task.isOverdue = true;
    }

    const request = this.isEdit ? this.store.updateTask(task) : this.store.createTask(task);
    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => undefined,
    });
  }

  private createTagControl(value: string): FormControl<string> {
    return new FormControl(value, { nonNullable: true, validators: [noWhitespaceValidator] });
  }
}
