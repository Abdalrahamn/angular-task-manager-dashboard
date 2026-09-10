import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { routes } from '../../../app.routes';
import { environment } from '../../../../environments/environment';
import { cacheInterceptor } from '../../interceptors/cache.interceptor';
import { errorInterceptor } from '../../interceptors/error.interceptor';
import { NotificationService } from '../../services/notification.service';
import { AppShell } from './app-shell.component';
import { Header } from '../header/header.component';

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const media = {
    matches,
    media: '(min-width: 1024px)',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: (_type: string, listener: EventListener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_type: string, listener: EventListener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    dispatchEvent: () => true,
    notify(next: boolean): void {
      this.matches = next;
      listeners.forEach((listener) => {
        listener({ matches: next } as MediaQueryListEvent);
      });
    },
  };

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: () => media,
  });
  return media;
}

describe('AppShell', () => {
  async function setup(matches: boolean) {
    const media = stubMatchMedia(matches);
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AppShell);
    TestBed.tick();
    http.expectOne(`${environment.apiBaseUrl}/tasks`).flush([]);
    http.expectOne(`${environment.apiBaseUrl}/statistics`).flush([]);
    TestBed.tick();
    fixture.detectChanges();
    return { fixture, media, router: TestBed.inject(Router), http };
  }

  it('should hide the overlay menu on desktop', async () => {
    const { fixture } = await setup(true);
    expect(fixture.componentInstance.isDesktop()).toBe(true);
    expect(fixture.nativeElement.querySelector('button[aria-controls="app-sidebar"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.shell__backdrop')).toBeNull();
  });

  it('should toggle and close the overlay sidebar below desktop', async () => {
    const { fixture } = await setup(false);
    const shell = fixture.componentInstance;

    expect(shell.isDesktop()).toBe(false);
    expect(shell.sidebarOpen()).toBe(false);

    (
      fixture.nativeElement.querySelector(
        'button[aria-controls="app-sidebar"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(shell.sidebarOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.shell__backdrop')).toBeTruthy();

    fixture.nativeElement.querySelector('.shell__backdrop').click();
    fixture.detectChanges();
    expect(shell.sidebarOpen()).toBe(false);

    shell.toggleSidebar();
    fixture.detectChanges();
    shell.closeSidebar();
    expect(shell.sidebarOpen()).toBe(false);
  });

  it('should close the overlay when the viewport becomes desktop', async () => {
    const { fixture, media } = await setup(false);
    fixture.componentInstance.toggleSidebar();
    expect(fixture.componentInstance.sidebarOpen()).toBe(true);

    media.notify(true);
    expect(fixture.componentInstance.isDesktop()).toBe(true);
    expect(fixture.componentInstance.sidebarOpen()).toBe(false);
  });

  it('should keep the overlay closed when shrinking below desktop', async () => {
    const { fixture, media } = await setup(true);
    media.notify(false);
    expect(fixture.componentInstance.isDesktop()).toBe(false);
    expect(fixture.componentInstance.sidebarOpen()).toBe(false);
  });

  it('should close the overlay after a mobile navigation', async () => {
    const { fixture, router } = await setup(false);
    fixture.componentInstance.toggleSidebar();
    expect(fixture.componentInstance.sidebarOpen()).toBe(true);

    await router.navigateByUrl('/tasks');
    fixture.detectChanges();
    expect(fixture.componentInstance.sidebarOpen()).toBe(false);
  });

  it('should not close a desktop sidebar flag on navigation', async () => {
    const { fixture, router } = await setup(true);
    fixture.componentInstance.sidebarOpen.set(true);
    await router.navigateByUrl('/team');
    expect(fixture.componentInstance.sidebarOpen()).toBe(true);
  });

  it('should open create from the sidebar and dismiss the snackbar', async () => {
    const { fixture } = await setup(false);
    fixture.componentInstance.toggleSidebar();
    const dialog = TestBed.inject(MatDialog);
    const open = vi.spyOn(dialog, 'open').mockReturnValue({ close: vi.fn() } as never);
    fixture.nativeElement.querySelector('app-sidebar button').click();
    expect(open).toHaveBeenCalled();
    expect(fixture.componentInstance.sidebarOpen()).toBe(false);

    TestBed.inject(NotificationService).show('Saved');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Saved');
    fixture.nativeElement.querySelector('.snackbar__dismiss').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.snackbar')).toBeNull();

    const search = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'homepage';
    search.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.store.search()).toBe('homepage');
  });

  it('should retry task reads from the activity panel', async () => {
    const { fixture } = await setup(false);
    const retry = vi.spyOn(fixture.componentInstance.store, 'retryReads');
    const header = fixture.debugElement.query(By.directive(Header)).componentInstance as Header;
    header.retryTasks.emit();
    expect(retry).toHaveBeenCalledOnce();
  });
});
