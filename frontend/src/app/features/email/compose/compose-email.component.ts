import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { EmailActions } from '../../../store/email/email.actions';
import { selectEmailAccounts, selectSelectedAccountId } from '../../../store/email/email.selectors';
import { EmailAccount, EmailDraft } from '../../../core/models/email.model';

interface EmailAttachmentFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
}

@Component({
  selector: 'app-compose-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatDividerModule,
    MatListModule,
    CdkTextareaAutosize
  ],
  template: `
    <div class="compose-container">
      <mat-card class="compose-card">
        <mat-card-header>
          <div class="compose-header">
            <h2>
              <mat-icon>edit</mat-icon>
              Compose Email
            </h2>
            <div class="header-actions">
              <button mat-icon-button 
                      [matMenuTriggerFor]="moreMenu"
                      matTooltip="More options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #moreMenu="matMenu">
                <button mat-menu-item (click)="loadDraft()">
                  <mat-icon>drafts</mat-icon>
                  Load Draft
                </button>
                <button mat-menu-item (click)="clearForm()">
                  <mat-icon>clear</mat-icon>
                  Clear Form
                </button>
              </mat-menu>
              
              <button mat-icon-button 
                      (click)="close()"
                      matTooltip="Close">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="composeForm" class="compose-form">
            <!-- From Account Selection -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>From</mat-label>
              <mat-select formControlName="fromAccount">
                @for (account of emailAccounts(); track account.id) {
                  <mat-option [value]="account.id">
                    <div class="account-option">
                      <span class="account-name">{{ account.displayName || account.email }}</span>
                      <span class="account-email">{{ account.email }}</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <!-- Recipients -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>To</mat-label>
              <mat-chip-grid #toChipGrid>
                @for (recipient of toRecipients(); track recipient) {
                  <mat-chip-row 
                    (removed)="removeRecipient('to', recipient)"
                    [editable]="true">
                    {{ recipient }}
                    <button matChipRemove>
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-row>
                }
                <input 
                  placeholder="Enter recipient email..."
                  #toInput
                  formControlName="toInput"
                  [matChipInputFor]="toChipGrid"
                  (matChipInputTokenEnd)="addRecipient('to', $event)"
                  [matAutocomplete]="recipientAuto">
              </mat-chip-grid>
              <mat-icon matSuffix>email</mat-icon>
              @if (composeForm.get('toInput')?.hasError('email')) {
                <mat-error>Please enter a valid email address</mat-error>
              }
            </mat-form-field>

            <!-- CC and BCC Toggle -->
            <div class="recipient-toggles">
              @if (!showCC()) {
                <button type="button" 
                        mat-button 
                        (click)="toggleCC()"
                        class="toggle-button">
                  Add CC
                </button>
              }
              @if (!showBCC()) {
                <button type="button" 
                        mat-button 
                        (click)="toggleBCC()"
                        class="toggle-button">
                  Add BCC
                </button>
              }
            </div>

            <!-- CC Field -->
            @if (showCC()) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>CC</mat-label>
                <mat-chip-grid #ccChipGrid>
                  @for (recipient of ccRecipients(); track recipient) {
                    <mat-chip-row 
                      (removed)="removeRecipient('cc', recipient)"
                      [editable]="true">
                      {{ recipient }}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                  }
                  <input 
                    placeholder="Enter CC email..."
                    #ccInput
                    formControlName="ccInput"
                    [matChipInputFor]="ccChipGrid"
                    (matChipInputTokenEnd)="addRecipient('cc', $event)"
                    [matAutocomplete]="recipientAuto">
                </mat-chip-grid>
                <mat-icon matSuffix>content_copy</mat-icon>
              </mat-form-field>
            }

            <!-- BCC Field -->
            @if (showBCC()) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>BCC</mat-label>
                <mat-chip-grid #bccChipGrid>
                  @for (recipient of bccRecipients(); track recipient) {
                    <mat-chip-row 
                      (removed)="removeRecipient('bcc', recipient)"
                      [editable]="true">
                      {{ recipient }}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                  }
                  <input 
                    placeholder="Enter BCC email..."
                    #bccInput
                    formControlName="bccInput"
                    [matChipInputFor]="bccChipGrid"
                    (matChipInputTokenEnd)="addRecipient('bcc', $event)"
                    [matAutocomplete]="recipientAuto">
                </mat-chip-grid>
                <mat-icon matSuffix>visibility_off</mat-icon>
              </mat-form-field>
            }

            <!-- Subject -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Subject</mat-label>
              <input matInput 
                     formControlName="subject"
                     placeholder="Enter email subject">
              <mat-icon matSuffix>subject</mat-icon>
            </mat-form-field>

            <!-- Attachments -->
            @if (attachments().length > 0) {
              <div class="attachments-section">
                <h4>Attachments</h4>
                <mat-list class="attachment-list">
                  @for (attachment of attachments(); track attachment.id) {
                    <mat-list-item class="attachment-item">
                      <mat-icon matListItemIcon>{{ getFileIcon(attachment.type) }}</mat-icon>
                      <div matListItemTitle>{{ attachment.name }}</div>
                      <div matListItemLine>{{ formatFileSize(attachment.size) }}</div>
                      <button mat-icon-button 
                              (click)="removeAttachment(attachment.id)"
                              matTooltip="Remove attachment">
                        <mat-icon>close</mat-icon>
                      </button>
                    </mat-list-item>
                  }
                </mat-list>
              </div>
            }

            <!-- Message Body -->
            <mat-form-field appearance="outline" class="full-width message-field">
              <mat-label>Message</mat-label>
              <textarea matInput 
                        formControlName="body"
                        cdkTextareaAutosize
                        cdkAutosizeMinRows="8"
                        cdkAutosizeMaxRows="20"
                        placeholder="Type your message here..."></textarea>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions class="compose-actions">
          <div class="action-buttons">
            <div class="primary-actions">
              <button mat-raised-button 
                      color="primary"
                      [disabled]="!canSend() || isSending()"
                      (click)="sendEmail()">
                @if (isSending()) {
                  <mat-spinner diameter="16"></mat-spinner>
                  Sending...
                } @else {
                  <mat-icon>send</mat-icon>
                  Send
                }
              </button>

              <button mat-stroked-button 
                      [disabled]="isDraftSaving()"
                      (click)="saveDraft()">
                @if (isDraftSaving()) {
                  <mat-spinner diameter="16"></mat-spinner>
                  Saving...
                } @else {
                  <mat-icon>save</mat-icon>
                  Save Draft
                }
              </button>
            </div>

            <div class="secondary-actions">
              <input type="file" 
                     #fileInput
                     multiple
                     (change)="onFileSelected($event)"
                     style="display: none">
              
              <button mat-icon-button 
                      (click)="fileInput.click()"
                      matTooltip="Attach files">
                <mat-icon>attach_file</mat-icon>
              </button>

              <button mat-icon-button 
                      [matMenuTriggerFor]="formatMenu"
                      matTooltip="Formatting options">
                <mat-icon>format_paint</mat-icon>
              </button>
              <mat-menu #formatMenu="matMenu">
                <button mat-menu-item (click)="insertTemplate('signature')">
                  <mat-icon>draw</mat-icon>
                  Insert Signature
                </button>
                <button mat-menu-item (click)="insertTemplate('disclaimer')">
                  <mat-icon>info</mat-icon>
                  Insert Disclaimer
                </button>
              </mat-menu>

              <button mat-button 
                      color="warn"
                      (click)="close()">
                Cancel
              </button>
            </div>
          </div>
        </mat-card-actions>
      </mat-card>

      <!-- Autocomplete for recipients -->
      <mat-autocomplete #recipientAuto="matAutocomplete">
        <!-- Future: Add contact suggestions -->
      </mat-autocomplete>
    </div>
  `,
  styles: [`
    .compose-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
      min-height: calc(100vh - 64px);
    }

    .compose-card {
      width: 100%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .compose-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .compose-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #1976d2;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .compose-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .account-option {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .account-name {
      font-weight: 500;
    }

    .account-email {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .recipient-toggles {
      display: flex;
      gap: 8px;
      margin: -8px 0;
    }

    .toggle-button {
      min-width: auto;
      padding: 4px 8px;
      font-size: 0.875rem;
    }

    .message-field {
      margin-top: 8px;
    }

    .message-field textarea {
      font-family: inherit;
      line-height: 1.5;
    }

    .attachments-section {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      padding: 16px;
      background-color: rgba(0, 0, 0, 0.02);
    }

    .attachments-section h4 {
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.87);
      font-size: 1rem;
    }

    .attachment-list {
      padding: 0;
    }

    .attachment-item {
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .attachment-item:last-child {
      border-bottom: none;
    }

    .compose-actions {
      padding: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      background-color: rgba(0, 0, 0, 0.02);
    }

    .action-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .primary-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .secondary-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    mat-spinner {
      margin-right: 8px;
    }

    mat-chip-grid {
      min-height: 40px;
    }

    mat-chip-row {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .mat-mdc-form-field-subscript-wrapper {
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .compose-container {
        padding: 12px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .primary-actions,
      .secondary-actions {
        justify-content: center;
      }

      .compose-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .compose-header h2 {
        justify-content: center;
      }
    }
  `]
})
export class ComposeEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  emailAccounts = this.store.selectSignal(selectEmailAccounts);
  selectedAccountId = this.store.selectSignal(selectSelectedAccountId);

  // Form state
  composeForm!: FormGroup;

  // UI state signals
  showCC = signal(false);
  showBCC = signal(false);
  isSending = signal(false);
  isDraftSaving = signal(false);

  // Recipients signals
  toRecipients = signal<string[]>([]);
  ccRecipients = signal<string[]>([]);
  bccRecipients = signal<string[]>([]);

  // Attachments signal
  attachments = signal<EmailAttachmentFile[]>([]);

  // Computed properties
  canSend = computed(() => {
    const form = this.composeForm;
    return form?.valid && 
           this.toRecipients().length > 0 && 
           !this.isSending() &&
           !this.isDraftSaving();
  });

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValidation();
    this.setupAutosave();
  }

  private initializeForm(): void {
    this.composeForm = this.fb.group({
      fromAccount: [this.selectedAccountId() || '', Validators.required],
      toInput: ['', [Validators.email]],
      ccInput: ['', [Validators.email]],
      bccInput: ['', [Validators.email]],
      subject: [''],
      body: ['', Validators.required]
    });
  }

  private setupFormValidation(): void {
    // Clear input fields after adding recipients
    this.composeForm.get('toInput')?.valueChanges.subscribe(value => {
      if (!value) this.composeForm.get('toInput')?.setErrors(null);
    });
  }

  private setupAutosave(): void {
    // Auto-save draft every 30 seconds
    setInterval(() => {
      if (this.hasContent() && !this.isSending() && !this.isDraftSaving()) {
        this.saveDraft(true); // Silent save
      }
    }, 30000);
  }

  toggleCC(): void {
    this.showCC.set(!this.showCC());
  }

  toggleBCC(): void {
    this.showBCC.set(!this.showBCC());
  }

  addRecipient(type: 'to' | 'cc' | 'bcc', event: any): void {
    const email = event.value.trim();
    if (email && this.isValidEmail(email)) {
      const currentRecipients = this.getRecipientSignal(type);
      if (!currentRecipients().includes(email)) {
        currentRecipients.update(recipients => [...recipients, email]);
        this.clearInputField(type);
      }
    }
    event.chipInput!.clear();
  }

  removeRecipient(type: 'to' | 'cc' | 'bcc', email: string): void {
    const currentRecipients = this.getRecipientSignal(type);
    currentRecipients.update(recipients => recipients.filter(r => r !== email));
  }

  private getRecipientSignal(type: 'to' | 'cc' | 'bcc') {
    switch (type) {
      case 'to': return this.toRecipients;
      case 'cc': return this.ccRecipients;
      case 'bcc': return this.bccRecipients;
    }
  }

  private clearInputField(type: 'to' | 'cc' | 'bcc'): void {
    const fieldName = `${type}Input`;
    this.composeForm.get(fieldName)?.setValue('');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        const attachment: EmailAttachmentFile = {
          file,
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type
        };
        this.attachments.update(attachments => [...attachments, attachment]);
      });
      input.value = ''; // Clear input
    }
  }

  removeAttachment(id: string): void {
    this.attachments.update(attachments => attachments.filter(a => a.id !== id));
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video_file';
    if (mimeType.startsWith('audio/')) return 'audio_file';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word')) return 'description';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'table_chart';
    return 'attach_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  insertTemplate(type: 'signature' | 'disclaimer'): void {
    const body = this.composeForm.get('body');
    const currentValue = body?.value || '';
    
    let template = '';
    switch (type) {
      case 'signature':
        template = '\n\n---\nBest regards,\n[Your name]';
        break;
      case 'disclaimer':
        template = '\n\nThis email and any attachments are confidential and may be privileged.';
        break;
    }
    
    body?.setValue(currentValue + template);
  }

  async sendEmail(): Promise<void> {
    if (!this.canSend()) return;

    this.isSending.set(true);
    
    try {
      const emailData = this.buildEmailData();
      this.store.dispatch(EmailActions.sendEmail({ emailData }));
      
      this.snackBar.open('Email sent successfully!', 'Close', { duration: 3000 });
      this.router.navigate(['/emails']);
    } catch (error) {
      this.snackBar.open('Failed to send email. Please try again.', 'Close', { duration: 5000 });
    } finally {
      this.isSending.set(false);
    }
  }

  async saveDraft(silent = false): Promise<void> {
    if (!this.hasContent()) return;

    this.isDraftSaving.set(true);

    try {
      const draftData = this.buildEmailData();
      this.store.dispatch(EmailActions.saveDraft({ draftData }));
      
      if (!silent) {
        this.snackBar.open('Draft saved', 'Close', { duration: 2000 });
      }
    } catch (error) {
      if (!silent) {
        this.snackBar.open('Failed to save draft', 'Close', { duration: 3000 });
      }
    } finally {
      this.isDraftSaving.set(false);
    }
  }

  private buildEmailData(): any {
    const formValue = this.composeForm.value;
    return {
      accountId: formValue.fromAccount,
      to: this.toRecipients().join(';'),
      cc: this.ccRecipients().join(';'),
      bcc: this.bccRecipients().join(';'),
      subject: formValue.subject || '',
      body: formValue.body || '',
      attachments: this.attachments().map(a => a.file)
    };
  }

  private hasContent(): boolean {
    const form = this.composeForm;
    return !!(
      this.toRecipients().length > 0 ||
      this.ccRecipients().length > 0 ||
      this.bccRecipients().length > 0 ||
      form?.get('subject')?.value ||
      form?.get('body')?.value ||
      this.attachments().length > 0
    );
  }

  loadDraft(): void {
    // Future implementation: Load saved drafts
    this.snackBar.open('Load draft functionality coming soon', 'Close', { duration: 2000 });
  }

  clearForm(): void {
    this.composeForm.reset();
    this.toRecipients.set([]);
    this.ccRecipients.set([]);
    this.bccRecipients.set([]);
    this.attachments.set([]);
    this.showCC.set(false);
    this.showBCC.set(false);
    
    // Reset form account to default
    this.composeForm.patchValue({
      fromAccount: this.selectedAccountId() || ''
    });
  }

  close(): void {
    if (this.hasContent()) {
      const hasUnsavedChanges = confirm('You have unsaved changes. Do you want to save as draft before closing?');
      if (hasUnsavedChanges) {
        this.saveDraft();
      }
    }
    this.router.navigate(['/emails']);
  }
}