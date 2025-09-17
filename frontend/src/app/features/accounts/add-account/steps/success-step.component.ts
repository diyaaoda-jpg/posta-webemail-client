import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AccountSetupStep } from '../../../../core/models/email.model';

@Component({
  selector: 'app-success-step',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="step-container">
      
      <div class="success-content">
        <div class="success-icon-container">
          <mat-icon class="success-icon">check_circle</mat-icon>
        </div>
        
        <h2>Account Created Successfully!</h2>
        <p class="success-message">
          Your email account has been set up and is ready to use. 
          We'll start syncing your emails shortly.
        </p>

        <!-- Account Summary -->
        @if (accountDetails) {
          <mat-card class="account-summary">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>account_circle</mat-icon>
                Account Summary
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-details">
                <div class="summary-row">
                  <span class="label">Account Name:</span>
                  <span class="value">{{ accountDetails.accountName }}</span>
                </div>
                @if (accountDetails.displayName) {
                  <div class="summary-row">
                    <span class="label">Display Name:</span>
                    <span class="value">{{ accountDetails.displayName }}</span>
                  </div>
                }
                <div class="summary-row">
                  <span class="label">Status:</span>
                  <span class="value status-active">
                    <mat-icon>check_circle</mat-icon>
                    Active
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- Next Steps -->
        <mat-card class="next-steps">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>playlist_add_check</mat-icon>
              What's Next?
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="next-steps-list">
              <div class="next-step">
                <mat-icon class="step-icon completed">sync</mat-icon>
                <div class="step-content">
                  <h4>Email Sync</h4>
                  <p>We're downloading your recent emails in the background</p>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="next-step">
                <mat-icon class="step-icon">email</mat-icon>
                <div class="step-content">
                  <h4>Check Your Inbox</h4>
                  <p>Navigate to your inbox to start reading and managing emails</p>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="next-step">
                <mat-icon class="step-icon">settings</mat-icon>
                <div class="step-content">
                  <h4>Account Settings</h4>
                  <p>Customize your account preferences and notification settings</p>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="next-step">
                <mat-icon class="step-icon">add</mat-icon>
                <div class="step-content">
                  <h4>Add More Accounts</h4>
                  <p>You can add additional email accounts anytime from settings</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button mat-raised-button color="primary" (click)="onFinishSetup()">
              <mat-icon>inbox</mat-icon>
              Go to Inbox
            </button>
            <button mat-button (click)="onAddAnotherAccount()">
              <mat-icon>add</mat-icon>
              Add Another Account
            </button>
            <button mat-button (click)="onGoToSettings()">
              <mat-icon>settings</mat-icon>
              Account Settings
            </button>
          </div>
        </div>

        <!-- Tips Card -->
        <mat-card class="tips-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>lightbulb</mat-icon>
              Pro Tips
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ul class="tips-list">
              <li>
                <mat-icon>notifications</mat-icon>
                Enable desktop notifications to stay updated on new emails
              </li>
              <li>
                <mat-icon>schedule</mat-icon>
                Set up email scheduling to send messages at optimal times
              </li>
              <li>
                <mat-icon>folder</mat-icon>
                Organize your emails using folders and filters
              </li>
              <li>
                <mat-icon>search</mat-icon>
                Use the search feature to quickly find specific emails
              </li>
            </ul>
          </mat-card-content>
        </mat-card>

      </div>

    </div>
  `,
  styles: [`
    .step-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 24px;
    }

    .success-content {
      text-align: center;
    }

    .success-icon-container {
      margin-bottom: 24px;
    }

    .success-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #4caf50;
    }

    h2 {
      margin: 0 0 16px 0;
      color: #4caf50;
      font-size: 1.75rem;
    }

    .success-message {
      margin: 0 0 32px 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .account-summary {
      margin: 24px 0;
      text-align: left;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-row .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .summary-row .value {
      color: rgba(0, 0, 0, 0.87);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-active {
      color: #4caf50 !important;
    }

    .next-steps {
      margin: 24px 0;
      text-align: left;
    }

    .next-steps-list {
      display: flex;
      flex-direction: column;
    }

    .next-step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 0;
    }

    .step-icon {
      color: rgba(0, 0, 0, 0.54);
      margin-top: 2px;
    }

    .step-icon.completed {
      color: #4caf50;
    }

    .step-content h4 {
      margin: 0 0 4px 0;
      color: rgba(0, 0, 0, 0.87);
      font-size: 1rem;
    }

    .step-content p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
    }

    .quick-actions {
      margin: 32px 0;
    }

    .quick-actions h3 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
      font-size: 1.25rem;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 300px;
      margin: 0 auto;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      padding: 12px 24px;
    }

    .tips-card {
      margin: 32px 0;
      text-align: left;
      background: #f8f9fa;
    }

    .tips-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .tips-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .tips-list li:last-child {
      margin-bottom: 0;
    }

    .tips-list mat-icon {
      color: #1976d2;
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-top: 2px;
    }

    @media (max-width: 768px) {
      .action-buttons {
        max-width: none;
      }
      
      .summary-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class SuccessStepComponent {
  @Input() currentStep!: AccountSetupStep;
  @Input() accountDetails?: { accountName: string; displayName?: string };
  
  @Output() finishSetup = new EventEmitter<void>();

  onFinishSetup(): void {
    this.finishSetup.emit();
  }

  onAddAnotherAccount(): void {
    // Could emit event or handle navigation
    // For now, just restart the flow
    window.location.reload(); // Simple approach - could be improved
  }

  onGoToSettings(): void {
    // Navigate to settings page
    // This could be handled by the parent component
    this.finishSetup.emit();
  }
}