import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ICON_COMPONENTS, IconComponentName } from '../icon-registry';

@Component({
  selector: 'app-dynamic-icon',
  standalone: true,
  imports: [NgComponentOutlet],
  template: ` <ng-container *ngComponentOutlet="component(); inputs: componentInputs()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicIconComponent {
  readonly name = input.required<IconComponentName>();
  readonly width = input<string>('100%');
  readonly height = input<string>('100%');
  readonly viewBox = input<string>('0 0 24 24');
  readonly fill = input<string>('none');
  readonly stroke = input<string>('currentColor');
  readonly iconClass = input.required<string>();
  readonly label = input<string | null>(null);

  readonly component = computed(() => ICON_COMPONENTS[this.name()]);
  readonly componentInputs = computed(() => ({
    width: this.width(),
    height: this.height(),
    viewBox: this.viewBox(),
    fill: this.fill(),
    stroke: this.stroke(),
    iconClass: this.iconClass(),
    label: this.label(),
  }));
}
