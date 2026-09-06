import {
  HttpClient,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HTTP_GET_CACHE_TTL_MS, HttpGetCache, cacheInterceptor } from './cache.interceptor';

describe('HttpGetCache', () => {
  it('should miss, hit, expire, and invalidate only a matching resource', () => {
    TestBed.configureTestingModule({});
    const cache = TestBed.inject(HttpGetCache);
    expect(cache.get('/tasks')).toBeNull();

    cache.set('/tasks', new HttpResponse({ body: [1], url: '/tasks' }));
    expect(cache.get('/tasks')?.body).toEqual([1]);

    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now + HTTP_GET_CACHE_TTL_MS + 1);
    expect(cache.get('/tasks')).toBeNull();
    vi.restoreAllMocks();

    cache.set('/tasks?status=todo', new HttpResponse({ body: [2], url: '/tasks?status=todo' }));
    cache.set('/statistics', new HttpResponse({ body: [3], url: '/statistics' }));
    cache.invalidateResource('/tasks');
    expect(cache.get('/tasks')).toBeNull();
    expect(cache.get('/tasks?status=todo')).toBeNull();
    expect(cache.get('/statistics')?.body).toEqual([3]);
  });
});

describe('cacheInterceptor', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      controller: TestBed.inject(HttpTestingController),
    };
  }

  it('should serve a cached GET and skip the network on the second call', () => {
    const { http, controller } = setup();
    const bodies: unknown[] = [];

    http.get('/tasks').subscribe((body) => bodies.push(body));
    controller.expectOne('/tasks').flush([{ id: '1' }]);
    http.get('/tasks').subscribe((body) => bodies.push(body));

    controller.expectNone('/tasks');
    expect(bodies).toEqual([[{ id: '1' }], [{ id: '1' }]]);
  });

  it('should retry a failed GET once', () => {
    const { http, controller } = setup();
    let body: unknown;
    http.get('/tasks').subscribe((value) => {
      body = value;
    });

    const first = controller.expectOne('/tasks');
    first.flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    const second = controller.expectOne('/tasks');
    second.flush([{ id: '1' }]);
    expect(body).toEqual([{ id: '1' }]);
  });

  it('should not retry a failed POST', () => {
    const { http, controller } = setup();
    let failed = false;
    http.post('/tasks', { title: 'x' }).subscribe({
      error: () => {
        failed = true;
      },
    });
    controller
      .expectOne('/tasks')
      .flush({ message: 'fail' }, { status: 500, statusText: 'Server' });
    controller.expectNone('/tasks');
    expect(failed).toBe(true);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'] as const)(
    'should pass a %s mutation through without globally invalidating cached GETs',
    (method) => {
      const { http, controller } = setup();
      http.get('/tasks').subscribe();
      controller.expectOne('/tasks').flush([{ id: '1' }]);

      if (method === 'POST') {
        http.post('/tasks', { id: '2' }).subscribe();
      } else if (method === 'PUT') {
        http.put('/tasks/1', { id: '1' }).subscribe();
      } else if (method === 'PATCH') {
        http.patch('/tasks/1', { status: 'done' }).subscribe();
      } else {
        http.delete('/tasks/1').subscribe();
      }

      controller.expectOne((req) => req.method === method).flush({ id: '1' });
      http.get('/tasks').subscribe();
      controller.expectNone('/tasks');
    },
  );

  it('should pass through non-GET non-mutation requests', () => {
    const { http, controller } = setup();
    let status = 0;
    http.head('/tasks').subscribe(() => {
      status = 200;
    });
    controller.expectOne('/tasks').flush(null, { status: 200, statusText: 'OK' });
    expect(status).toBe(200);
  });
});
