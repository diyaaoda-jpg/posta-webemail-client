import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { selectUser } from '../../store/auth/auth.selectors';
import { selectUnreadCount } from '../../store/email/email.selectors';
import { selectTheme } from '../../store/ui/ui.selectors';
import { UIActions } from '../../store/ui/ui.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <!-- Menu button for mobile -->
      @if (isMobile) {
        <button mat-icon-button 
                (click)="menuToggle.emit()"
                matTooltip="Open menu"
                aria-label="Open menu">
          <mat-icon>menu</mat-icon>
        </button>
      }

      <!-- App title -->
      <span class="app-title">
        <mat-icon class="app-icon">mail</mat-icon>
        POSTA
      </span>

      <!-- Spacer -->
      <div class="spacer"></div>

      <!-- Actions -->
      <div class="header-actions">
        <!-- Compose button -->
        <button mat-raised-button 
                color="accent"
                (click)="openCompose()"
                class="compose-btn">
          <mat-icon>edit</mat-icon>
          Compose
        </button>

        <!-- Notifications -->
        <button mat-icon-button 
                [matBadge]="unreadCount() || null"
                matBadgeColor="warn"
                [matBadgeHidden]="!unreadCount()"
                matTooltip="Unread emails"
                aria-label="Unread emails">
          <mat-icon>notifications</mat-icon>
        </button>

        <!-- Theme toggle -->
        <button mat-icon-button 
                (click)="toggleTheme()"
                [matTooltip]="theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                aria-label="Toggle theme">
          <mat-icon>{{theme() === 'dark' ? 'light_mode' : 'dark_mode'}}</mat-icon>
        </button>

        <!-- User menu -->
        <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          @if (user(); as currentUser) {
            <div class="user-info">
              <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
            </div>
            <mat-divider></mat-divider>
          }
          <button mat-menu-item (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            Settings
          </button>
          <button mat-menu-item (click)="logout.emit()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0 16px;
    }

    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .app-icon {
      font-size: 1.5rem;
    }

    .spacer {
      flex: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .compose-btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .user-info {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .user-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .user-email {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 768px) {
      .compose-btn span {
        display: none;
      }
      
      .header-actions {
        gap: 4px;
      }
    }
  `]
})
export class HeaderComponent {
  private store = inject(Store);

  @Input() isMobile = false;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  user = this.store.selectSignal(selectUser);
  unreadCount = this.store.selectSignal(selectUnreadCount);
  theme = this.store.selectSignal(selectTheme);

  openCompose(): void {
    this.store.dispatch(UIActions.openComposeDialog({ composeData: undefined }));
  }

  openSettings(): void {
    this.store.dispatch(UIActions.openSettingsDialog());
  }

  toggleTheme(): void {
    this.store.dispatch(UIActions.toggleTheme());
  }
}