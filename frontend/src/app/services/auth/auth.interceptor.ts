import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token;
    const isApiRequest = request.url.includes('/api/v1/');
    const isPublicAuthRequest = /\/api\/v1\/auth\/(login|signup)$/.test(request.url);
    const authenticatedRequest = token && isApiRequest && !isPublicAuthRequest;
    const authorizedRequest = authenticatedRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

    return next.handle(authorizedRequest).pipe(
      catchError((error: { status?: number; error?: { message?: unknown } }) => {
        // A 401 from a protected API means this browser session is no longer
        // valid (expired, logged out elsewhere, or deactivated). Clear local
        // state immediately so route guards cannot leave stale data visible.
        const message = typeof error.error?.message === 'string'
          ? error.error.message.toLowerCase()
          : '';
        const accountNoLongerUsable = error.status === 403
          && (message.includes('deactivated') || message.includes('pending approval'));
        if (authenticatedRequest && (error.status === 401 || accountNoLongerUsable)) {
          this.auth.logout();
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        return throwError(() => error);
      })
    );
  }
}
