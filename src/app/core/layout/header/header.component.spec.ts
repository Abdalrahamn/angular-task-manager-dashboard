import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header.component';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the brand, search, bell, and avatar', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.header__brand')?.textContent).toContain('Task Manager');
    expect(el.querySelector('input[type="search"]')).toBeTruthy();
    expect(el.querySelector('label')?.textContent).toContain('🔍');
    expect(el.querySelector('button[aria-label="Recent activity"]')).toBeTruthy();
    expect(el.querySelector('[aria-label="John Doe"]')?.textContent).toContain('JD');
    expect(el.querySelector('button[aria-controls="app-sidebar"]')).toBeNull();
  });

  it('should emit menuToggle when the menu button is clicked', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('showMenuButton', true);
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.menuToggle.subscribe(() => {
      emitted = true;
    });

    const menu = fixture.nativeElement.querySelector(
      'button[aria-controls="app-sidebar"]',
    ) as HTMLButtonElement;
    menu.click();
    expect(emitted).toBe(true);

    expect(menu.getAttribute('aria-label')).toBe('Open navigation');
    fixture.componentRef.setInput('menuOpen', true);
    fixture.detectChanges();
    expect(menu.getAttribute('aria-label')).toBe('Close navigation');
    expect(menu.getAttribute('aria-expanded')).toBe('true');
  });

  it('should emit search changes and toggle the activity panel', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('activityItems', [
      {
        id: 'a1',
        action: 'create',
        taskId: 't1',
        title: 'Task',
        at: '2099-01-01T00:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    let search = '';
    fixture.componentInstance.searchChange.subscribe((value) => {
      search = value;
    });
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'homepage';
    input.dispatchEvent(new Event('input'));
    expect(search).toBe('homepage');

    fixture.nativeElement.querySelector('button[aria-label="Recent activity"]').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activityOpen()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Recent activity');

    fixture.componentInstance.onDocumentClick({
      target: fixture.nativeElement,
    } as unknown as MouseEvent);
    expect(fixture.componentInstance.activityOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activityOpen()).toBe(false);

    fixture.componentInstance.activityOpen.set(true);
    fixture.componentInstance.onDocumentClick(new MouseEvent('click'));
    expect(fixture.componentInstance.activityOpen()).toBe(false);
  });

  it('should forward activity retry requests', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('tasksError', new Error('failed'));
    fixture.detectChanges();
    let retried = false;
    fixture.componentInstance.retryTasks.subscribe(() => (retried = true));
    fixture.nativeElement.querySelector('button[aria-label="Recent activity"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('app-error-state button').click();
    expect(retried).toBe(true);
  });
});
