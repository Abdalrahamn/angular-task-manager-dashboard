import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { openTaskFormDialog } from '../../shared/dialogs/open-task-dialogs';
import { AddIconComponent } from '../../shared/components/icon';

@Component({
  selector: 'app-tasks',
  imports: [AddIconComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tasks {
  private readonly dialog = inject(MatDialog);

  openCreate(): void {
    openTaskFormDialog(this.dialog);
  }
}
