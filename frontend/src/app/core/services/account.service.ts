import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  AutodiscoverRequest,
  AutodiscoverResponse,
  ManualDiscoverRequest,
  TestConnectionRequest,
  TestConnectionResponse,
  AccountCreationRequest,
  AccountCreationResponse,
  EmailAccount
} from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Email Server Discovery
  discoverEmailServer(request: AutodiscoverRequest): Observable<AutodiscoverResponse> {
    return this.http.post<AutodiscoverResponse>(`${this.apiUrl}/api/accounts/discover`, request);
  }

  discoverManualServer(request: ManualDiscoverRequest): Observable<AutodiscoverResponse> {
    return this.http.post<AutodiscoverResponse>(`${this.apiUrl}/api/accounts/discover/manual`, request);
  }

  // Connection Testing
  testConnection(request: TestConnectionRequest): Observable<TestConnectionResponse> {
    return this.http.post<TestConnectionResponse>(`${this.apiUrl}/api/accounts/test`, request);
  }

  // Account Management
  createAccount(request: AccountCreationRequest): Observable<AccountCreationResponse> {
    return this.http.post<AccountCreationResponse>(`${this.apiUrl}/api/accounts`, request);
  }

  getAccounts(): Observable<EmailAccount[]> {
    return this.http.get<{ accounts: EmailAccount[] }>(`${this.apiUrl}/api/accounts`)
      .pipe(
        // Transform the response to extract just the accounts array
        map((response: any) => response.accounts || response)
      );
  }

  getAccount(accountId: string): Observable<EmailAccount> {
    return this.http.get<{ account: EmailAccount }>(`${this.apiUrl}/api/accounts/${accountId}`)
      .pipe(
        // Transform the response to extract just the account
        map((response: any) => response.account || response)
      );
  }

  updateAccount(accountId: string, updates: Partial<EmailAccount>): Observable<EmailAccount> {
    return this.http.put<EmailAccount>(`${this.apiUrl}/api/accounts/${accountId}`, updates);
  }

  deleteAccount(accountId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/api/accounts/${accountId}`);
  }

  // Account Status Operations
  activateAccount(accountId: string): Observable<{ success: boolean }> {
    return this.updateAccount(accountId, { isActive: true }).pipe(
      map(() => ({ success: true }))
    );
  }

  deactivateAccount(accountId: string): Observable<{ success: boolean }> {
    return this.updateAccount(accountId, { isActive: false }).pipe(
      map(() => ({ success: true }))
    );
  }

  // Sync Operations (for future implementation)
  syncAccount(accountId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/api/accounts/${accountId}/sync`, 
      {}
    );
  }

  getAccountSyncStatus(accountId: string): Observable<{ isActive: boolean; lastSyncAt?: Date }> {
    return this.http.get<{ isActive: boolean; lastSyncAt?: Date }>(
      `${this.apiUrl}/api/accounts/${accountId}/sync-status`
    );
  }
}