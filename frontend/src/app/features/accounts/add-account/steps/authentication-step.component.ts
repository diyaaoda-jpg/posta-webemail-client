import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface AuthenticationData {
  email: string;
  password: string;
  displayName: string;
  accountName: string;
  manualConfig?: {
    serverHost: string;
    serverPort: number;
    useSsl: boolean;
    serverType: 'IMAP' | 'EWS';
    ewsUrl?: string;
  };
}

@Component({
  selector: 'app-authentication-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="auth-step-container">
      <div class="header-section">
        <mat-icon class="step-icon">vpn_key</mat-icon>
        <h2>Enter your credentials</h2>
        <p>Please provide your email credentials to complete the setup.</p>
      </div>

      <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="auth-form">
        
        <!-- Email (readonly) -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Email Address</mat-label>
          <input matInput formControlName="email" readonly>
          <mat-icon matSuffix>email</mat-icon>
        </mat-form-field>

        <!-- Password -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Password</mat-label>
          <input 
            matInput 
            formControlName="password" 
            [type]="showPassword ? 'text' : 'password'"
            placeholder="Enter your email password">
          <mat-icon 
            matSuffix 
            (click)="togglePasswordVisibility()"
            class="password-toggle">
            {{ showPassword ? 'visibility_off' : 'visibility' }}
          </mat-icon>
          <mat-error *ngIf="authForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <!-- Display Name -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Display Name</mat-label>
          <input 
            matInput 
            formControlName="displayName" 
            placeholder="e.g., John Doe">
          <mat-icon matSuffix>person</mat-icon>
          <mat-error *ngIf="authForm.get('displayName')?.hasError('required')">
            Display name is required
          </mat-error>
        </mat-form-field>

        <!-- Account Name -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Account Name</mat-label>
          <input 
            matInput 
            formControlName="accountName" 
            placeholder="e.g., Work Email, Personal">
          <mat-icon matSuffix>label</mat-icon>
          <mat-error *ngIf="authForm.get('accountName')?.hasError('required')">
            Account name is required
          </mat-error>
        </mat-form-field>

        <!-- Manual Configuration (if autodiscovery failed) -->
        <mat-expansion-panel *ngIf="requiresManualConfig" class="manual-config-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>settings</mat-icon>
              Manual Server Configuration
            </mat-panel-title>
            <mat-panel-description>
              Configure server settings manually
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formGroupName="manualConfig" class="manual-config-form">
            
            <!-- Server Type -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Server Type</mat-label>
              <mat-select formControlName="serverType">
                <mat-option value="EWS">Exchange Web Services (EWS)</mat-option>
                <mat-option value="IMAP">IMAP</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Server Host -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Server Host</mat-label>
              <input 
                matInput 
                formControlName="serverHost" 
                placeholder="e.g., outlook.office365.com">
              <mat-error *ngIf="authForm.get('manualConfig.serverHost')?.hasError('required')">
                Server host is required
              </mat-error>
            </mat-form-field>

            <!-- Server Port -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Server Port</mat-label>
              <input 
                matInput 
                formControlName="serverPort" 
                type="number"
                placeholder="e.g., 993">
              <mat-error *ngIf="authForm.get('manualConfig.serverPort')?.hasError('required')">
                Server port is required
              </mat-error>
            </mat-form-field>

            <!-- EWS URL (if EWS selected) -->
            <mat-form-field 
              *ngIf="authForm.get('manualConfig.serverType')?.value === 'EWS'" 
              appearance="outline" 
              class="form-field">
              <mat-label>EWS URL</mat-label>
              <input 
                matInput 
                formControlName="ewsUrl" 
                placeholder="e.g., https://outlook.office365.com/EWS/Exchange.asmx">
            </mat-form-field>

            <!-- SSL/TLS -->
            <div class="ssl-option">
              <mat-checkbox formControlName="useSsl">
                Use SSL/TLS encryption (recommended)
              </mat-checkbox>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Submit Button -->
        <div class="form-actions">
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            [disabled]="authForm.invalid || isLoading"
            class="test-connection-btn">
            <mat-icon *ngIf="isLoading" class="spin">refresh</mat-icon>
            {{ isLoading ? 'Testing Connection...' : 'Test Connection' }}
          </button>
        </div>
      </form>

      <!-- Security Note -->
      <div class="security-note">
        <mat-icon>security</mat-icon>
        <p>Your credentials are encrypted and stored securely on your device. We never store your password on our servers.</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-step-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .step-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #333;
    }

    p {
      color: #666;
      margin-bottom: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .password-toggle {
      cursor: pointer;
      color: #666;
    }

    .password-toggle:hover {
      color: #333;
    }

    .manual-config-panel {
      margin: 16px 0;
    }

    .manual-config-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .ssl-option {
      margin: 16px 0;
    }

    .form-actions {
      margin-top: 24px;
      text-align: center;
    }

    .test-connection-btn {
      min-width: 180px;
      height: 44px;
      font-size: 16px;
    }

    .spin {
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .security-note {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 30px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .security-note mat-icon {
      color: #667eea;
      flex-shrink: 0;
    }

    .security-note p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }

    ::ng-deep .mat-expansion-panel-header-title mat-icon {
      margin-right: 8px;
    }
  `]
})
export class AuthenticationStepComponent implements OnInit {
  @Input() emailAddress = '';
  @Input() discoveryResult: any = null;
  @Input() requiresManualConfig = false;
  @Output() credentialsSubmitted = new EventEmitter<AuthenticationData>();

  authForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
    this.prefillFormData();
  }

  private createForm(): void {
    this.authForm = this.formBuilder.group({
      email: [this.emailAddress, [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      displayName: ['', [Validators.required]],
      accountName: ['', [Validators.required]],
      manualConfig: this.formBuilder.group({
        serverType: ['EWS'],
        serverHost: [''],
        serverPort: [993, [Validators.min(1), Validators.max(65535)]],
        useSsl: [true],
        ewsUrl: ['']
      })
    });

    // Add validators for manual config if required
    if (this.requiresManualConfig) {
      this.authForm.get('manualConfig.serverHost')?.setValidators([Validators.required]);
      this.authForm.get('manualConfig.serverPort')?.setValidators([Validators.required, Validators.min(1), Validators.max(65535)]);
    }
  }

  private prefillFormData(): void {
    // Prefill email
    this.authForm.patchValue({
      email: this.emailAddress
    });

    // Prefill from discovery result if available
    if (this.discoveryResult?.config) {
      const config = this.discoveryResult.config;
      this.authForm.patchValue({
        manualConfig: {
          serverHost: config.serverHost,
          serverPort: config.serverPort,
          useSsl: config.useSsl,
          serverType: config.ewsUrl ? 'EWS' : 'IMAP',
          ewsUrl: config.ewsUrl
        }
      });
    }

    // Auto-generate suggested values
    const emailParts = this.emailAddress.split('@');
    if (emailParts.length === 2) {
      const [localPart, domain] = emailParts;
      this.authForm.patchValue({
        displayName: localPart.charAt(0).toUpperCase() + localPart.slice(1),
        accountName: domain.charAt(0).toUpperCase() + domain.slice(1) + ' Email'
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      this.isLoading = true;
      
      const formValue = this.authForm.value;
      const authData: AuthenticationData = {
        email: formValue.email,
        password: formValue.password,
        displayName: formValue.displayName,
        accountName: formValue.accountName
      };

      // Include manual config if required
      if (this.requiresManualConfig) {
        authData.manualConfig = formValue.manualConfig;
      }

      // Simulate processing delay
      setTimeout(() => {
        this.credentialsSubmitted.emit(authData);
        this.isLoading = false;
      }, 1500);
    } else {
      this.authForm.markAllAsTouched();
    }
  }
}