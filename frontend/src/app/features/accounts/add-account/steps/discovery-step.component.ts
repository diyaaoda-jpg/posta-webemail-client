import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AccountSetupStep, AutodiscoverResponse } from '../../../../core/models/email.model';

@Component({
  selector: 'app-discovery-step',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  template: `
    <div class="step-container">
      
      @if (isLoading) {
        <div class="discovery-loading">
          <mat-spinner diameter="48"></mat-spinner>
          <h2>Discovering server settings...</h2>
          <p>Please wait while we automatically configure your email account</p>
          <div class="loading-steps">
            <div class="loading-step">
              <mat-icon>search</mat-icon>
              <span>Looking up server configuration</span>
            </div>
            <div class="loading-step">
              <mat-icon>dns</mat-icon>
              <span>Testing autodiscover endpoints</span>
            </div>
            <div class="loading-step">
              <mat-icon>verified</mat-icon>
              <span>Validating server settings</span>
            </div>
          </div>
        </div>
      }

      @if (!isLoading && discoveryResult) {
        <div class="discovery-result">
          @if (discoveryResult.success) {
            <!-- Success -->
            <div class="success-result">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Server Settings Found!</h2>
              <p>We successfully discovered your email server configuration</p>
              
              <mat-card class="config-details">
                <mat-card-header>
                  <mat-card-title>Server Configuration</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (discoveryResult.config) {
                    <div class="config-info">
                      <div class="config-row">
                        <span class="label">Server:</span>
                        <span class="value">{{ discoveryResult.config.serverHost }}</span>
                      </div>
                      <div class="config-row">
                        <span class="label">Method:</span>
                        <span class="value">{{ discoveryResult.config.autodiscoverMethod }}</span>
                      </div>
                      @if (discoveryResult.config.displayName) {
                        <div class="config-row">
                          <span class="label">Display Name:</span>
                          <span class="value">{{ discoveryResult.config.displayName }}</span>
                        </div>
                      }
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          } @else {
            <!-- Failure -->
            <div class="failure-result">
              <mat-icon class="error-icon">error</mat-icon>
              <h2>Automatic Discovery Failed</h2>
              <p>{{ discoveryResult.errorMessage || 'We couldn\\'t automatically find your server settings' }}</p>
              
              @if (discoveryResult.suggestion) {
                <div class="suggestion">
                  <mat-icon>lightbulb</mat-icon>
                  <span>{{ discoveryResult.suggestion }}</span>
                </div>
              }

              @if (discoveryResult.triedUrls?.length) {
                <details class="tried-urls">
                  <summary>View attempted URLs ({{ discoveryResult.triedUrls.length }})</summary>
                  <ul>
                    @for (url of discoveryResult.triedUrls; track url) {
                      <li>{{ url }}</li>
                    }
                  </ul>
                </details>
              }

              <div class="failure-actions">
                <button mat-button (click)="onRetryDiscovery()">
                  <mat-icon>refresh</mat-icon>
                  Retry
                </button>
                <button mat-raised-button color="primary" (click)="onProceedToManual()">
                  <mat-icon>settings</mat-icon>
                  Manual Setup
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (error && !isLoading) {
        <div class="error-result">
          <mat-icon class="error-icon">error</mat-icon>
          <h2>Discovery Error</h2>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button mat-raised-button color="primary" (click)="onRetryDiscovery()">
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

    .discovery-loading {
      padding: 40px 0;
    }

    .discovery-loading h2 {
      margin: 24px 0 8px 0;
      color: rgba(0, 0, 0, 0.87);
    }

    .discovery-loading p {
      margin: 0 0 32px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .loading-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .loading-step {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      color: rgba(0, 0, 0, 0.6);
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

    .config-details {
      margin: 24px 0;
      text-align: left;
    }

    .config-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .config-row {
      display: flex;
      justify-content: space-between;
    }

    .config-row .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .config-row .value {
      color: rgba(0, 0, 0, 0.87);
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

    .suggestion {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      background: #fff3e0;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
      color: #e65100;
    }

    .tried-urls {
      margin: 16px 0;
      text-align: left;
    }

    .tried-urls summary {
      cursor: pointer;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 8px;
    }

    .tried-urls ul {
      margin: 0;
      padding-left: 20px;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
    }

    .tried-urls li {
      margin-bottom: 4px;
    }

    .failure-actions,
    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 24px;
    }
  `]
})
export class DiscoveryStepComponent {
  @Input() currentStep!: AccountSetupStep;
  @Input() discoveryResult?: AutodiscoverResponse;
  @Input() isLoading: boolean = false;
  @Input() error?: string;
  
  @Output() retryDiscovery = new EventEmitter<void>();
  @Output() proceedToManual = new EventEmitter<void>();

  onRetryDiscovery(): void {
    this.retryDiscovery.emit();
  }

  onProceedToManual(): void {
    this.proceedToManual.emit();
  }
}