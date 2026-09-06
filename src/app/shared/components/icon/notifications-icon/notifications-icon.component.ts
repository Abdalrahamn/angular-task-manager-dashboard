import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseIconComponent } from '../base-icon/base-icon.component';

@Component({
  selector: 'app-notifications-icon',
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
      data-icon="notifications"
      [class]="iconClass()"
      style="display: block; overflow: visible"
    >
      <path
        d="M12 2a2 2 0 0 0-2 2v.35A6 6 0 0 0 6 10v3.2l-1.6 2.4A1 1 0 0 0 5.24 17h13.52a1 1 0 0 0 .84-1.4L18 13.2V10a6 6 0 0 0-4-5.65V4a2 2 0 0 0-2-2Zm-2.25 17a2.25 2.25 0 0 0 4.5 0h-4.5Z"
        fill="var(--color-orange-48)"
        stroke="none"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsIconComponent extends BaseIconComponent {}
