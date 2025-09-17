import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EmailActions } from '../../../store/email/email.actions';
import { selectSelectedEmail, selectEmailLoading } from '../../../store/email/email.selectors';
import { UIActions } from '../../../store/ui/ui.actions';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="email-detail-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading email...</p>
        </div>
      } @else if (email()) {
        <!-- Email actions bar -->
        <div class="email-actions-bar">
          <div class="nav-actions">
            <button mat-icon-button 
                    (click)="goBack()"
                    matTooltip="Back to list">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </div>

          <div class="email-actions">
            <button mat-icon-button 
                    (click)="reply()"
                    matTooltip="Reply">
              <mat-icon>reply</mat-icon>
            </button>
            
            <button mat-icon-button 
                    (click)="replyAll()"
                    matTooltip="Reply all">
              <mat-icon>reply_all</mat-icon>
            </button>
            
            <button mat-icon-button 
                    (click)="forward()"
                    matTooltip="Forward">
              <mat-icon>forward</mat-icon>
            </button>
            
            <button mat-icon-button 
                    [color]="email()!.isFlagged ? 'warn' : ''"
                    (click)="toggleFlag()"
                    matTooltip="Flag">
              <mat-icon>{{ email()!.isFlagged ? 'flag' : 'flag_outlined' }}</mat-icon>
            </button>
            
            <button mat-icon-button 
                    [matMenuTriggerFor]="moreMenu"
                    matTooltip="More actions">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #moreMenu="matMenu">
              <button mat-menu-item (click)="markAsRead(!email()!.isRead)">
                <mat-icon>{{ email()!.isRead ? 'mark_email_unread' : 'mark_email_read' }}</mat-icon>
                {{ email()!.isRead ? 'Mark as unread' : 'Mark as read' }}
              </button>
              <button mat-menu-item (click)="moveToFolder('ARCHIVE')">
                <mat-icon>archive</mat-icon>
                Archive
              </button>
              <button mat-menu-item (click)="moveToFolder('SPAM')">
                <mat-icon>report</mat-icon>
                Mark as spam
              </button>
              <button mat-menu-item (click)="deleteEmail()">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Email content -->
        <div class="email-content">
          <mat-card class="email-card">
            <!-- Email header -->
            <div class="email-header">
              <div class="header-main">
                <h2 class="email-subject">{{ email()!.subject || '(No subject)' }}</h2>
                
                <div class="sender-info">
                  <div class="sender-details">
                    <span class="sender-name">{{ email()!.fromName || email()!.fromAddress }}</span>
                    <span class="sender-email">&lt;{{ email()!.fromAddress }}&gt;</span>
                  </div>
                  <div class="email-meta">
                    <span class="email-date">{{ formatDateTime(email()!.receivedAt) }}</span>
                    @if (!email()!.isRead) {
                      <mat-chip class="unread-chip">Unread</mat-chip>
                    }
                    @if (email()!.isFlagged) {
                      <mat-chip color="warn" class="flagged-chip">Flagged</mat-chip>
                    }
                  </div>
                </div>

                <!-- Recipients -->
                <div class="recipients">
                  <div class="recipient-row">
                    <span class="recipient-label">To:</span>
                    <span class="recipient-value">{{ email()!.toAddresses }}</span>
                  </div>
                  @if (email()!.ccAddresses) {
                    <div class="recipient-row">
                      <span class="recipient-label">CC:</span>
                      <span class="recipient-value">{{ email()!.ccAddresses }}</span>
                    </div>
                  }
                  @if (email()!.bccAddresses) {
                    <div class="recipient-row">
                      <span class="recipient-label">BCC:</span>
                      <span class="recipient-value">{{ email()!.bccAddresses }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Email body -->
            <div class="email-body">
              @if (email()!.htmlBody) {
                <div class="html-body" [innerHTML]="sanitizeHtml(email()!.htmlBody!)"></div>
              } @else if (email()!.textBody) {
                <div class="text-body">{{ email()!.textBody }}</div>
              } @else {
                <div class="no-content">This email has no content to display.</div>
              }
            </div>

            <!-- Attachments -->
            @if (email()!.attachments && email()!.attachments!.length > 0) {
              <mat-divider></mat-divider>
              <div class="attachments-section">
                <h4 class="attachments-title">
                  <mat-icon>attachment</mat-icon>
                  Attachments ({{ email()!.attachments!.length }})
                </h4>
                <div class="attachments-list">
                  @for (attachment of email()!.attachments!; track attachment.id) {
                    <div class="attachment-item">
                      <mat-icon>insert_drive_file</mat-icon>
                      <div class="attachment-info">
                        <span class="attachment-name">{{ attachment.fileName }}</span>
                        <span class="attachment-size">{{ formatFileSize(attachment.fileSize) }}</span>
                      </div>
                      <button mat-icon-button matTooltip="Download">
                        <mat-icon>download</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </mat-card>

          <!-- Quick reply area -->
          <div class="quick-reply-area">
            <button mat-raised-button 
                    color="primary" 
                    (click)="reply()"
                    class="reply-button">
              <mat-icon>reply</mat-icon>
              Reply
            </button>
            <button mat-stroked-button (click)="replyAll()">
              <mat-icon>reply_all</mat-icon>
              Reply All
            </button>
            <button mat-stroked-button (click)="forward()">
              <mat-icon>forward</mat-icon>
              Forward
            </button>
          </div>
        </div>
      } @else {
        <div class="no-email">
          <mat-icon class="no-email-icon">mail_outline</mat-icon>
          <h3>Email not found</h3>
          <p>The requested email could not be loaded.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Go Back
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .email-detail-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #fafafa;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 16px;
    }

    .email-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: white;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      z-index: 1;
    }

    .nav-actions,
    .email-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .email-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .email-card {
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .email-header {
      padding: 24px;
    }

    .email-subject {
      margin: 0 0 16px 0;
      font-size: 1.5rem;
      font-weight: 500;
      line-height: 1.3;
    }

    .sender-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .sender-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sender-name {
      font-weight: 500;
      font-size: 1rem;
    }

    .sender-email {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
    }

    .email-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .email-date {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
    }

    .unread-chip {
      background-color: #3f51b5;
      color: white;
    }

    .flagged-chip {
      background-color: #f44336;
      color: white;
    }

    .recipients {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .recipient-row {
      display: flex;
      gap: 8px;
      font-size: 0.875rem;
    }

    .recipient-label {
      color: rgba(0, 0, 0, 0.6);
      min-width: 30px;
      font-weight: 500;
    }

    .recipient-value {
      color: rgba(0, 0, 0, 0.87);
      word-break: break-word;
    }

    .email-body {
      padding: 24px;
      line-height: 1.6;
    }

    .html-body {
      word-wrap: break-word;
    }

    .html-body img {
      max-width: 100%;
      height: auto;
    }

    .text-body {
      white-space: pre-wrap;
      font-family: monospace;
    }

    .no-content {
      color: rgba(0, 0, 0, 0.6);
      font-style: italic;
      text-align: center;
      padding: 32px;
    }

    .attachments-section {
      padding: 24px;
    }

    .attachments-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      background: #fafafa;
    }

    .attachment-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .attachment-name {
      font-weight: 500;
    }

    .attachment-size {
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .quick-reply-area {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .reply-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .no-email {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-email-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .email-content {
        padding: 8px;
      }
      
      .email-header {
        padding: 16px;
      }
      
      .email-body {
        padding: 16px;
      }
      
      .sender-info {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .quick-reply-area {
        flex-direction: column;
      }
    }
  `]
})
export class EmailDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private sanitizer = inject(DomSanitizer);

  email = this.store.selectSignal(selectSelectedEmail);
  isLoading = this.store.selectSignal(selectEmailLoading);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const emailId = params['id'];
      if (emailId) {
        this.store.dispatch(EmailActions.loadEmail({ id: emailId }));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/emails']);
  }

  reply(): void {
    this.store.dispatch(UIActions.openComposeDialog());
    // TODO: Implement reply functionality
  }

  replyAll(): void {
    this.store.dispatch(UIActions.openComposeDialog());
    // TODO: Implement reply all functionality
  }

  forward(): void {
    this.store.dispatch(UIActions.openComposeDialog());
    // TODO: Implement forward functionality
  }

  toggleFlag(): void {
    const currentEmail = this.email();
    if (currentEmail) {
      this.store.dispatch(EmailActions.toggleFlag({ 
        id: currentEmail.id, 
        isFlagged: !currentEmail.isFlagged 
      }));
    }
  }

  markAsRead(isRead: boolean): void {
    const currentEmail = this.email();
    if (currentEmail) {
      this.store.dispatch(EmailActions.markAsRead({ 
        id: currentEmail.id, 
        isRead 
      }));
    }
  }

  deleteEmail(): void {
    const currentEmail = this.email();
    if (currentEmail) {
      this.store.dispatch(EmailActions.deleteEmail({ id: currentEmail.id }));
      this.goBack();
    }
  }

  moveToFolder(folder: string): void {
    // TODO: Implement folder move functionality
    console.log('Move to folder:', folder);
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}