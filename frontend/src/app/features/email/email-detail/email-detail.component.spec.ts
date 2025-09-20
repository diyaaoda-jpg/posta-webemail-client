import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { EmailDetailComponent } from './email-detail.component';
import { EmailActions } from '../../../store/email/email.actions';
import { UIActions } from '../../../store/ui/ui.actions';
import { EmailMessage } from '../../../core/models/email.model';

describe('EmailDetailComponent', () => {
  let component: EmailDetailComponent;
  let fixture: ComponentFixture<EmailDetailComponent>;
  let mockStore: MockStore;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;

  const mockEmail: EmailMessage = {
    id: '1',
    accountId: 'account-1',
    subject: 'Test Email',
    fromAddress: 'sender@example.com',
    fromName: 'Test Sender',
    toAddresses: 'recipient@example.com',
    ccAddresses: 'cc@example.com',
    bccAddresses: '',
    textBody: 'This is a test email body',
    htmlBody: '<p>This is a test email body</p>',
    receivedAt: new Date('2024-01-01T10:00:00Z'),
    sentAt: new Date('2024-01-01T09:59:00Z'),
    folderName: 'INBOX',
    isRead: false,
    isFlagged: false,
    isDeleted: false,
    attachments: [
      {
        id: 'att-1',
        fileName: 'document.pdf',
        fileSize: 1024000,
        contentType: 'application/pdf'
      }
    ],
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  };

  const initialState = {
    email: {
      selectedEmail: mockEmail,
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ id: '1' })
    };
    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);

    await TestBed.configureTestingModule({
      imports: [
        EmailDetailComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DomSanitizer, useValue: mockSanitizer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailDetailComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);

    spyOn(mockStore, 'dispatch');
    mockSanitizer.bypassSecurityTrustHtml.and.returnValue('sanitized-html' as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load email on init', () => {
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      EmailActions.loadEmail({ id: '1' })
    );
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/emails']);
  });

  it('should dispatch reply action with correct data', () => {
    component.reply();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      UIActions.openComposeDialog({
        composeData: {
          type: 'reply',
          to: 'sender@example.com',
          subject: 'Re: Test Email',
          inReplyTo: '1',
          originalBody: '<p>This is a test email body</p>'
        }
      })
    );
  });

  it('should dispatch reply all action with all recipients', () => {
    component.replyAll();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      UIActions.openComposeDialog({
        composeData: jasmine.objectContaining({
          type: 'replyAll',
          subject: 'Re: Test Email',
          to: jasmine.stringContaining('sender@example.com')
        })
      })
    );
  });

  it('should dispatch forward action with formatted body', () => {
    component.forward();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      UIActions.openComposeDialog({
        composeData: jasmine.objectContaining({
          type: 'forward',
          subject: 'Fwd: Test Email',
          attachments: mockEmail.attachments
        })
      })
    );
  });

  it('should toggle flag status', () => {
    component.toggleFlag();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      EmailActions.toggleFlag({
        id: '1',
        isFlagged: true
      })
    );
  });

  it('should mark email as read', () => {
    component.markAsRead(true);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      EmailActions.markAsRead({
        id: '1',
        isRead: true
      })
    );
  });

  it('should move email to folder', () => {
    component.moveToFolder('ARCHIVE');

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      EmailActions.moveToFolder({
        id: '1',
        folder: 'ARCHIVE'
      })
    );

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      UIActions.showSnackbar({
        message: 'Email moved to archive'
      })
    );
  });

  it('should delete email and navigate back', () => {
    component.deleteEmail();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      EmailActions.deleteEmail({ id: '1' })
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/emails']);
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1048576)).toBe('1 MB');
    expect(component.formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format date time correctly', () => {
    const date = new Date('2024-01-01T10:00:00Z');
    const formatted = component.formatDateTime(date);
    expect(formatted).toContain('2024');
  });

  it('should sanitize HTML content', () => {
    const htmlContent = '<script>alert("xss")</script><p>Safe content</p>';
    component.sanitizeHtml(htmlContent);
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(htmlContent);
  });

  it('should handle email with subject starting with Re:', () => {
    // Update the mock email
    mockStore.setState({
      email: {
        selectedEmail: { ...mockEmail, subject: 'Re: Original Subject' },
        loading: false,
        error: null
      }
    });

    component.reply();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      UIActions.openComposeDialog({
        composeData: jasmine.objectContaining({
          subject: 'Re: Original Subject' // Should not add another Re:
        })
      })
    );
  });

  it('should handle email without HTML body', () => {
    mockStore.setState({
      email: {
        selectedEmail: { ...mockEmail, htmlBody: null },
        loading: false,
        error: null
      }
    });

    component.reply();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      UIActions.openComposeDialog({
        composeData: jasmine.objectContaining({
          originalBody: 'This is a test email body' // Should use text body
        })
      })
    );
  });
});