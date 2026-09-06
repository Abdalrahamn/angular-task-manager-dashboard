import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Assignee } from '../../models/user.model';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatar {
  readonly assignee = input.required<Assignee>();
  readonly size = input<'sm' | 'md'>('sm');
}
