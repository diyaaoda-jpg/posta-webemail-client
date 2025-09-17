import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountSetupStep } from '../../../../core/models/email.model';

@Component({
  selector: 'app-email-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="step-container">
      <div class="step-header">
        <h2>What's your email address?</h2>
        <p>We'll automatically find your email settings</p>
      </div>

      <form [formGroup]="emailForm" (ngSubmit)="onSubmit()" class="email-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email Address</mat-label>
          <input 
            matInput 
            type="email" 
            formControlName="email"
            placeholder="you@company.com">
          <mat-icon matSuffix>email</mat-icon>
          @if (emailForm.get('email')?.hasError('required') && emailForm.get('email')?.touched) {
            <mat-error>Email address is required</mat-error>
          }
          @if (emailForm.get('email')?.hasError('email') && emailForm.get('email')?.touched) {
            <mat-error>Please enter a valid email address</mat-error>
          }
        </mat-form-field>

        <div class="step-actions">
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            [disabled]="emailForm.invalid">
            Get Started
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </form>

      <div class="help-section">
        <h3>Why do we need this?</h3>
        <ul>
          <li>We'll detect your email provider automatically (Gmail, Outlook, etc.)</li>
          <li>No need to remember server names or port numbers</li>
          <li>If we can't detect it, we'll guide you through manual setup</li>
          <li>Your credentials are always stored securely on your device</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .step-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 24px;
    }

    .step-header {
      text-align: center;
      margin-bottom: 32px;
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

    .email-form {
      margin-bottom: 32px;
    }

    .full-width {
      width: 100%;
    }

    .step-actions {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }

    .step-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .help-section {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-top: 24px;
    }

    .help-section h3 {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      color: rgba(0, 0, 0, 0.87);
    }

    .help-section ul {
      margin: 0;
      padding-left: 20px;
      color: rgba(0, 0, 0, 0.6);
    }

    .help-section li {
      margin-bottom: 4px;
    }
  `]
})
export class EmailStepComponent {
  @Input() currentStep!: AccountSetupStep;
  @Output() stepCompleted = new EventEmitter<AccountSetupStep>();
  @Output() emailSubmitted = new EventEmitter<string>();

  private fb = inject(FormBuilder);

  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.emailForm.valid) {
      const email = this.emailForm.value.email;
      this.emailSubmitted.emit(email);
      this.stepCompleted.emit('discovery');
    }
  }
}