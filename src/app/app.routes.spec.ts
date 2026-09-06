import { Routes } from '@angular/router';
import { AppShell } from './core/layout/app-shell/app-shell.component';
import { routes } from './app.routes';

describe('application routes', () => {
  it('defines the shell, default redirect, feature paths, and fallback', () => {
    expect(routes[0].component).toBe(AppShell);
    expect(routes[0].children?.[0]).toEqual({
      path: '',
      pathMatch: 'full',
      redirectTo: 'dashboard',
    });
    expect(routes[0].children?.slice(1).map((route) => route.path)).toEqual([
      'dashboard',
      'tasks',
      'analytics',
      'team',
      'calendar',
      'settings',
    ]);
    expect(routes[1]).toEqual({ path: '**', redirectTo: 'dashboard' });
  });

  it('loads every lazy route and its standalone component', async () => {
    const featureRoutes = routes[0].children?.slice(1) ?? [];

    for (const featureRoute of featureRoutes) {
      expect(typeof featureRoute.loadChildren).toBe('function');
      const loadedRoutes = (await featureRoute.loadChildren!()) as Routes;
      expect(loadedRoutes).toHaveLength(1);
      expect(loadedRoutes[0].path).toBe('');
      expect(typeof loadedRoutes[0].loadComponent).toBe('function');
      await expect(loadedRoutes[0].loadComponent!()).resolves.toBeTypeOf('function');
    }
  });
});
