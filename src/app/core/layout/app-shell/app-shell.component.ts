import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { TaskStoreService } from '../../../shared/data-access/task-store.service';
import { openTaskFormDialog } from '../../../shared/dialogs/open-task-dialogs';
import { Header } from '../header/header.component';
import { Sidebar } from '../sidebar/sidebar.component';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

@Component({
  selector: 'app-shell',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  readonly store = inject(TaskStoreService);
  readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly isDesktop = signal(this.mediaQuery.matches);
  readonly sidebarOpen = signal(false);

  constructor() {
    const onChange = (event: MediaQueryListEvent): void => {
      this.isDesktop.set(event.matches);
      if (event.matches) {
        this.sidebarOpen.set(false);
      }
    };

    this.mediaQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => {
      this.mediaQuery.removeEventListener('change', onChange);
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (!this.isDesktop()) {
          this.sidebarOpen.set(false);
        }
      });
  }

  onSearchChange(query: string): void {
    this.store.setSearch(query);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  openCreate(): void {
    this.closeSidebar();
    openTaskFormDialog(this.dialog);
  }
}
