import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  EmailMessage, 
  EmailAccount, 
  EmailListParams, 
  EmailListResponse 
} from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getEmails(accountId: string, params?: EmailListParams): Observable<EmailListResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.folder) httpParams = httpParams.set('folder', params.folder);
    }

    return this.http.get<EmailListResponse>(
      `${this.apiUrl}/api/emails/account/${accountId}`,
      { params: httpParams }
    );
  }

  getEmail(id: string): Observable<EmailMessage> {
    return this.http.get<EmailMessage>(`${this.apiUrl}/api/emails/${id}`);
  }

  markAsRead(id: string, isRead: boolean): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/api/emails/${id}/read`, isRead);
  }

  toggleFlag(id: string, isFlagged: boolean): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/api/emails/${id}/flag`, isFlagged);
  }

  deleteEmail(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/api/emails/${id}`);
  }

  getAccounts(): Observable<EmailAccount[]> {
    return this.http.get<EmailAccount[]>(`${this.apiUrl}/api/accounts`);
  }

  // Email composition methods (for future implementation)
  sendEmail(emailData: any): Observable<EmailMessage> {
    return this.http.post<EmailMessage>(`${this.apiUrl}/api/emails/send`, emailData);
  }

  saveDraft(draftData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/emails/drafts`, draftData);
  }

  getDrafts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/emails/drafts`);
  }

  // Search methods
  searchEmails(accountId: string, query: string): Observable<EmailMessage[]> {
    const params = new HttpParams()
      .set('search', query)
      .set('limit', '100');
    
    return this.http.get<EmailMessage[]>(
      `${this.apiUrl}/api/emails/account/${accountId}/search`,
      { params }
    );
  }

  // Folder management
  getFolders(accountId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/api/accounts/${accountId}/folders`);
  }

  moveToFolder(emailId: string, folder: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/api/emails/${emailId}/folder`,
      { folder }
    );
  }
}