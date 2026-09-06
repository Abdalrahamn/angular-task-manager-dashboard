import { vi } from 'vitest';

vi.mock('chart.js', () => {
  class Chart {
    static register = vi.fn();
    destroy = vi.fn();
  }
  return {
    Chart,
    DoughnutController: class {},
    BarController: class {},
    ArcElement: class {},
    BarElement: class {},
    CategoryScale: class {},
    LinearScale: class {},
    Tooltip: class {},
    Legend: class {},
  };
});

import { TestBed } from '@angular/core/testing';
import { AnalyticsChart } from './analytics-chart.component';

describe('AnalyticsChart', () => {
  it('should render an accessible data table and accept type changes', async () => {
    await TestBed.configureTestingModule({ imports: [AnalyticsChart] }).compileComponents();
    const fixture = TestBed.createComponent(AnalyticsChart);
    fixture.componentRef.setInput('label', 'Tasks by status');
    fixture.componentRef.setInput('chartType', 'doughnut');
    fixture.componentRef.setInput('labels', ['To Do', 'Done']);
    fixture.componentRef.setInput('values', [1, 2]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.querySelector('caption')?.textContent).toContain(
      'Tasks by status',
    );
    expect(fixture.nativeElement.querySelector('table')?.textContent).toContain('To Do');
    expect(fixture.nativeElement.querySelector('table')?.textContent).toContain('2');
    fixture.componentRef.setInput('chartType', 'bar');
    fixture.componentRef.setInput('colors', ['#1976d2']);
    fixture.detectChanges();
    fixture.destroy();

    const empty = TestBed.createComponent(AnalyticsChart);
    empty.componentRef.setInput('label', 'Empty canvas');
    empty.componentRef.setInput('chartType', 'bar');
    empty.componentRef.setInput('labels', ['A']);
    empty.componentRef.setInput('values', [1]);
    empty.detectChanges();
    empty.nativeElement.querySelector('canvas')?.remove();
    empty.componentInstance['render']();
    empty.destroy();
  });
});
