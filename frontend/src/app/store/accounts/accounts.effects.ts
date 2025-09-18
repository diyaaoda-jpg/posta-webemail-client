import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AccountService } from '../../core/services/account.service';
import { AccountsActions } from './accounts.actions';
import { 
  AutodiscoverRequest, 
  ManualDiscoverRequest, 
  TestConnectionRequest, 
  AccountCreationRequest 
} from '../../core/models/email.model';

@Injectable()
export class AccountsEffects {
  private actions$ = inject(Actions);
  private accountService = inject(AccountService);
  private router = inject(Router);

  // Email Autodiscovery
  submitEmailForDiscovery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.submitEmailForDiscovery),
      switchMap(({ emailAddress }) => {
        const request: AutodiscoverRequest = { emailAddress };
        
        return this.accountService.discoverEmailServer(request).pipe(
          map((response) => {
            // Check the actual success field in the response, not just HTTP status
            if (response.success) {
              return AccountsActions.emailDiscoverySuccess({ response });
            } else {
              return AccountsActions.emailDiscoveryFailure({ 
                error: response.errorMessage || 'Failed to discover email server settings'
              });
            }
          }),
          catchError((error) =>
            of(AccountsActions.emailDiscoveryFailure({ 
              error: error.message || 'Failed to discover email server settings' 
            }))
          )
        );
      })
    )
  );

  // Manual Discovery
  submitManualDiscovery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.submitManualDiscovery),
      switchMap(({ emailAddress, serverInput }) => {
        const request: ManualDiscoverRequest = { emailAddress, serverInput };
        
        return this.accountService.discoverManualServer(request).pipe(
          map((response) => {
            // Check the actual success field in the response, not just HTTP status
            if (response.success) {
              return AccountsActions.manualDiscoverySuccess({ response });
            } else {
              return AccountsActions.manualDiscoveryFailure({ 
                error: response.errorMessage || 'Failed to discover server settings manually'
              });
            }
          }),
          catchError((error) =>
            of(AccountsActions.manualDiscoveryFailure({ 
              error: error.message || 'Failed to discover server settings manually' 
            }))
          )
        );
      })
    )
  );

  // Auto-trigger connection test after credentials submission
  submitCredentials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.submitCredentials),
      map(() => AccountsActions.testConnection())
    )
  );

  // Connection Testing
  testConnection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.testConnection),
      switchMap(() =>
        // We'll need to get the current setup state from the store
        // For now, this is a placeholder - we'll need to inject Store
        this.accountService.testConnection({} as TestConnectionRequest).pipe(
          map((response) => AccountsActions.testConnectionSuccess({ response })),
          catchError((error) =>
            of(AccountsActions.testConnectionFailure({ 
              error: error.message || 'Connection test failed' 
            }))
          )
        )
      )
    )
  );

  // Account Creation
  createAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.createAccount),
      switchMap(() =>
        // We'll need to construct the request from the setup state
        this.accountService.createAccount({} as AccountCreationRequest).pipe(
          map((response) => AccountsActions.createAccountSuccess({ response })),
          catchError((error) =>
            of(AccountsActions.createAccountFailure({ 
              error: error.message || 'Failed to create account' 
            }))
          )
        )
      )
    )
  );

  // Account Management
  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.loadAccounts),
      switchMap(() =>
        this.accountService.getAccounts().pipe(
          map((accounts) => AccountsActions.loadAccountsSuccess({ accounts })),
          catchError((error) =>
            of(AccountsActions.loadAccountsFailure({ 
              error: error.message || 'Failed to load accounts' 
            }))
          )
        )
      )
    )
  );

  loadAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.loadAccount),
      switchMap(({ accountId }) =>
        this.accountService.getAccount(accountId).pipe(
          map((account) => AccountsActions.loadAccountSuccess({ account })),
          catchError((error) =>
            of(AccountsActions.loadAccountFailure({ 
              error: error.message || 'Failed to load account' 
            }))
          )
        )
      )
    )
  );

  updateAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.updateAccount),
      mergeMap(({ accountId, updates }) =>
        this.accountService.updateAccount(accountId, updates).pipe(
          map((account) => AccountsActions.updateAccountSuccess({ account })),
          catchError((error) =>
            of(AccountsActions.updateAccountFailure({ 
              error: error.message || 'Failed to update account' 
            }))
          )
        )
      )
    )
  );

  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.deleteAccount),
      mergeMap(({ accountId }) =>
        this.accountService.deleteAccount(accountId).pipe(
          map(() => AccountsActions.deleteAccountSuccess({ accountId })),
          catchError((error) =>
            of(AccountsActions.deleteAccountFailure({ 
              error: error.message || 'Failed to delete account' 
            }))
          )
        )
      )
    )
  );

  // Navigation Effects
  accountCreatedNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.createAccountSuccess),
      tap(() => {
        // Navigate to inbox or settings after successful account creation
        this.router.navigate(['/emails']);
      })
    ), 
    { dispatch: false }
  );

  // Auto-load accounts after successful creation
  refreshAccountsAfterCreation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.createAccountSuccess),
      map(() => AccountsActions.loadAccounts())
    )
  );

  // Auto-load accounts after deletion
  refreshAccountsAfterDeletion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountsActions.deleteAccountSuccess),
      map(() => AccountsActions.loadAccounts())
    )
  );
}