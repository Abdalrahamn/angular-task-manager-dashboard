import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivityPanel } from '../../../shared/components/activity-panel/activity-panel.component';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { MenuIconComponent } from '../../../shared/components/icon';
import { ActivityItem } from '../../../shared/models/activity.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ActivityPanel, IconButtonComponent, MenuIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly menuOpen = input(false);
  readonly showMenuButton = input(false);
  readonly search = input('');
  readonly activityItems = input<ActivityItem[]>([]);
  readonly tasksLoading = input(false);
  readonly tasksError = input<unknown>();
  readonly menuToggle = output<void>();
  readonly searchChange = output<string>();
  readonly retryTasks = output<void>();
  readonly activityOpen = signal(false);

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  toggleActivity(): void {
    this.activityOpen.update((open) => !open);
  }

  closeActivity(): void {
    this.activityOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeActivity();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeActivity();
    }
  }
}
