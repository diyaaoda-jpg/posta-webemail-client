import { ApplicationConfig, importProvidersFrom, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideServiceWorker } from '@angular/service-worker';
import { AppInitializationService } from './core/services/app-initialization.service';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { appReducers } from './store/app.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { EmailEffects } from './store/email/email.effects';
import { AccountsEffects } from './store/accounts/accounts.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideStore(appReducers),
    provideEffects([AuthEffects, EmailEffects, AccountsEffects]),
    // Only provide DevTools in development mode for security
    ...(isDevMode() ? [provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75
    })] : []),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (appInit: AppInitializationService) => () => appInit.initializeApp(),
      deps: [AppInitializationService],
      multi: true
    }
  ]
};
