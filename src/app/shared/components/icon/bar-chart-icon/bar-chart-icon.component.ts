import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseIconComponent } from '../base-icon/base-icon.component';

@Component({
  selector: 'app-bar-chart-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      [attr.width]="width()"
      [attr.height]="height()"
      [attr.viewBox]="viewBox()"
      [attr.fill]="fill()"
      [attr.stroke]="stroke()"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.aria-label]="label()"
      [attr.role]="label() ? 'img' : null"
      data-icon="bar-chart"
      [class]="iconClass()"
      style="display: block; overflow: visible"
    >
      <path
        d="M5.5 20v-7M12 20V9M18.5 20V5"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartIconComponent extends BaseIconComponent {}
