import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ActivityItem } from '../../models/activity.model';
import { activityDescription } from '../../utils/activity.utils';
import { EmptyState } from '../empty-state/empty-state.component';
import { ErrorState } from '../error-state/error-state.component';
import { Skeleton } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-activity-panel',
  imports: [DatePipe, EmptyState, ErrorState, Skeleton],
  templateUrl: './activity-panel.component.html',
  styleUrl: './activity-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityPanel {
  readonly items = input<ActivityItem[]>([]);
  readonly loading = input(false);
  readonly error = input<unknown>();
  readonly retry = output<void>();

  description(item: ActivityItem): string {
    return activityDescription(item);
  }
}
