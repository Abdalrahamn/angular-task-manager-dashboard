import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state.component';
import { TaskCard } from '../../../../shared/components/task-card/task-card.component';
import { TaskDropEvent } from '../../../../shared/models/kanban.model';
import { Task, TaskStatus, TaskStatusChange } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-kanban-column',
  imports: [TaskCard, EmptyState, CdkDropList, CdkDrag],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumn {
  readonly title = input.required<string>();
  readonly status = input.required<TaskStatus>();
  readonly tasks = input<Task[]>([]);
  readonly dragDisabled = input(false);
  readonly editTask = output<Task>();
  readonly deleteTask = output<Task>();
  readonly moveTask = output<TaskStatusChange>();
  readonly dropped = output<TaskDropEvent>();

  onDrop(event: CdkDragDrop<Task[]>): void {
    this.dropped.emit({
      task: event.item.data,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      fromStatus: event.previousContainer.id as TaskStatus,
      toStatus: this.status(),
    });
  }
}
