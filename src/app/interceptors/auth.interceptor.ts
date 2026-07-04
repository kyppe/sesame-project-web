import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

/**
 * HTTP interceptor that:
 * 1. Attaches Authorization header to all API requests
 * 2. Handles 401 errors by attempting token refresh
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const api = inject(ApiService);

  // Don't intercept auth endpoints to avoid infinite loops
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const token = auth.getAccessToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = auth.getRefreshToken();
        if (refreshToken) {
          return api.refreshToken(refreshToken).pipe(
            switchMap((tokens) => {
              auth.updateTokens(tokens.access_token, tokens.refresh_token);
              // Retry original request with new token
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.access_token}` }
              });
              return next(retryReq);
            }),
            catchError(() => {
              auth.logout();
              return throwError(() => error);
            })
          );
        } else {
          auth.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
