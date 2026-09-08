import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TaskColumns, TaskDropEvent } from '../../../../shared/models/kanban.model';
import { Task, TaskStatus, TaskStatusChange } from '../../../../shared/models/task.model';
import { KanbanColumn } from '../kanban-column/kanban-column.component';

@Component({
  selector: 'app-kanban-board',
  imports: [KanbanColumn, CdkDropListGroup],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoard {
  readonly columns = input.required<TaskColumns>();
  readonly dragDisabled = input(false);
  readonly editTask = output<Task>();
  readonly deleteTask = output<Task>();
  readonly moveTask = output<TaskStatusChange>();
  readonly dropped = output<TaskDropEvent>();
  readonly activeStatus = signal<TaskStatus>('todo');
  readonly tabButtonClass =
    'tw:min-h-[var(--touch-target)] tw:cursor-pointer tw:whitespace-nowrap tw:border-0 tw:border-b-2 tw:border-solid tw:border-transparent tw:bg-transparent tw:px-[var(--space-16)] tw:[font:inherit] tw:font-[var(--font-weight-medium)] tw:text-[var(--color-grey-46)] aria-selected:tw:[border-bottom-color:var(--color-azure-46)] aria-selected:tw:text-[var(--color-azure-46)] focus-visible:tw:!outline-2 focus-visible:tw:!outline-[var(--color-azure-46)] focus-visible:tw:![outline-offset:-2px]';

  selectStatus(status: TaskStatus): void {
    this.activeStatus.set(status);
  }

  onTabKeydown(event: KeyboardEvent, status: TaskStatus): void {
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
    const currentIndex = statuses.indexOf(status);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % statuses.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + statuses.length) % statuses.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = statuses.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextStatus = statuses[nextIndex];
    this.selectStatus(nextStatus);
    document.getElementById(`kanban-tab-${nextStatus}`)?.focus();
  }
}
