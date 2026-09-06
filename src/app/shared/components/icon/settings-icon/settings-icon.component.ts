import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseIconComponent } from '../base-icon/base-icon.component';

@Component({
  selector: 'app-settings-icon',
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
      data-icon="settings"
      [class]="iconClass()"
      style="display: block; overflow: visible"
    >
      <path
        d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L15 3.3h-4L10.6 6a8 8 0 0 0-1.7 1L6.4 6l-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1l.4 2.7h4l.4-2.7a8 8 0 0 0 1.7-1l2.5 1 2-3.4-2.2-1.6ZM16 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
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
export class SettingsIconComponent extends BaseIconComponent {}
