import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class NormalizedHttpError extends Error {
  override readonly name = 'NormalizedHttpError';

  constructor(
    readonly status: number,
    message: string,
    readonly url: string | null,
    readonly method: string,
    readonly original: HttpErrorResponse,
  ) {
    super(message);
  }
}

export function normalizeHttpError(error: HttpErrorResponse, method: string): NormalizedHttpError {
  return new NormalizedHttpError(
    error.status,
    error.message || 'Unexpected request failure',
    error.url,
    method,
    error,
  );
}

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return throwError(() => normalizeHttpError(error, req.method));
      }

      return throwError(() => error);
    }),
  );
};
