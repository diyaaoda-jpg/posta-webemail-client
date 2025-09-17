import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthToken } from '../../store/auth/auth.selectors';
import { first, switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  
  // Skip authentication for account setup endpoints
  const skipAuthUrls = [
    '/api/accounts/discover',
    '/api/accounts/test',
    '/api/accounts' // This covers POST to /api/accounts for account creation
  ];
  
  const shouldSkipAuth = skipAuthUrls.some(url => 
    req.url.includes(url) && (
      req.url === url || // Exact match
      req.url.startsWith(url + '/') || // Path with additional segments
      req.url.startsWith(url + '?') // Path with query parameters
    )
  );
  
  if (shouldSkipAuth) {
    return next(req);
  }
  
  return store.select(selectAuthToken).pipe(
    first(),
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
      }
      return next(req);
    })
  );
};