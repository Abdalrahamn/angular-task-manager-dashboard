import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseIconComponent } from '../base-icon/base-icon.component';

@Component({
  selector: 'app-brand-icon',
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
      data-icon="brand"
      [class]="iconClass()"
      style="display: block; overflow: visible"
    >
      <rect width="24" height="24" rx="5" fill="var(--color-azure-46)" />
      <path
        d="M9 7.5h6M9 11h6M9 14.5h4.5"
        fill="none"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9 5.5h6v2H9zM7.5 6.5h-1v12h11v-12h-1"
        fill="none"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandIconComponent extends BaseIconComponent {}
