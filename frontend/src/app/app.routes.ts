import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/emails',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'emails',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/email/email-list/email-list.component').then(m => m.EmailListComponent)
      },
      {
        path: 'compose',
        loadComponent: () => import('./features/email/compose/compose-email.component').then(m => m.ComposeEmailComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/email/email-detail/email-detail.component').then(m => m.EmailDetailComponent)
      }
    ]
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    children: [
      {
        path: 'add',
        loadComponent: () => import('./features/accounts/add-account/add-account.component').then(m => m.AddAccountComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/emails'
  }
];
