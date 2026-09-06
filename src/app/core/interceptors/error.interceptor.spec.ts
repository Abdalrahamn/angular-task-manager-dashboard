import {
  HttpClient,
  HttpErrorResponse,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { NormalizedHttpError, errorInterceptor, normalizeHttpError } from './error.interceptor';

describe('normalizeHttpError', () => {
  it('should keep status, url, and method', () => {
    const original = new HttpErrorResponse({ status: 500, statusText: 'Server', url: '/tasks' });
    const normalized = normalizeHttpError(original, 'GET');
    expect(normalized).toBeInstanceOf(NormalizedHttpError);
    expect(normalized.status).toBe(500);
    expect(normalized.url).toBe('/tasks');
    expect(normalized.method).toBe('GET');
    expect(normalized.original).toBe(original);
    expect(normalized.message.length).toBeGreaterThan(0);
  });

  it('should fall back when the HTTP error has no message', () => {
    const original = new HttpErrorResponse({ status: 0, statusText: '' });
    Object.defineProperty(original, 'message', { value: '' });
    expect(normalizeHttpError(original, 'GET').message).toBe('Unexpected request failure');
  });
});

describe('errorInterceptor', () => {
  it('should not notify on a failed GET', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const notifications = TestBed.inject(NotificationService);

    let captured: unknown;
    http.get('/tasks').subscribe({
      error: (error: unknown) => {
        captured = error;
      },
    });
    controller
      .expectOne('/tasks')
      .flush({ message: 'nope' }, { status: 500, statusText: 'Server' });

    expect(captured).toBeInstanceOf(NormalizedHttpError);
    expect(notifications.message()).toBeNull();
    controller.verify();
  });

  it('should not notify on a failed mutation either', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const notifications = TestBed.inject(NotificationService);

    http.post('/tasks', {}).subscribe({ error: () => undefined });
    controller.expectOne('/tasks').flush({ message: 'nope' }, { status: 400, statusText: 'Bad' });

    expect(notifications.message()).toBeNull();
  });

  it('should keep a non-HTTP error unchanged', () => {
    let captured: unknown;
    errorInterceptor(new HttpRequest('GET', '/tasks'), () => throwError(() => 'boom')).subscribe({
      error: (error: unknown) => {
        captured = error;
      },
    });
    expect(captured).toBe('boom');
  });
});
