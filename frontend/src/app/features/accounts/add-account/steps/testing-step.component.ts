import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AccountSetupStep, TestConnectionResponse } from '../../../../core/models/email.model';

@Component({
  selector: 'app-testing-step',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatProgressBarModule
  ],
  template: `
    <div class="step-container">
      
      @if (isLoading) {
        <div class="testing-loading">
          <mat-spinner diameter="48"></mat-spinner>
          <h2>Testing Connection...</h2>
          <p>Please wait while we verify your credentials and connection</p>
          
          <mat-card class="testing-progress">
            <mat-card-content>
              <div class="progress-steps">
                <div class="progress-step active">
                  <mat-icon>wifi_protected_setup</mat-icon>
                  <span>Connecting to server</span>
                </div>
                <div class="progress-step active">
                  <mat-icon>key</mat-icon>
                  <span>Authenticating credentials</span>
                </div>
                <div class="progress-step active">
                  <mat-icon>folder</mat-icon>
                  <span>Testing mailbox access</span>
                </div>
                <div class="progress-step">
                  <mat-icon>check_circle</mat-icon>
                  <span>Connection verified</span>
                </div>
              </div>
              <mat-progress-bar mode="indeterminate" class="progress-bar"></mat-progress-bar>
            </mat-card-content>
          </mat-card>
        </div>
      }

      @if (!isLoading && testResult) {
        <div class="test-result">
          @if (testResult.success) {
            <!-- Success -->
            <div class="success-result">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Connection Successful!</h2>
              <p>{{ testResult.message || 'Your account is ready to be created' }}</p>
              
              <mat-card class="connection-summary">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>verified</mat-icon>
                    Connection Summary
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="summary-details">
                    <div class="summary-row">
                      <span class="label">Email:</span>
                      <span class="value">{{ testResult.emailAddress }}</span>
                    </div>
                    <div class="summary-row">
                      <span class="label">Username:</span>
                      <span class="value">{{ testResult.username }}</span>
                    </div>
                    <div class="summary-row">
                      <span class="label">Server:</span>
                      <span class="value">{{ testResult.serverConfig?.serverHost || testResult.serverConfig?.ewsUrl }}</span>
                    </div>
                    <div class="summary-row">
                      <span class="label">Status:</span>
                      <span class="value success-text">
                        <mat-icon>check</mat-icon>
                        Connected
                      </span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="success-actions">
                <button mat-raised-button color="primary" (click)="onProceedToCreation()">
                  <mat-icon>add</mat-icon>
                  Create Account
                </button>
              </div>
            </div>
          } @else {
            <!-- Failure -->
            <div class="failure-result">
              <mat-icon class="error-icon">error</mat-icon>
              <h2>Connection Failed</h2>
              <p>{{ testResult.message || 'Unable to connect to your email server' }}</p>
              
              <mat-card class="error-details">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>info</mat-icon>
                    Connection Details
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="error-info">
                    <div class="error-row">
                      <span class="label">Email:</span>
                      <span class="value">{{ testResult.emailAddress }}</span>
                    </div>
                    <div class="error-row">
                      <span class="label">Username:</span>
                      <span class="value">{{ testResult.username }}</span>
                    </div>
                    <div class="error-row">
                      <span class="label">Server:</span>
                      <span class="value">{{ testResult.serverConfig?.serverHost || testResult.serverConfig?.ewsUrl }}</span>
                    </div>
                    <div class="error-row">
                      <span class="label">Status:</span>
                      <span class="value error-text">
                        <mat-icon>close</mat-icon>
                        Failed
                      </span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="troubleshooting">
                <h3>
                  <mat-icon>lightbulb</mat-icon>
                  Troubleshooting Tips
                </h3>
                <ul>
                  <li><strong>Check credentials:</strong> Verify your username and password are correct</li>
                  <li><strong>Network access:</strong> Ensure you can access the server from your network</li>
                  <li><strong>VPN required:</strong> Your organization might require VPN access</li>
                  <li><strong>Two-factor auth:</strong> Some servers require app-specific passwords</li>
                  <li><strong>Server settings:</strong> Double-check the server configuration</li>
                </ul>
              </div>

              <div class="failure-actions">
                <button mat-button (click)="onRetryTest()">
                  <mat-icon>refresh</mat-icon>
                  Retry Test
                </button>
                <button mat-raised-button color="primary" (click)="onGoBackToAuth()">
                  <mat-icon>edit</mat-icon>
                  Edit Settings
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (error && !isLoading) {
        <div class="error-result">
          <mat-icon class="error-icon">error</mat-icon>
          <h2>Test Error</h2>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button mat-raised-button color="primary" (click)="onRetryTest()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .step-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      text-align: center;
    }

    .testing-loading {
      padding: 40px 0;
    }

    .testing-loading h2 {
      margin: 24px 0 8px 0;
      color: rgba(0, 0, 0, 0.87);
    }

    .testing-loading p {
      margin: 0 0 32px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .testing-progress {
      margin: 24px 0;
      text-align: left;
    }

    .progress-steps {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;
    }

    .progress-step {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(0, 0, 0, 0.4);
      transition: color 0.3s;
    }

    .progress-step.active {
      color: #1976d2;
    }

    .progress-step.completed {
      color: #4caf50;
    }

    .progress-bar {
      margin-top: 16px;
    }

    .success-result {
      padding: 20px 0;
    }

    .success-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .success-result h2 {
      margin: 0 0 8px 0;
      color: #4caf50;
    }

    .success-result p {
      margin: 0 0 24px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .connection-summary {
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

    .success-text {
      color: #4caf50 !important;
    }

    .success-actions {
      margin-top: 24px;
    }

    .success-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 32px;
    }

    .failure-result {
      padding: 20px 0;
    }

    .error-result {
      padding: 20px 0;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .failure-result h2,
    .error-result h2 {
      margin: 0 0 8px 0;
      color: #f44336;
    }

    .failure-result p,
    .error-result p {
      margin: 0 0 24px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .error-details {
      margin: 24px 0;
      text-align: left;
    }

    .error-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .error-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .error-row .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .error-row .value {
      color: rgba(0, 0, 0, 0.87);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-text {
      color: #f44336 !important;
    }

    .troubleshooting {
      background: #fff3e0;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      text-align: left;
    }

    .troubleshooting h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #e65100;
      font-size: 1.1rem;
    }

    .troubleshooting ul {
      margin: 0;
      padding-left: 20px;
      color: rgba(0, 0, 0, 0.6);
    }

    .troubleshooting li {
      margin-bottom: 8px;
    }

    .failure-actions,
    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .progress-steps {
        gap: 12px;
      }
      
      .failure-actions,
      .error-actions {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class TestingStepComponent {
  @Input() currentStep!: AccountSetupStep;
  @Input() testResult?: TestConnectionResponse;
  @Input() isLoading: boolean = false;
  @Input() error?: string;
  
  @Output() retryTest = new EventEmitter<void>();

  onRetryTest(): void {
    this.retryTest.emit();
  }

  onProceedToCreation(): void {
    // This will be handled by the parent component
    // The parent will dispatch the create account action
  }

  onGoBackToAuth(): void {
    // This should navigate back to the auth step
    // Could emit an event or be handled by the parent
  }
}