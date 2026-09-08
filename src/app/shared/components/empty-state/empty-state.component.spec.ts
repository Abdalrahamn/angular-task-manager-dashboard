import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state.component';

describe('EmptyState', () => {
  it('should render the title and optional message', async () => {
    await TestBed.configureTestingModule({ imports: [EmptyState] }).compileComponents();
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('title', 'No tasks yet');
    fixture.componentRef.setInput('message', 'Create one to start.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No tasks yet');
    expect(fixture.nativeElement.textContent).toContain('Create one to start.');
  });

  it('should omit the message paragraph when empty', async () => {
    await TestBed.configureTestingModule({ imports: [EmptyState] }).compileComponents();
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('title', 'Empty');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('p')).toHaveLength(1);
  });
});
