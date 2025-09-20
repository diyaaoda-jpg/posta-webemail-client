import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import your step components
import { EmailStepComponent } from './steps/email-step.component';
import { AuthenticationStepComponent, AuthenticationData } from './steps/authentication-step.component';

// Import your store actions and selectors
// import * as AccountsActions from '../../store/accounts/accounts.actions';
// import { selectDiscoveryResult, selectDiscoveryLoading } from '../../store/accounts/accounts.selectors';

@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    EmailStepComponent,
    AuthenticationStepComponent
  ],
  template: `
    <div class="add-account-container">
      <div class="header">
        <h1>Let's set up your first email account to get started</h1>
      </div>
      
      <mat-stepper [linear]="true" #stepper class="account-stepper">
        
        <!-- Step 1: Email Address -->
        <mat-step [completed]="isStepCompleted('email')" label="Email Address">
          <app-email-step 
            (emailSubmitted)="onEmailSubmitted($event)">
          </app-email-step>
        </mat-step>
        
        <!-- Step 2: Server Discovery -->
        <mat-step [completed]="isStepCompleted('discovery')" label="Server Discovery">
          <div class="step-content">
            <div *ngIf="discoveryLoading" class="loading-container">
              <mat-icon class="spin">refresh</mat-icon>
              <p>Discovering email server settings...</p>
            </div>
            
            <div *ngIf="discoveryResult && !discoveryLoading" class="discovery-result">
              <div *ngIf="discoveryResult.success" class="success">
                <mat-icon color="primary">check_circle</mat-icon>
                <h3>Settings found!</h3>
                <p>We found settings for {{ discoveryResult.config?.displayName || 'your email provider' }}</p>
                <button mat-raised-button color="primary" (click)="proceedToAuthentication()">
                  Continue
                </button>
              </div>
              
              <div *ngIf="!discoveryResult.success" class="manual-setup">
                <mat-icon color="warn">warning</mat-icon>
                <h3>Automatic setup not available</h3>
                <p>We couldn't automatically detect your email settings. Don't worry - we'll help you set it up manually.</p>
                <button mat-raised-button color="primary" (click)="proceedToManualSetup()">
                  Manual Setup
                </button>
              </div>
            </div>
          </div>
        </mat-step>
        
        <!-- Step 3: Authentication -->
        <mat-step [completed]="isStepCompleted('authentication')" label="Authentication">
          <app-authentication-step 
            [emailAddress]="submittedEmail"
            [discoveryResult]="discoveryResult"
            [requiresManualConfig]="!discoveryResult?.success"
            (credentialsSubmitted)="onCredentialsSubmitted($event)">
          </app-authentication-step>
        </mat-step>
        
        <!-- Step 4: Testing -->
        <mat-step [completed]="isStepCompleted('testing')" label="Testing">
          <div class="step-content">
            <h3>Testing connection...</h3>
            <p>We're verifying your email settings.</p>
            <!-- Add testing component here -->
          </div>
        </mat-step>
        
        <!-- Step 5: Complete -->
        <mat-step [completed]="isStepCompleted('complete')" label="Complete">
          <div class="step-content">
            <mat-icon color="primary" class="large-icon">check_circle</mat-icon>
            <h3>Account added successfully!</h3>
            <p>Your email account has been configured and is ready to use.</p>
            <button mat-raised-button color="primary" (click)="finishSetup()">
              Start Using Email
            </button>
          </div>
        </mat-step>
        
      </mat-stepper>
    </div>
  `,
  styles: [`
    .add-account-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 300;
      margin: 0;
    }
    
    .account-stepper {
      background: white;
      border-radius: 12px;
      padding: 0;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .step-content {
      padding: 30px;
      text-align: center;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .loading-container .spin {
      animation: spin 1s linear infinite;
      font-size: 48px;
      color: #667eea;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .discovery-result {
      width: 100%;
      max-width: 400px;
    }
    
    .success, .manual-setup {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .success mat-icon, .manual-setup mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    
    .large-icon {
      font-size: 64px !important;
      width: 64px !important;
      height: 64px !important;
      margin-bottom: 16px;
    }
    
    h3 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
    
    p {
      margin: 0;
      color: #666;
      text-align: center;
    }
    
    button {
      margin-top: 16px;
      min-width: 160px;
      height: 44px;
    }
    
    ::ng-deep .mat-stepper-header {
      padding: 24px;
    }
    
    ::ng-deep .mat-step-header.cdk-program-focused {
      background-color: transparent;
    }
  `]
})
export class AddAccountComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  private destroy$ = new Subject<void>();
  
  // State management
  discoveryResult: any = null;
  discoveryLoading = false;
  testingResult: any = null;
  testingLoading = false;
  currentStep = 'email';
  completedSteps = new Set<string>();
  submittedEmail = '';
  authenticationData: AuthenticationData | null = null;

  constructor(private store: Store, private http: HttpClient) {}

  ngOnInit(): void {
    // Subscribe to store selectors if using NgRx
    // this.store.select(selectDiscoveryResult)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(result => this.discoveryResult = result);
    
    // this.store.select(selectDiscoveryLoading)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(loading => this.discoveryLoading = loading);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEmailSubmitted(emailAddress: string): void {
    console.log('Email submitted:', emailAddress);
    
    // Store the submitted email
    this.submittedEmail = emailAddress;
    
    // Mark email step as completed
    this.completedSteps.add('email');
    this.currentStep = 'discovery';
    
    // Manually advance to next step
    setTimeout(() => {
      this.stepper.next();
    }, 100);
    
    // Start discovery process
    this.discoveryLoading = true;
    
    // Call the real API
    this.http.post<any>('/api/accounts/discover', { EmailAddress: emailAddress })
      .subscribe({
        next: (result) => {
          console.log('Discovery result:', result);
          this.discoveryResult = result;
          this.discoveryLoading = false;
        },
        error: (error) => {
          console.error('Discovery error:', error);
          this.discoveryResult = {
            success: false,
            errorMessage: 'Failed to discover email settings. Please try manual setup.',
            suggestion: 'Check your email address and try manual configuration.'
          };
          this.discoveryLoading = false;
        }
      });
  }

  proceedToAuthentication(): void {
    this.completedSteps.add('discovery');
    this.currentStep = 'authentication';
    this.stepper.next();
    console.log('Proceeding to authentication step');
  }

  proceedToManualSetup(): void {
    this.completedSteps.add('discovery');
    this.currentStep = 'authentication';
    this.stepper.next();
    console.log('Proceeding to manual setup');
  }

  onCredentialsSubmitted(authData: AuthenticationData): void {
    console.log('Credentials submitted:', authData);
    
    // Store authentication data
    this.authenticationData = authData;
    
    // Mark authentication step as completed
    this.completedSteps.add('authentication');
    this.currentStep = 'testing';
    
    // Advance to testing step
    setTimeout(() => {
      this.stepper.next();
    }, 100);
    
    // Start connection testing
    this.testingLoading = true;
    
    // Prepare connection test request
    const testRequest = {
      EmailAddress: this.submittedEmail,
      Password: authData.password,
      ServerHost: authData.manualConfig?.serverHost || this.discoveryResult?.config?.serverHost || 'outlook.office365.com',
      ServerPort: authData.manualConfig?.serverPort || this.discoveryResult?.config?.serverPort || 993,
      UseSsl: authData.manualConfig?.useSsl !== undefined ? authData.manualConfig.useSsl : (this.discoveryResult?.config?.useSsl || true),
      EwsUrl: authData.manualConfig?.ewsUrl || this.discoveryResult?.config?.ewsUrl
    };
    
    console.log('Testing connection with request:', testRequest);
    
    // Call the connection testing API
    this.http.post<any>('/api/accounts/test-connection', testRequest)
      .subscribe({
        next: (testResult) => {
          console.log('Connection test result:', testResult);
          this.testingResult = testResult;
          this.testingLoading = false;
          
          if (testResult.success) {
            // If test successful, create the account
            this.createAccount(authData);
          } else {
            // Handle test failure
            console.error('Connection test failed:', testResult.errorMessage);
          }
        },
        error: (error) => {
          console.error('Connection test error:', error);
          this.testingResult = {
            success: false,
            errorMessage: 'Failed to test connection. Please check your credentials.',
            testSteps: []
          };
          this.testingLoading = false;
        }
      });
  }

  proceedToTesting(): void {
    this.completedSteps.add('authentication');
    this.currentStep = 'testing';
    this.stepper.next();
    console.log('Proceeding to testing step');
  }

  proceedToComplete(): void {
    this.completedSteps.add('testing');
    this.currentStep = 'complete';
    this.stepper.next();
    console.log('Testing completed successfully');
  }

  createAccount(authData: AuthenticationData): void {
    console.log('Creating account...');
    
    const createRequest = {
      AccountName: authData.accountName || this.submittedEmail,
      EmailAddress: this.submittedEmail,
      Username: authData.email || this.submittedEmail,
      Password: authData.password,
      DisplayName: authData.displayName || this.submittedEmail.split('@')[0],
      ServerConfig: {
        EwsUrl: authData.manualConfig?.ewsUrl || this.discoveryResult?.config?.ewsUrl || 'https://outlook.office365.com/EWS/Exchange.asmx',
        ServerHost: authData.manualConfig?.serverHost || this.discoveryResult?.config?.serverHost || 'outlook.office365.com',
        ServerPort: authData.manualConfig?.serverPort || this.discoveryResult?.config?.serverPort || 993,
        UseSsl: authData.manualConfig?.useSsl !== undefined ? authData.manualConfig.useSsl : (this.discoveryResult?.config?.useSsl || true),
        DisplayName: this.discoveryResult?.config?.displayName || 'Email Server',
        AutodiscoverMethod: this.discoveryResult?.config?.autodiscoverMethod || 'Manual'
      }
    };
    
    this.http.post<any>('/api/accounts', createRequest)
      .subscribe({
        next: (createResult) => {
          console.log('Account created successfully:', createResult);
          this.proceedToComplete();
        },
        error: (error) => {
          console.error('Account creation error:', error);
          // Handle account creation failure
        }
      });
  }
  
  finishSetup(): void {
    this.completedSteps.add('testing');
    this.completedSteps.add('complete');
    console.log('Setup completed!');
    // Navigate to main email interface
  }

  isStepCompleted(step: string): boolean {
    return this.completedSteps.has(step);
  }

}