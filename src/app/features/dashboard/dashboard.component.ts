import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../shared/components/error-state/error-state.component';
import { Skeleton } from '../../shared/components/skeleton/skeleton.component';
import { StatCard } from '../../shared/components/stat-card/stat-card.component';
import { TaskStoreService } from '../../shared/data-access/task-store.service';
import { openDeleteTaskDialog, openTaskFormDialog } from '../../shared/dialogs/open-task-dialogs';
import { Task, TaskStatusChange } from '../../shared/models/task.model';
import { FilterBar } from './components/filter-bar/filter-bar.component';
import { KanbanBoard } from './components/kanban-board/kanban-board.component';

@Component({
  selector: 'app-dashboard',
  imports: [StatCard, FilterBar, KanbanBoard, EmptyState, ErrorState, Skeleton],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly store = inject(TaskStoreService);
  private readonly dialog = inject(MatDialog);

  openCreate(): void {
    openTaskFormDialog(this.dialog);
  }

  openEdit(task: Task): void {
    openTaskFormDialog(this.dialog, task);
  }

  openDelete(task: Task): void {
    openDeleteTaskDialog(this.dialog, task);
  }

  moveTask(event: TaskStatusChange): void {
    this.store.changeTaskStatus(event.task, event.status).subscribe({ error: () => undefined });
  }
}
