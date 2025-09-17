import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { EmailActions } from '../../store/email/email.actions';
import { 
  selectEmailAccounts, 
  selectSelectedAccountId,
  selectCurrentFolder,
  selectUnreadCount
} from '../../store/email/email.selectors';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatButtonModule
  ],
  template: `
    <div class="sidebar-content">
      <!-- Account selector -->
      <div class="account-section">
        <h3 class="section-title">Accounts</h3>
        <mat-list>
          @for (account of accounts(); track account.id) {
            <mat-list-item 
              [class.selected]="account.id === selectedAccountId()"
              (click)="selectAccount(account.id)">
              <mat-icon matListItemIcon>email</mat-icon>
              <div matListItemTitle>{{ account.displayName || account.email }}</div>
              <div matListItemLine>{{ account.email }}</div>
            </mat-list-item>
          }
        </mat-list>
      </div>

      <mat-divider></mat-divider>

      <!-- Folders -->
      <div class="folders-section">
        <h3 class="section-title">Folders</h3>
        <mat-list>
          @for (folder of folders; track folder.name) {
            <mat-list-item 
              [class.selected]="folder.name === currentFolder()"
              (click)="selectFolder(folder.name)">
              <mat-icon matListItemIcon>{{ folder.icon }}</mat-icon>
              <div matListItemTitle>
                {{ folder.label }}
                @if (folder.name === 'INBOX' && unreadCount()) {
                  <span matBadge="{{ unreadCount() }}" matBadgeColor="warn" matBadgeSize="small"></span>
                }
              </div>
            </mat-list-item>
          }
        </mat-list>
      </div>

      <mat-divider></mat-divider>

      <!-- Quick actions -->
      <div class="actions-section">
        <h3 class="section-title">Quick Actions</h3>
        <div class="action-buttons">
          <button mat-stroked-button class="full-width" (click)="syncEmails()">
            <mat-icon>sync</mat-icon>
            Sync Emails
          </button>
          <button mat-stroked-button class="full-width" (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            Settings
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-content {
      height: 100%;
      overflow-y: auto;
      padding: 16px 0;
    }

    .section-title {
      margin: 0 16px 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .account-section,
    .folders-section,
    .actions-section {
      padding: 8px 0;
    }

    mat-list-item {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    mat-list-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    mat-list-item.selected {
      background-color: rgba(63, 81, 181, 0.12);
      color: #3f51b5;
    }

    mat-list-item.selected mat-icon {
      color: #3f51b5;
    }

    .action-buttons {
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-divider {
      margin: 8px 0;
    }
  `]
})
export class SidebarComponent implements OnInit {
  private store = inject(Store);

  accounts = this.store.selectSignal(selectEmailAccounts);
  selectedAccountId = this.store.selectSignal(selectSelectedAccountId);
  currentFolder = this.store.selectSignal(selectCurrentFolder);
  unreadCount = this.store.selectSignal(selectUnreadCount);

  folders = [
    { name: 'INBOX', label: 'Inbox', icon: 'inbox' },
    { name: 'SENT', label: 'Sent', icon: 'send' },
    { name: 'DRAFTS', label: 'Drafts', icon: 'drafts' },
    { name: 'SPAM', label: 'Spam', icon: 'report' },
    { name: 'TRASH', label: 'Trash', icon: 'delete' },
    { name: 'ARCHIVE', label: 'Archive', icon: 'archive' }
  ];

  ngOnInit(): void {
    // Load email accounts on init
    this.store.dispatch(EmailActions.loadAccounts());
  }

  selectAccount(accountId: string): void {
    this.store.dispatch(EmailActions.setSelectedAccount({ accountId }));
    this.loadEmails();
  }

  selectFolder(folder: string): void {
    this.store.dispatch(EmailActions.setCurrentFolder({ folder }));
    this.loadEmails();
  }

  private loadEmails(): void {
    const accountId = this.selectedAccountId();
    const folder = this.currentFolder();
    
    if (accountId) {
      this.store.dispatch(EmailActions.loadEmails({ 
        accountId, 
        params: { folder } 
      }));
    }
  }

  syncEmails(): void {
    this.loadEmails();
  }

  openSettings(): void {
    // Navigate to settings or open settings dialog
    console.log('Open settings');
  }
}