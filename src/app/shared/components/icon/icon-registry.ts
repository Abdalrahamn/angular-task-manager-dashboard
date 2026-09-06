import { Type } from '@angular/core';
import { BaseIconComponent } from './base-icon/base-icon.component';
import { AddIconComponent } from './add-icon/add-icon.component';
import { AnalyticsIconComponent } from './analytics-icon/analytics-icon.component';
import { BarChartIconComponent } from './bar-chart-icon/bar-chart-icon.component';
import { BrandIconComponent } from './brand-icon/brand-icon.component';
import { CalendarIconComponent } from './calendar-icon/calendar-icon.component';
import { CheckBoxIconComponent } from './check-box-icon/check-box-icon.component';
import { CheckCircleIconComponent } from './check-circle-icon/check-circle-icon.component';
import { DashboardIconComponent } from './dashboard-icon/dashboard-icon.component';
import { MenuIconComponent } from './menu-icon/menu-icon.component';
import { MoreVerticalIconComponent } from './more-vertical-icon/more-vertical-icon.component';
import { NotificationsIconComponent } from './notifications-icon/notifications-icon.component';
import { ProgressIconComponent } from './progress-icon/progress-icon.component';
import { SearchIconComponent } from './search-icon/search-icon.component';
import { SettingsIconComponent } from './settings-icon/settings-icon.component';
import { TasksIconComponent } from './tasks-icon/tasks-icon.component';
import { TeamIconComponent } from './team-icon/team-icon.component';
import { WarningIconComponent } from './warning-icon/warning-icon.component';

export const ICON_COMPONENTS = {
  add: AddIconComponent,
  analytics: AnalyticsIconComponent,
  'bar-chart': BarChartIconComponent,
  brand: BrandIconComponent,
  calendar: CalendarIconComponent,
  'check-box': CheckBoxIconComponent,
  'check-circle': CheckCircleIconComponent,
  dashboard: DashboardIconComponent,
  menu: MenuIconComponent,
  'more-vertical': MoreVerticalIconComponent,
  notifications: NotificationsIconComponent,
  progress: ProgressIconComponent,
  search: SearchIconComponent,
  settings: SettingsIconComponent,
  tasks: TasksIconComponent,
  team: TeamIconComponent,
  warning: WarningIconComponent,
} as const satisfies Record<string, Type<BaseIconComponent>>;

export type IconComponentName = keyof typeof ICON_COMPONENTS;
