import { TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card.component';

describe('StatCard', () => {
  it('should render statistic values and change type', async () => {
    await TestBed.configureTestingModule({ imports: [StatCard] }).compileComponents();
    const fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('statistic', {
      id: 'stat-001',
      title: 'Total Tasks',
      icon: '📊',
      value: 156,
      change: '+12',
      changeLabel: 'this week',
      changeType: 'positive',
      color: '#1976D2',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Total Tasks');
    expect(fixture.nativeElement.textContent).toContain('156');
    expect(fixture.nativeElement.querySelector('[data-type="positive"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.stat-card__icon').textContent.trim()).toBe('📊');
  });

  it('should hide a zero change while keeping its data-provided label', async () => {
    await TestBed.configureTestingModule({ imports: [StatCard] }).compileComponents();
    const fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('statistic', {
      id: 'stat-003',
      title: 'In Progress',
      icon: '🔄',
      value: 42,
      change: '0',
      changeLabel: 'Same as yesterday',
      changeType: 'neutral',
      color: '#FF6F00',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.stat-card__change').textContent.trim()).toBe(
      'Same as yesterday',
    );
  });
});
