import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Statistic } from '../../models/statistic.model';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly statistic = input.required<Statistic>();
}
