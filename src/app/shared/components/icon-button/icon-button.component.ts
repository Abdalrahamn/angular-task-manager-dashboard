import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Reusable Figma Component 1: icon-only control and its visual variants. */
@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  readonly ariaLabel = input.required<string>();
  readonly variant = input<'bare' | 'ghost' | 'primary' | 'primary-compact' | 'outlined'>('bare');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false);
  readonly clicked = output<MouseEvent>();
}
