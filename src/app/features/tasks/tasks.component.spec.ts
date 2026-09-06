import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { Tasks } from './tasks.component';

describe('Tasks', () => {
  it('should render the tasks heading and open create', async () => {
    await TestBed.configureTestingModule({
      imports: [Tasks, MatDialogModule],
      providers: [provideAnimations()],
    }).compileComponents();
    const fixture = TestBed.createComponent(Tasks);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Tasks');

    const dialog = TestBed.inject(MatDialog);
    const open = vi.spyOn(dialog, 'open').mockReturnValue({ close: vi.fn() } as never);
    fixture.nativeElement.querySelector('button').click();
    expect(open).toHaveBeenCalled();
  });
});
