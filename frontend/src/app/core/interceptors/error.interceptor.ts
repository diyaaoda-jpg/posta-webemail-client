import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthActions } from '../../store/auth/auth.actions';
import { UIActions } from '../../store/ui/ui.actions';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      // Handle different error types
      switch (error.status) {
        case 0:
          // Network error
          errorMessage = 'Network error - please check your connection';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 400:
          // Bad Request
          errorMessage = error.error?.message || 'Invalid request data';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 401:
          // Unauthorized - clear auth state and redirect
          errorMessage = 'Your session has expired. Please log in again.';
          store.dispatch(AuthActions.logout());
          store.dispatch(UIActions.showError({ message: errorMessage }));
          router.navigate(['/auth/login']);
          break;

        case 403:
          // Forbidden
          errorMessage = 'You do not have permission to access this resource';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 404:
          // Not Found
          errorMessage = 'The requested resource was not found';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 409:
          // Conflict
          errorMessage = error.error?.message || 'A conflict occurred';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 422:
          // Validation Error
          errorMessage = error.error?.message || 'Validation failed';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 429:
          // Too Many Requests
          errorMessage = 'Too many requests. Please try again later.';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 500:
          // Internal Server Error
          errorMessage = 'Server error. Please try again later.';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        case 503:
          // Service Unavailable
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          store.dispatch(UIActions.showError({ message: errorMessage }));
          break;

        default:
          // Other errors
          errorMessage = error.error?.message || `HTTP ${error.status}: ${error.statusText}`;
          store.dispatch(UIActions.showError({ message: errorMessage }));
      }

      // Enhanced logging with more context
      const logData = {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
        message: error.error?.message || error.message,
        traceId: error.error?.traceId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      console.group('🚨 HTTP Error');
      console.error('Request Details:', {
        url: req.url,
        method: req.method,
        headers: req.headers
      });
      console.error('Error Details:', logData);
      console.error('Full Error Object:', error);
      console.groupEnd();

      // Report to external logging service in production
      if (!req.url.includes('localhost')) {
        // reportErrorToLoggingService(logData);
      }

      return throwError(() => error);
    })
  );
};