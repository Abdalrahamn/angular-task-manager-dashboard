import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
}
