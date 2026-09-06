import { Routes } from '@angular/router';
import { AppShell } from './core/layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'tasks',
        loadChildren: () => import('./features/tasks/tasks.routes').then((m) => m.tasksRoutes),
      },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./features/analytics/analytics.routes').then((m) => m.analyticsRoutes),
      },
      {
        path: 'team',
        loadChildren: () => import('./features/team/team.routes').then((m) => m.teamRoutes),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/placeholders/calendar/calendar.routes').then((m) => m.calendarRoutes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/placeholders/settings/settings.routes').then((m) => m.settingsRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
