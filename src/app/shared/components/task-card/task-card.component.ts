import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Task, TaskStatusChange } from '../../models/task.model';
import { assigneeHandle } from '../../utils/user.utils';
import { isTaskOverdue, taskCardStatus, taskCategory } from '../../utils/task.utils';
import { UserAvatar } from '../user-avatar/user-avatar.component';
import { MoreVerticalIconComponent } from '../icon';

const STATUS_ICONS: Record<'warning' | 'check_circle' | 'calendar_month', string> = {
  warning: '⚠️',
  check_circle: '✅',
  calendar_month: '📅',
};

@Component({
  selector: 'app-task-card',
  imports: [UserAvatar, MatMenuModule, MoreVerticalIconComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly task = input.required<Task>();
  readonly edit = output<Task>();
  readonly remove = output<Task>();
  readonly move = output<TaskStatusChange>();

  readonly overdue = computed(() => isTaskOverdue(this.task()));
  readonly completed = computed(() => this.task().status === 'done');
  readonly category = computed(() => taskCategory(this.task()));
  readonly handle = computed(() => assigneeHandle(this.task().assignee.name));
  readonly status = computed(() => taskCardStatus(this.task()));
  readonly statusIcon = computed(() => STATUS_ICONS[this.status().icon]);
}
