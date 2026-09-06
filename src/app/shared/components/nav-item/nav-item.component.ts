import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type NavItemVariant = 'default' | 'muted' | 'active';

/** Reusable navigation item with a hard-coded display icon and semantic label. */
@Component({
  selector: 'app-nav-item',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavItemComponent {
  readonly path = input.required<string>();
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly variant = input<NavItemVariant>('default');
  readonly exact = input(true);
}
