import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectionModel } from '@angular/cdk/collections';

import { EmailActions } from '../../../store/email/email.actions';
import { 
  selectFilteredEmails, 
  selectEmailLoading, 
  selectSelectedAccountId,
  selectCurrentFolder
} from '../../../store/email/email.selectors';
import { EmailMessage } from '../../../core/models/email.model';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    ScrollingModule
  ],
  template: `
    <div class="email-list-container">
      <!-- List header -->
      <div class="list-header">
        <div class="header-actions">
          <mat-checkbox 
            [checked]="allSelected()"
            [indeterminate]="someSelected()"
            (change)="toggleAllSelection($event.checked)">
          </mat-checkbox>
          
          @if (hasSelection()) {
            <button mat-icon-button 
                    [matMenuTriggerFor]="bulkMenu"
                    matTooltip="Bulk actions">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #bulkMenu="matMenu">
              <button mat-menu-item (click)="markSelectedAsRead(true)">
                <mat-icon>mark_email_read</mat-icon>
                Mark as read
              </button>
              <button mat-menu-item (click)="markSelectedAsRead(false)">
                <mat-icon>mark_email_unread</mat-icon>
                Mark as unread
              </button>
              <button mat-menu-item (click)="deleteSelected()">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-menu>
          }
        </div>

        <div class="header-info">
          @if (emails().length > 0) {
            <span class="email-count">{{ emails().length }} emails</span>
          }
        </div>

        <div class="header-controls">
          <button mat-icon-button 
                  (click)="refreshEmails()"
                  matTooltip="Refresh"
                  [disabled]="isLoading()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Email list -->
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading emails...</p>
        </div>
      } @else if (emails().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">inbox</mat-icon>
          <h3>No emails found</h3>
          <p>Your {{ currentFolder() }} folder is empty.</p>
        </div>
      } @else {
        <cdk-virtual-scroll-viewport 
          itemSize="80" 
          class="email-viewport">
          @for (email of emails(); track email.id) {
            <div class="email-item"
                 [class.unread]="!email.isRead"
                 [class.selected]="selection.isSelected(email.id)"
                 (click)="openEmail(email)">
              
              <mat-checkbox 
                [checked]="selection.isSelected(email.id)"
                (change)="toggleSelection(email.id, $event.checked)"
                (click)="$event.stopPropagation()">
              </mat-checkbox>

              <button mat-icon-button 
                      [color]="email.isFlagged ? 'warn' : ''"
                      (click)="toggleFlag(email, $event)"
                      matTooltip="Flag">
                <mat-icon>{{ email.isFlagged ? 'flag' : 'flag_outlined' }}</mat-icon>
              </button>

              <div class="email-content">
                <div class="email-header">
                  <span class="from-name">{{ email.fromName || email.fromAddress }}</span>
                  <span class="email-date">{{ formatDate(email.receivedAt) }}</span>
                </div>
                
                <div class="email-subject">
                  {{ email.subject || '(No subject)' }}
                </div>
                
                <div class="email-preview">
                  {{ getEmailPreview(email) }}
                </div>
              </div>

              <div class="email-actions">
                <button mat-icon-button 
                        [matMenuTriggerFor]="emailMenu"
                        (click)="$event.stopPropagation()"
                        matTooltip="More actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #emailMenu="matMenu">
                  <button mat-menu-item (click)="markAsRead(email, !email.isRead)">
                    <mat-icon>{{ email.isRead ? 'mark_email_unread' : 'mark_email_read' }}</mat-icon>
                    {{ email.isRead ? 'Mark as unread' : 'Mark as read' }}
                  </button>
                  <button mat-menu-item (click)="toggleFlag(email, $event)">
                    <mat-icon>{{ email.isFlagged ? 'flag_outlined' : 'flag' }}</mat-icon>
                    {{ email.isFlagged ? 'Remove flag' : 'Add flag' }}
                  </button>
                  <button mat-menu-item (click)="deleteEmail(email)">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>

                @if (!email.isRead) {
                  <div class="unread-indicator"></div>
                }
              </div>
            </div>
          }
        </cdk-virtual-scroll-viewport>
      }
    </div>
  `,
  styles: [`
    .email-list-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .list-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      background: white;
      z-index: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-info {
      flex: 1;
      text-align: center;
    }

    .email-count {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .email-viewport {
      flex: 1;
      height: calc(100vh - 200px);
    }

    .email-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: background-color 0.2s ease;
      gap: 12px;
      min-height: 80px;
    }

    .email-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .email-item.selected {
      background-color: rgba(63, 81, 181, 0.08);
    }

    .email-item.unread {
      background-color: rgba(63, 81, 181, 0.02);
      border-left: 3px solid #3f51b5;
    }

    .email-content {
      flex: 1;
      min-width: 0;
    }

    .email-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .from-name {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email-date {
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      white-space: nowrap;
    }

    .email-subject {
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email-item.unread .email-subject {
      font-weight: 600;
    }

    .email-preview {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #3f51b5;
    }

    @media (max-width: 768px) {
      .email-item {
        padding: 8px 12px;
      }
      
      .email-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }
      
      .email-date {
        align-self: flex-end;
      }
    }
  `]
})
export class EmailListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  emails = this.store.selectSignal(selectFilteredEmails);
  isLoading = this.store.selectSignal(selectEmailLoading);
  selectedAccountId = this.store.selectSignal(selectSelectedAccountId);
  currentFolder = this.store.selectSignal(selectCurrentFolder);

  selection = new SelectionModel<string>(true, []);
  
  allSelected = computed(() => 
    this.emails().length > 0 && this.selection.selected.length === this.emails().length
  );
  
  someSelected = computed(() => 
    this.selection.selected.length > 0 && !this.allSelected()
  );
  
  hasSelection = computed(() => this.selection.selected.length > 0);

  ngOnInit(): void {
    this.loadEmailsIfNeeded();
  }

  private loadEmailsIfNeeded(): void {
    const accountId = this.selectedAccountId();
    const folder = this.currentFolder();
    
    if (accountId) {
      this.store.dispatch(EmailActions.loadEmails({ 
        accountId, 
        params: { folder } 
      }));
    }
  }

  refreshEmails(): void {
    this.loadEmailsIfNeeded();
  }

  openEmail(email: EmailMessage): void {
    this.store.dispatch(EmailActions.setSelectedEmail({ email }));
    this.router.navigate(['/emails', email.id]);
    
    // Mark as read when opened
    if (!email.isRead) {
      this.markAsRead(email, true);
    }
  }

  markAsRead(email: EmailMessage, isRead: boolean): void {
    this.store.dispatch(EmailActions.markAsRead({ id: email.id, isRead }));
  }

  toggleFlag(email: EmailMessage, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(EmailActions.toggleFlag({ 
      id: email.id, 
      isFlagged: !email.isFlagged 
    }));
  }

  deleteEmail(email: EmailMessage): void {
    this.store.dispatch(EmailActions.deleteEmail({ id: email.id }));
  }

  toggleSelection(emailId: string, checked: boolean): void {
    if (checked) {
      this.selection.select(emailId);
    } else {
      this.selection.deselect(emailId);
    }
  }

  toggleAllSelection(checked: boolean): void {
    if (checked) {
      this.emails().forEach(email => this.selection.select(email.id));
    } else {
      this.selection.clear();
    }
  }

  markSelectedAsRead(isRead: boolean): void {
    this.selection.selected.forEach(id => {
      this.store.dispatch(EmailActions.markAsRead({ id, isRead }));
    });
    this.selection.clear();
  }

  deleteSelected(): void {
    this.selection.selected.forEach(id => {
      this.store.dispatch(EmailActions.deleteEmail({ id }));
    });
    this.selection.clear();
  }

  formatDate(date: Date): string {
    const now = new Date();
    const emailDate = new Date(date);
    const diffInHours = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return emailDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  getEmailPreview(email: EmailMessage): string {
    const preview = email.textBody || email.htmlBody?.replace(/<[^>]*>/g, '') || '';
    return preview.substring(0, 100);
  }
}