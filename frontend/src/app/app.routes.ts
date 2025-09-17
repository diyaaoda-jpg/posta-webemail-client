import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/accounts/add',
    pathMatch: 'full'
  },
  {
    path: 'emails',
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
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'accounts',
    children: [
      {
        path: 'add',
        loadComponent: () => import('./features/accounts/add-account/add-account.component').then(m => m.AddAccountComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/accounts/add'
  }
];
