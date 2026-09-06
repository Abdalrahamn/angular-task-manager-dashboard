import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseIconComponent } from '../base-icon/base-icon.component';

@Component({
  selector: 'app-check-circle-icon',
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
      data-icon="check-circle"
      [class]="iconClass()"
      style="display: block; overflow: visible"
    >
      <path
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 12l2.7 2.7L16.5 9"
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
export class CheckCircleIconComponent extends BaseIconComponent {}
