import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar.component';

describe('Sidebar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render every nav destination and New Task', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const labels = [...el.querySelectorAll('.nav-item__label')].map((node) =>
      node.textContent?.trim(),
    );
    expect(labels).toEqual(['Dashboard', 'Tasks', 'Calendar', 'Analytics', 'Team', 'Settings']);
    expect(
      [...el.querySelectorAll('.nav-item__icon')].map((node) => node.textContent?.trim()),
    ).toEqual(['📊', '✅', '📅', '📈', '👥', '⚙️']);
    expect(el.querySelector('button')?.textContent).toContain('New Task');
    expect(el.querySelector('button app-add-icon svg')?.getAttribute('data-icon')).toBe('add');
    expect(el.querySelector('aside')?.hasAttribute('inert')).toBe(false);
    expect(el.querySelector('aside')?.hasAttribute('aria-hidden')).toBe(false);

    let created = false;
    fixture.componentInstance.create.subscribe(() => {
      created = true;
    });
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(created).toBe(true);
  });

  it('should keep the closed class off when closed', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('aside')?.hasAttribute('inert'),
    ).toBe(true);
  });
});
