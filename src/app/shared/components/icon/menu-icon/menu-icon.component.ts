import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseIconComponent } from '../base-icon/base-icon.component';

@Component({
  selector: 'app-menu-icon',
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
      data-icon="menu"
      [class]="iconClass()"
      style="display: block; overflow: visible"
    >
      <path
        d="M4 6h16M4 12h16M4 18h16"
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
export class MenuIconComponent extends BaseIconComponent {}
