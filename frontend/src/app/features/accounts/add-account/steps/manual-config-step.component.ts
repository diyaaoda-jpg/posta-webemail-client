import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { AccountSetupStep } from '../../../../core/models/email.model';

@Component({
  selector: 'app-manual-config-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule
  ],
  template: `
    <div class="step-container">
      <div class="step-header">
        <h2>Manual Server Configuration</h2>
        <p>Help us find your email server by providing your server name or URL</p>
      </div>

      <form [formGroup]="manualForm" (ngSubmit)="onSubmit()" class="manual-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Server Name or URL</mat-label>
          <input 
            matInput 
            formControlName="serverInput"
            placeholder="autodiscover.worldposta.com">
          <mat-icon matSuffix>dns</mat-icon>
          @if (manualForm.get('serverInput')?.hasError('required') && manualForm.get('serverInput')?.touched) {
            <mat-error>Server input is required</mat-error>
          }
        </mat-form-field>

        <div class="step-actions">
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            [disabled]="manualForm.invalid">
            Test Configuration
            <mat-icon>search</mat-icon>
          </button>
        </div>
      </form>

      <!-- Examples Section -->
      <mat-card class="examples-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>info</mat-icon>
            What to enter?
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="examples-section">
            <div class="example-group">
              <h4>Server Names</h4>
              <ul class="examples-list">
                <li><code>autodiscover.{{ domainFromEmail() }}</code></li>
                <li><code>mail.{{ domainFromEmail() }}</code></li>
                <li><code>exchange.{{ domainFromEmail() }}</code></li>
                <li><code>owa.{{ domainFromEmail() }}</code></li>
              </ul>
            </div>
            
            <div class="example-group">
              <h4>Full URLs</h4>
              <ul class="examples-list">
                <li><code>https://autodiscover.{{ domainFromEmail() }}/autodiscover/autodiscover.xml</code></li>
                <li><code>https://{{ domainFromEmail() }}/autodiscover/autodiscover.xml</code></li>
                <li><code>https://owa.{{ domainFromEmail() }}/EWS/Exchange.asmx</code></li>
              </ul>
            </div>
          </div>
          
          <div class="tip">
            <mat-icon>lightbulb</mat-icon>
            <span>
              <strong>Tip:</strong> Start with just the server name. 
              We'll try different paths and protocols automatically.
            </span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Advanced Options -->
      <mat-expansion-panel class="advanced-options">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>settings</mat-icon>
            Advanced Options
          </mat-panel-title>
          <mat-panel-description>
            Manual server configuration
          </mat-panel-description>
        </mat-expansion-panel-header>
        
        <div class="advanced-content">
          <p>If you know the exact server details, you can provide them here:</p>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>EWS URL</mat-label>
            <input 
              matInput 
              formControlName="ewsUrl"
              placeholder="https://owa.example.com/EWS/Exchange.asmx">
          </mat-form-field>
          
          <div class="port-ssl-row">
            <mat-form-field appearance="outline">
              <mat-label>Port</mat-label>
              <input 
                matInput 
                type="number"
                formControlName="port"
                placeholder="443">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>SSL/TLS</mat-label>
              <input 
                matInput 
                formControlName="useSsl"
                placeholder="true">
            </mat-form-field>
          </div>
        </div>
      </mat-expansion-panel>

      <!-- Common Issues Help -->
      <mat-card class="help-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>help</mat-icon>
            Need Help?
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="help-section">
            <h4>Common Issues</h4>
            <ul>
              <li><strong>Don't know your server?</strong> Contact your IT administrator</li>
              <li><strong>Company network?</strong> You might need VPN access</li>
              <li><strong>Office 365?</strong> Try "outlook.office365.com"</li>
              <li><strong>Exchange Online?</strong> Try your domain's autodiscover</li>
            </ul>
          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .step-container {
      max-width: 700px;
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

    .manual-form {
      margin-bottom: 24px;
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

    .examples-card {
      margin: 24px 0;
    }

    .examples-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .example-group h4 {
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.87);
      font-size: 1rem;
    }

    .examples-list {
      margin: 0;
      padding-left: 20px;
      list-style: none;
    }

    .examples-list li {
      margin-bottom: 8px;
      font-family: 'Roboto Mono', monospace;
      font-size: 0.875rem;
      color: #1976d2;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .examples-list code {
      background: none;
      padding: 0;
      color: inherit;
    }

    .tip {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-top: 24px;
      color: #1565c0;
    }

    .tip mat-icon {
      margin-top: 2px;
    }

    .advanced-options {
      margin: 24px 0;
    }

    .advanced-content {
      padding: 16px 0;
    }

    .advanced-content p {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .port-ssl-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .help-card {
      margin-top: 24px;
    }

    .help-section h4 {
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.87);
    }

    .help-section ul {
      margin: 0;
      padding-left: 20px;
      color: rgba(0, 0, 0, 0.6);
    }

    .help-section li {
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .examples-section {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .port-ssl-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ManualConfigStepComponent implements OnInit {
  @Input() currentStep!: AccountSetupStep;
  @Input() emailAddress!: string;
  @Output() manualConfigSubmitted = new EventEmitter<{ serverInput: string; ewsUrl?: string; port?: number; useSsl?: boolean }>();

  private fb = inject(FormBuilder);

  manualForm!: FormGroup;

  ngOnInit(): void {
    this.manualForm = this.fb.group({
      serverInput: ['', [Validators.required]],
      ewsUrl: [''],
      port: [443],
      useSsl: [true]
    });
  }

  domainFromEmail(): string {
    if (!this.emailAddress) return 'example.com';
    const domain = this.emailAddress.split('@')[1];
    return domain || 'example.com';
  }

  onSubmit(): void {
    if (this.manualForm.valid) {
      const formValue = this.manualForm.value;
      this.manualConfigSubmitted.emit({
        serverInput: formValue.serverInput,
        ewsUrl: formValue.ewsUrl || undefined,
        port: formValue.port || undefined,
        useSsl: formValue.useSsl !== false
      });
    }
  }
}