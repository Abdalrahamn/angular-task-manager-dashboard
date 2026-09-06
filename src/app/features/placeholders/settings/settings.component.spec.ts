import { TestBed } from '@angular/core/testing';
import { Settings } from './settings.component';

describe('Settings', () => {
  it('should render the settings heading', async () => {
    await TestBed.configureTestingModule({ imports: [Settings] }).compileComponents();
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Settings');
  });
});
