import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { EmptyState } from '../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../shared/components/error-state/error-state.component';
import { Skeleton } from '../../shared/components/skeleton/skeleton.component';
import { TaskStoreService } from '../../shared/data-access/task-store.service';
import { AnalyticsChart } from './components/analytics-chart.component';

@Component({
  selector: 'app-analytics',
  imports: [DecimalPipe, PercentPipe, EmptyState, ErrorState, Skeleton, AnalyticsChart],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Analytics {
  readonly store = inject(TaskStoreService);
  readonly series = computed(() => this.store.analyticsSeries());

  readonly statusLabels = ['To Do', 'In Progress', 'Done'];
  readonly priorityLabels = ['High', 'Medium', 'Low'];

  readonly statusValues = computed(() => {
    const byStatus = this.series().byStatus;
    return [byStatus.todo, byStatus.in_progress, byStatus.done];
  });

  readonly priorityValues = computed(() => {
    const byPriority = this.series().byPriority;
    return [byPriority.high, byPriority.medium, byPriority.low];
  });

  readonly assigneeLabels = computed(() =>
    this.series().byAssignee.map((row) => row.assignee.name),
  );
  readonly assigneeValues = computed(() => this.series().byAssignee.map((row) => row.total));
}
