import { TestBed } from '@angular/core/testing';
import { Calendar } from './calendar.component';

describe('Calendar', () => {
  it('should render the calendar heading', async () => {
    await TestBed.configureTestingModule({ imports: [Calendar] }).compileComponents();
    const fixture = TestBed.createComponent(Calendar);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Calendar');
  });
});
