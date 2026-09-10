import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { retry, tap } from 'rxjs/operators';

/** GET cache TTL in ms. Short so list data stays reasonably fresh without extra architecture. */
export const HTTP_GET_CACHE_TTL_MS = 30_000;

/** GET retries after the first failure. Writes are never auto-retried. */
const HTTP_GET_RETRY_COUNT = 1;

interface CacheEntry {
  expiresAt: number;
  response: HttpResponse<unknown>;
}

@Injectable({ providedIn: 'root' })
export class HttpGetCache {
  private readonly entries = new Map<string, CacheEntry>();

  get(key: string): HttpResponse<unknown> | null {
    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }

    return entry.response.clone();
  }

  set(key: string, response: HttpResponse<unknown>): void {
    this.entries.set(key, {
      expiresAt: Date.now() + HTTP_GET_CACHE_TTL_MS,
      response: response.clone(),
    });
  }

  /**
   * Removes only representations of a resource (its collection and item URLs).
   * Mutating `/tasks` must not evict an unrelated future GET such as `/users`.
   */
  invalidateResource(resourceUrl: string): void {
    for (const key of this.entries.keys()) {
      if (
        key === resourceUrl ||
        key.startsWith(`${resourceUrl}?`) ||
        key.startsWith(`${resourceUrl}/`)
      ) {
        this.entries.delete(key);
      }
    }
  }
}

export const cacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const cache = inject(HttpGetCache);

  if (req.method !== 'GET') {
    return next(req);
  }

  const cached = cache.get(req.urlWithParams);
  if (cached) {
    return of(cached);
  }

  return next(req).pipe(
    retry(HTTP_GET_RETRY_COUNT),
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, event);
      }
    }),
  );
};
