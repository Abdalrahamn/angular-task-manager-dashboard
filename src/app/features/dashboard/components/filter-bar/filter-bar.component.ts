import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StatusTab } from '../../../../shared/models/task-filter.model';
import { TaskPriority } from '../../../../shared/models/task.model';
import { Assignee } from '../../../../shared/models/user.model';
import { AddIconComponent } from '../../../../shared/components/icon';

@Component({
  selector: 'app-filter-bar',
  imports: [AddIconComponent],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  readonly statusTab = input.required<StatusTab>();
  readonly priority = input<TaskPriority | null>(null);
  readonly assigneeId = input<string | null>(null);
  readonly assignees = input<Assignee[]>([]);
  readonly canClear = input(false);

  readonly statusTabChange = output<StatusTab>();
  readonly priorityChange = output<TaskPriority | null>();
  readonly assigneeIdChange = output<string | null>();
  readonly clear = output<void>();
  readonly create = output<void>();

  readonly tabs: { id: StatusTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ];

  onPriorityChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.priorityChange.emit(value === '' ? null : (value as TaskPriority));
  }

  onAssigneeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.assigneeIdChange.emit(value === '' ? null : value);
  }
}
