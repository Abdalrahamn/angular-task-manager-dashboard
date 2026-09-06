import { TestBed } from '@angular/core/testing';
import { Skeleton } from './skeleton.component';

describe('Skeleton', () => {
  it('should default to the line variant', async () => {
    await TestBed.configureTestingModule({ imports: [Skeleton] }).compileComponents();
    const fixture = TestBed.createComponent(Skeleton);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-variant="line"]')).toBeTruthy();
  });

  it('should render stat and task variants', async () => {
    await TestBed.configureTestingModule({ imports: [Skeleton] }).compileComponents();
    const fixture = TestBed.createComponent(Skeleton);
    fixture.componentRef.setInput('variant', 'stat-card');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-variant="stat-card"]')).toBeTruthy();

    fixture.componentRef.setInput('variant', 'task-card');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-variant="task-card"]')).toBeTruthy();
  });
});
