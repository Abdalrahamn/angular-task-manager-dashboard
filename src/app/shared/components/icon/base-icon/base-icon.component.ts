import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-base-icon',
  standalone: true,
  template: '',
  host: {
    '[style.display]': "'inline-flex'",
    '[style.flex]': "'none'",
    '[style.align-items]': "'center'",
    '[style.justify-content]': "'center'",
    '[style.color]': "'inherit'",
    '[style.line-height]': "'0'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseIconComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('100%');
  readonly viewBox = input<string>('0 0 24 24');
  readonly fill = input<string>('none');
  readonly stroke = input<string>('currentColor');
  readonly iconClass = input.required<string>();
  readonly label = input<string | null>(null);
}
