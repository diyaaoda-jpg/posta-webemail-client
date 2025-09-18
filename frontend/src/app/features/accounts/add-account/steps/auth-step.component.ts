import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AccountSetupStep, ExchangeServerConfig } from '../../../../core/models/email.model';

@Component({
  selector: 'app-auth-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule
  ],
  template: `
    <div class="step-container">
      <div class="step-header">
        <h2>Account Authentication</h2>
        <p>Enter your credentials to connect to {{ emailAddress }}</p>
      </div>

      <!-- Server Info Card -->
      @if (serverConfig) {
        <mat-card class="server-info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>verified</mat-icon>
              Server Configuration
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="server-details">
              <div class="server-row">
                <span class="label">Server:</span>
                <span class="value">{{ serverConfig.serverHost || serverConfig.ewsUrl }}</span>
              </div>
              @if (serverConfig.autodiscoverMethod) {
                <div class="server-row">
                  <span class="label">Discovery Method:</span>
                  <span class="value">{{ serverConfig.autodiscoverMethod }}</span>
                </div>
              }
              <div class="server-row">
                <span class="label">Security:</span>
                <span class="value">
                  <mat-icon class="security-icon">{{ serverConfig.useSsl ? 'lock' : 'lock_open' }}</mat-icon>
                  {{ serverConfig.useSsl ? 'SSL/TLS Encrypted' : 'Not Encrypted' }}
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- Account Details -->
        <div class="form-section">
          <h3>Account Details</h3>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Account Name</mat-label>
            <input 
              matInput 
              formControlName="accountName"
              placeholder="Work Email">
            <mat-icon matSuffix>label</mat-icon>
            @if (authForm.get('accountName')?.hasError('required') && authForm.get('accountName')?.touched) {
              <mat-error>Account name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Display Name (Optional)</mat-label>
            <input 
              matInput 
              formControlName="displayName"
              placeholder="John Doe">
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>
        </div>

        <!-- Credentials -->
        <div class="form-section">
          <h3>Login Credentials</h3>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input 
              matInput 
              formControlName="username"
              placeholder="john.doe or john.doe@worldposta.com">
            <mat-icon matSuffix>person</mat-icon>
            @if (authForm.get('username')?.hasError('required') && authForm.get('username')?.touched) {
              <mat-error>Username is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input 
              matInput 
              [type]="hidePassword ? 'password' : 'text'"
              formControlName="password">
            <button 
              mat-icon-button 
              matSuffix 
              type="button"
              (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (authForm.get('password')?.hasError('required') && authForm.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Username Help -->
        <mat-card class="help-card">
          <mat-card-content>
            <div class="help-section">
              <mat-icon>info</mat-icon>
              <div class="help-content">
                <h4>Username Format</h4>
                <p>You can usually use either:</p>
                <ul>
                  <li><strong>Email address:</strong> {{ emailAddress }}</li>
                  <li><strong>Username only:</strong> {{ getUsernameFromEmail() }}</li>
                  <li><strong>Domain\\Username:</strong> WORLDPOSTA\\{{ getUsernameFromEmail() }}</li>
                </ul>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Security Notice -->
        <div class="security-notice">
          <mat-checkbox formControlName="acceptTerms" color="primary">
            I understand that my credentials will be securely stored and encrypted
          </mat-checkbox>
          @if (authForm.get('acceptTerms')?.hasError('required') && authForm.get('acceptTerms')?.touched) {
            <div class="error-text">You must accept the terms to continue</div>
          }
        </div>

        <div class="step-actions">
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            [disabled]="authForm.invalid">
            Test Connection
            <mat-icon>wifi_protected_setup</mat-icon>
          </button>
        </div>
      </form>

    </div>
  `,
  styles: [`
    .step-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }

    .step-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .step-header h2 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      color: rgba(0, 0, 0, 0.87);
    }

    .step-header p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 1rem;
    }

    .server-info-card {
      margin-bottom: 24px;
      background: #f8f9fa;
    }

    .server-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .server-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .server-row .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .server-row .value {
      display: flex;
      align-items: center;
      gap: 4px;
      color: rgba(0, 0, 0, 0.87);
    }

    .security-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .auth-form {
      margin-bottom: 32px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
      font-size: 1.1rem;
      font-weight: 500;
    }

    .full-width {
      width: 100%;
    }

    .help-card {
      margin: 16px 0;
      background: #e3f2fd;
    }

    .help-section {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .help-section mat-icon {
      color: #1976d2;
      margin-top: 2px;
    }

    .help-content h4 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 1rem;
    }

    .help-content p {
      margin: 0 0 8px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .help-content ul {
      margin: 0;
      padding-left: 20px;
      color: rgba(0, 0, 0, 0.6);
    }

    .help-content li {
      margin-bottom: 4px;
    }

    .security-notice {
      margin: 24px 0;
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }

    .error-text {
      color: #f44336;
      font-size: 0.75rem;
      margin-top: 4px;
    }

    .step-actions {
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }

    .step-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 32px;
    }
  `]
})
export class AuthStepComponent implements OnInit {
  @Input() currentStep!: AccountSetupStep;
  @Input() emailAddress!: string;
  @Input() serverConfig?: ExchangeServerConfig;
  @Output() credentialsSubmitted = new EventEmitter<{ username: string; password: string; accountName: string; displayName?: string }>();

  private fb = inject(FormBuilder);

  hidePassword = true;

  authForm!: FormGroup;

  ngOnInit(): void {
    // Initialize form first
    this.authForm = this.fb.group({
      accountName: ['', [Validators.required]],
      displayName: [''],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
    // Pre-populate fields based on email address
    const emailParts = this.emailAddress.split('@');
    const username = emailParts[0];
    const domain = emailParts[1]?.toUpperCase();

    this.authForm.patchValue({
      accountName: domain ? `${domain} Account` : 'Email Account',
      username: this.emailAddress, // Start with full email as username
      displayName: this.capitalizeWords(username.replace(/[._]/g, ' '))
    });
  }

  getUsernameFromEmail(): string {
    return this.emailAddress.split('@')[0];
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      const formValue = this.authForm.value;
      this.credentialsSubmitted.emit({
        username: formValue.username,
        password: formValue.password,
        accountName: formValue.accountName,
        displayName: formValue.displayName || undefined
      });
    }
  }
}