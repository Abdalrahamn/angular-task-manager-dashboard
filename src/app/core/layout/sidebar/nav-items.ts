export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/team', label: 'Team', icon: '👥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];
