import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-email-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="email-step-container">
      <h2>What's your email address?</h2>
      <p>We'll automatically find your email settings</p>
      
      <form [formGroup]="emailForm" (ngSubmit)="onSubmit()" class="email-form">
        <mat-form-field appearance="outline" class="email-field">
          <mat-label>Email Address</mat-label>
          <input 
            matInput 
            formControlName="email" 
            type="email" 
            placeholder="Enter your email address"
            [class.invalid]="emailForm.get('email')?.invalid && emailForm.get('email')?.touched">
          
          <mat-error *ngIf="emailForm.get('email')?.hasError('required')">
            Email address is required
          </mat-error>
          <mat-error *ngIf="emailForm.get('email')?.hasError('email')">
            Please enter a valid email address
          </mat-error>
        </mat-form-field>
        
        <button 
          mat-raised-button 
          color="primary" 
          type="submit" 
          [disabled]="emailForm.invalid || isLoading"
          class="get-started-btn">
          {{ isLoading ? 'Finding Settings...' : 'Get Started' }}
        </button>
      </form>
      
      <div class="info-section">
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
    .email-step-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    
    h2 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #333;
    }
    
    p {
      color: #666;
      margin-bottom: 30px;
    }
    
    .email-form {
      margin-bottom: 40px;
    }
    
    .email-field {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .get-started-btn {
      min-width: 140px;
      height: 44px;
      font-size: 16px;
    }
    
    .info-section {
      text-align: left;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .info-section h3 {
      margin-top: 0;
      color: #333;
      font-size: 18px;
    }
    
    .info-section ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .info-section li {
      margin-bottom: 8px;
      color: #555;
    }
    
    .invalid {
      border-color: #f44336 !important;
    }
  `]
})
export class EmailStepComponent implements OnInit {
  @Output() emailSubmitted = new EventEmitter<string>();
  
  emailForm!: FormGroup;
  isLoading = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.emailForm.valid) {
      this.isLoading = true;
      const emailAddress = this.emailForm.get('email')?.value;
      
      // Add a small delay to show loading state
      setTimeout(() => {
        this.emailSubmitted.emit(emailAddress);
        this.isLoading = false;
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      this.emailForm.markAllAsTouched();
    }
  }
}