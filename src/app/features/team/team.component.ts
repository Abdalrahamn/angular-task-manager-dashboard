import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { EmptyState } from '../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../shared/components/error-state/error-state.component';
import { Skeleton } from '../../shared/components/skeleton/skeleton.component';
import { UserAvatar } from '../../shared/components/user-avatar/user-avatar.component';
import { TaskStoreService } from '../../shared/data-access/task-store.service';

@Component({
  selector: 'app-team',
  imports: [EmptyState, ErrorState, Skeleton, UserAvatar],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Team {
  readonly store = inject(TaskStoreService);
  readonly members = computed(() => this.store.analyticsSeries().byAssignee);
}
