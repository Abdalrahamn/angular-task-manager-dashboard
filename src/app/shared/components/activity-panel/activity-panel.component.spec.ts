import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ErrorState } from '../error-state/error-state.component';
import { ActivityPanel } from './activity-panel.component';

describe('ActivityPanel', () => {
  it('should show an empty state when there are no items', async () => {
    await TestBed.configureTestingModule({ imports: [ActivityPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ActivityPanel);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No recent activity');
  });

  it('should list activity descriptions', async () => {
    await TestBed.configureTestingModule({ imports: [ActivityPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ActivityPanel);
    fixture.componentRef.setInput('items', [
      {
        id: 'a1',
        action: 'create',
        taskId: 'task-001',
        title: 'Homepage',
        at: '2099-01-01T00:00:00.000Z',
      },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Created');
    expect(fixture.nativeElement.textContent).toContain('Homepage');
  });

  it('should distinguish loading and error states and emit retry', async () => {
    await TestBed.configureTestingModule({ imports: [ActivityPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ActivityPanel);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('No recent activity');

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', new Error('raw HTTP error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Couldn't load activity");
    expect(fixture.nativeElement.textContent).not.toContain('raw HTTP error');

    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    fixture.debugElement.query(By.directive(ErrorState)).componentInstance.retry.emit();
    expect(retried).toBe(true);
  });
});
