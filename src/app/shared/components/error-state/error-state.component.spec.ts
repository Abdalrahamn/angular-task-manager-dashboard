import { TestBed } from '@angular/core/testing';
import { ErrorState } from './error-state.component';

describe('ErrorState', () => {
  it('should use default copy and emit retry', async () => {
    await TestBed.configureTestingModule({ imports: [ErrorState] }).compileComponents();
    const fixture = TestBed.createComponent(ErrorState);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('The data could not be loaded.');

    let retried = false;
    fixture.componentInstance.retry.subscribe(() => {
      retried = true;
    });
    fixture.nativeElement.querySelector('button').click();
    expect(retried).toBe(true);
  });

  it('should render custom copy', async () => {
    await TestBed.configureTestingModule({ imports: [ErrorState] }).compileComponents();
    const fixture = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('title', 'Failed');
    fixture.componentRef.setInput('message', 'Try again.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Failed');
    expect(fixture.nativeElement.textContent).toContain('Try again.');
  });
});
