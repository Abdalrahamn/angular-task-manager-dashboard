import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AddIconComponent } from '../../../shared/components/icon';
import { NavItemComponent } from '../../../shared/components/nav-item/nav-item.component';
import { NAV_ITEMS } from './nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [AddIconComponent, NavItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly open = input(false);
  readonly create = output<void>();
  readonly navItems = NAV_ITEMS;
}
