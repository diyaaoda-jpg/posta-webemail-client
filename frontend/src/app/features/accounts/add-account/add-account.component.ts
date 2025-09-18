import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';

import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

import { EmailStepComponent } from './steps/email-step.component';
import { DiscoveryStepComponent } from './steps/discovery-step.component';
import { ManualConfigStepComponent } from './steps/manual-config-step.component';
import { AuthStepComponent } from './steps/auth-step.component';
import { TestingStepComponent } from './steps/testing-step.component';
import { SuccessStepComponent } from './steps/success-step.component';

import { selectAccountSetupState, selectCurrentStep } from '../../../store/accounts/accounts.selectors';
import { AccountsActions } from '../../../store/accounts/accounts.actions';
import { AccountSetupStep, AccountSetupState } from '../../../core/models/email.model';

@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    EmailStepComponent,
    DiscoveryStepComponent,
    ManualConfigStepComponent,
    AuthStepComponent,
    TestingStepComponent,
    SuccessStepComponent
  ],
  template: `
    <div class="onboarding-container">
      <div class="onboarding-header">
        <div class="welcome-content">
          <h1 class="welcome-title">Welcome to POSTA Email Client</h1>
          <p class="welcome-subtitle">Let's set up your first email account to get started</p>
          @if (setupState().isLoading) {
            <mat-spinner diameter="32" class="loading-spinner"></mat-spinner>
          }
        </div>
      </div>

      <div class="onboarding-content">
        <mat-card class="onboarding-card">
          <mat-card-content>
            <mat-stepper orientation="horizontal" [linear]="true" #stepper>
              
              <!-- Step 1: Email Input -->
              <mat-step [completed]="isStepCompleted('email')" [editable]="true">
                <ng-template matStepLabel>Email Address</ng-template>
                <app-email-step 
                  [currentStep]="currentStep()"
                  (stepCompleted)="onStepCompleted($event)"
                  (emailSubmitted)="onEmailSubmitted($event)">
                </app-email-step>
              </mat-step>

              <!-- Step 2: Autodiscovery -->
              <mat-step [completed]="isStepCompleted('discovery')" [editable]="false">
                <ng-template matStepLabel>Server Discovery</ng-template>
                <app-discovery-step
                  [currentStep]="currentStep()"
                  [discoveryResult]="setupState().discoveryResult"
                  [isLoading]="setupState().isLoading"
                  [error]="setupState().error"
                  (retryDiscovery)="onRetryDiscovery()"
                  (proceedToManual)="onProceedToManual()">
                </app-discovery-step>
              </mat-step>

              <!-- Step 3: Manual Configuration (if needed) -->
              @if (showManualStep()) {
                <mat-step [completed]="isStepCompleted('manual')" [editable]="true">
                  <ng-template matStepLabel>Manual Setup</ng-template>
                  <app-manual-config-step
                    [currentStep]="currentStep()"
                    [emailAddress]="setupState().emailAddress"
                    (manualConfigSubmitted)="onManualConfigSubmitted($event)">
                  </app-manual-config-step>
                </mat-step>
              }

              <!-- Step 4: Authentication -->
              <mat-step [completed]="isStepCompleted('auth')" [editable]="true">
                <ng-template matStepLabel>Authentication</ng-template>
                <app-auth-step
                  [currentStep]="currentStep()"
                  [emailAddress]="setupState().emailAddress"
                  [serverConfig]="setupState().serverConfig"
                  (credentialsSubmitted)="onCredentialsSubmitted($event)">
                </app-auth-step>
              </mat-step>

              <!-- Step 5: Connection Testing -->
              <mat-step [completed]="isStepCompleted('testing')" [editable]="false">
                <ng-template matStepLabel>Testing</ng-template>
                <app-testing-step
                  [currentStep]="currentStep()"
                  [testResult]="setupState().testResult"
                  [isLoading]="setupState().isLoading"
                  [error]="setupState().error"
                  (retryTest)="onRetryTest()">
                </app-testing-step>
              </mat-step>

              <!-- Step 6: Success -->
              <mat-step [completed]="isStepCompleted('success')">
                <ng-template matStepLabel>Complete</ng-template>
                <app-success-step
                  [currentStep]="currentStep()"
                  [accountDetails]="setupState().accountDetails"
                  (finishSetup)="onFinishSetup()">
                </app-success-step>
              </mat-step>

            </mat-stepper>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .onboarding-header {
      background: transparent;
      padding: 40px 24px 20px;
      text-align: center;
    }

    .welcome-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .welcome-title {
      color: white;
      font-size: 2.5rem;
      font-weight: 300;
      margin: 0 0 16px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .welcome-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.25rem;
      margin: 0 0 24px 0;
      font-weight: 300;
    }

    .loading-spinner {
      margin: 16px auto;
    }

    .onboarding-content {
      flex: 1;
      padding: 0 24px 40px;
      overflow-y: auto;
    }

    .onboarding-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    ::ng-deep .mat-stepper-horizontal {
      margin-top: 24px;
    }

    ::ng-deep .mat-step-header {
      pointer-events: none;
    }

    ::ng-deep .mat-step-header.cdk-program-focused {
      pointer-events: auto;
    }

    ::ng-deep .mat-stepper-horizontal-line {
      margin: 0 24px;
    }

    @media (max-width: 768px) {
      .add-account-content {
        padding: 16px;
      }
      
      .setup-card {
        padding: 16px;
      }
      
      ::ng-deep .mat-stepper-horizontal {
        margin-top: 16px;
      }
      
      ::ng-deep .mat-stepper-horizontal-line {
        margin: 0 12px;
      }
    }
  `]
})
export class AddAccountComponent {
  private store = inject(Store<AppState>);
  private router = inject(Router);

  setupState = this.store.selectSignal(selectAccountSetupState);
  currentStep = this.store.selectSignal(selectCurrentStep);

  ngOnInit(): void {
    // Initialize the setup process
    this.store.dispatch(AccountsActions.initializeAccountSetup());
  }

  ngOnDestroy(): void {
    // Clean up setup state when leaving
    this.store.dispatch(AccountsActions.clearAccountSetup());
  }

  // Removed goBack method since this is now the primary onboarding entry point

  isStepCompleted(step: AccountSetupStep): boolean {
    const state = this.setupState();
    const currentStep = state.currentStep;
    
    switch (step) {
      case 'email':
        return !!state.emailAddress && this.isStepAfter(currentStep, 'email');
      case 'discovery':
        return !!state.discoveryResult && this.isStepAfter(currentStep, 'discovery');
      case 'manual':
        return !!state.serverConfig && this.isStepAfter(currentStep, 'manual');
      case 'auth':
        return !!state.credentials && this.isStepAfter(currentStep, 'auth');
      case 'testing':
        return !!state.testResult?.success && this.isStepAfter(currentStep, 'testing');
      case 'success':
        return currentStep === 'success';
      default:
        return false;
    }
  }

  private isStepAfter(currentStep: AccountSetupStep, compareStep: AccountSetupStep): boolean {
    const stepOrder: AccountSetupStep[] = ['email', 'discovery', 'manual', 'auth', 'testing', 'success'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const compareIndex = stepOrder.indexOf(compareStep);
    return currentIndex > compareIndex;
  }

  showManualStep(): boolean {
    const state = this.setupState();
    return !!(state.discoveryResult && !state.discoveryResult.success);
  }

  onStepCompleted(step: AccountSetupStep): void {
    this.store.dispatch(AccountsActions.setCurrentStep({ step }));
  }

  onEmailSubmitted(email: string): void {
    this.store.dispatch(AccountsActions.submitEmailForDiscovery({ emailAddress: email }));
  }

  onRetryDiscovery(): void {
    const email = this.setupState().emailAddress;
    if (email) {
      this.store.dispatch(AccountsActions.submitEmailForDiscovery({ emailAddress: email }));
    }
  }

  onProceedToManual(): void {
    this.store.dispatch(AccountsActions.setCurrentStep({ step: 'manual' }));
  }

  onManualConfigSubmitted(config: { serverInput: string }): void {
    const email = this.setupState().emailAddress;
    this.store.dispatch(AccountsActions.submitManualDiscovery({
      emailAddress: email,
      serverInput: config.serverInput
    }));
  }

  onCredentialsSubmitted(credentials: { username: string; password: string; accountName: string; displayName?: string }): void {
    this.store.dispatch(AccountsActions.submitCredentials({ credentials }));
  }

  onRetryTest(): void {
    this.store.dispatch(AccountsActions.testConnection());
  }

  onFinishSetup(): void {
    this.store.dispatch(AccountsActions.createAccount());
    // Navigate to main email interface after successful setup
    this.router.navigate(['/emails']);
  }
}