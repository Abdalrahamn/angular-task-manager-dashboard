import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: '../placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendar {}
