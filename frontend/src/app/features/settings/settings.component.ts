import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { selectTheme } from '../../store/ui/ui.selectors';
import { selectUser } from '../../store/auth/auth.selectors';
import { UIActions } from '../../store/ui/ui.actions';
import { AuthActions } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <div class="settings-container">
      <div class="settings-content">
        <h1 class="page-title">Settings</h1>

        <!-- User Profile -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon>
              Profile
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (user(); as currentUser) {
              <div class="profile-info">
                <div class="profile-field">
                  <label>Name:</label>
                  <span>{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
                </div>
                <div class="profile-field">
                  <label>Username:</label>
                  <span>{{ currentUser.username }}</span>
                </div>
                <div class="profile-field">
                  <label>Email:</label>
                  <span>{{ currentUser.email }}</span>
                </div>
              </div>
            }
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">Edit Profile</button>
          </mat-card-actions>
        </mat-card>

        <!-- Appearance -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>palette</mat-icon>
              Appearance
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Dark Mode</div>
                <div class="setting-description">Switch between light and dark themes</div>
              </div>
              <mat-slide-toggle 
                [checked]="theme() === 'dark'"
                (change)="toggleTheme()">
              </mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Email Settings -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>email</mat-icon>
              Email Settings
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Auto-sync</div>
                <div class="setting-description">Automatically sync emails every 5 minutes</div>
              </div>
              <mat-slide-toggle [checked]="true"></mat-slide-toggle>
            </div>

            <mat-divider class="setting-divider"></mat-divider>

            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Desktop Notifications</div>
                <div class="setting-description">Show notifications for new emails</div>
              </div>
              <mat-slide-toggle [checked]="true"></mat-slide-toggle>
            </div>

            <mat-divider class="setting-divider"></mat-divider>

            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Mark as Read</div>
                <div class="setting-description">Automatically mark emails as read when opened</div>
              </div>
              <mat-slide-toggle [checked]="true"></mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Security -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>security</mat-icon>
              Security
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item>
                <mat-icon matListItemIcon>key</mat-icon>
                <div matListItemTitle>Change Password</div>
                <div matListItemLine>Update your account password</div>
                <button mat-button color="primary">Change</button>
              </mat-list-item>

              <mat-divider></mat-divider>

              <mat-list-item>
                <mat-icon matListItemIcon>devices</mat-icon>
                <div matListItemTitle>Active Sessions</div>
                <div matListItemLine>Manage your active login sessions</div>
                <button mat-button color="primary">Manage</button>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <!-- Data & Privacy -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>privacy_tip</mat-icon>
              Data & Privacy
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item>
                <mat-icon matListItemIcon>download</mat-icon>
                <div matListItemTitle>Export Data</div>
                <div matListItemLine>Download a copy of your data</div>
                <button mat-button color="primary">Export</button>
              </mat-list-item>

              <mat-divider></mat-divider>

              <mat-list-item>
                <mat-icon matListItemIcon>clear_all</mat-icon>
                <div matListItemTitle>Clear Cache</div>
                <div matListItemLine>Clear locally stored data</div>
                <button mat-button color="warn">Clear</button>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <!-- Account Actions -->
        <mat-card class="settings-card danger-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>warning</mat-icon>
              Account Actions
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item>
                <mat-icon matListItemIcon color="warn">logout</mat-icon>
                <div matListItemTitle>Sign Out</div>
                <div matListItemLine>Sign out of your account</div>
                <button mat-button color="warn" (click)="logout()">Sign Out</button>
              </mat-list-item>

              <mat-divider></mat-divider>

              <mat-list-item>
                <mat-icon matListItemIcon color="warn">delete_forever</mat-icon>
                <div matListItemTitle>Delete Account</div>
                <div matListItemLine>Permanently delete your account and data</div>
                <button mat-button color="warn">Delete</button>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      min-height: 100vh;
      background: #fafafa;
      padding: 24px;
    }

    .settings-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-title {
      margin: 0 0 24px 0;
      font-size: 2rem;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
    }

    .settings-card {
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .danger-card {
      border-left: 4px solid #f44336;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .profile-field {
      display: flex;
      gap: 12px;
    }

    .profile-field label {
      font-weight: 500;
      min-width: 80px;
      color: rgba(0, 0, 0, 0.6);
    }

    .profile-field span {
      color: rgba(0, 0, 0, 0.87);
    }

    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .setting-info {
      flex: 1;
    }

    .setting-label {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .setting-description {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .setting-divider {
      margin: 16px 0;
    }

    mat-list-item {
      height: auto !important;
      padding: 16px 0;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 16px;
      }
      
      .setting-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  `]
})
export class SettingsComponent {
  private store = inject(Store);

  user = this.store.selectSignal(selectUser);
  theme = this.store.selectSignal(selectTheme);

  toggleTheme(): void {
    this.store.dispatch(UIActions.toggleTheme());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}