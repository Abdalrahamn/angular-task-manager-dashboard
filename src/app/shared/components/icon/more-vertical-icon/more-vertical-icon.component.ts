import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseIconComponent } from '../base-icon/base-icon.component';

@Component({
  selector: 'app-more-vertical-icon',
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
      data-icon="more-vertical"
      [class]="iconClass()"
      style="display: block; overflow: visible"
    >
      <path
        d="M12 5h.01M12 12h.01M12 19h.01"
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
export class MoreVerticalIconComponent extends BaseIconComponent {}
