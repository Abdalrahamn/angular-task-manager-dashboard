import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import {
  Chart,
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-analytics-chart',
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsChart {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly label = input.required<string>();
  readonly chartType = input<'doughnut' | 'bar'>('doughnut');
  readonly labels = input.required<string[]>();
  readonly values = input.required<number[]>();
  readonly colors = input<string[]>(['#1976d2', '#f57c00', '#388e3c', '#d32f2f', '#757575']);

  private chart: Chart | undefined;

  constructor() {
    afterNextRender(() => this.render());
    effect(() => {
      this.labels();
      this.values();
      this.chartType();
      this.colors();
      this.render();
    });
    this.destroyRef.onDestroy(() => this.chart?.destroy());
  }

  private render(): void {
    const canvas = this.host.nativeElement.querySelector('canvas');
    if (!canvas) {
      return;
    }

    this.chart?.destroy();
    this.chart = new Chart(canvas, {
      type: this.chartType(),
      data: {
        labels: this.labels(),
        datasets: [
          {
            label: this.label(),
            data: this.values(),
            backgroundColor: this.colors(),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } },
        },
      },
    });
  }
}
