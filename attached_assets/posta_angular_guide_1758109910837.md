# POSTA Angular Development Guide - Complete Implementation
**Building a Production-Ready Email Application for Millions of Users**

## Project Overview
Build POSTA - a comprehensive email application supporting IMAP and EWS protocols using Angular frontend with .NET Core backend. This implementation incorporates critical lessons learned from the JavaScript version and focuses on performance, scalability, and user experience for millions of users.

## Technology Stack (Enterprise Scale)
- **Frontend**: Angular 17 + Angular Material + PWA
- **Backend**: ASP.NET Core 8 Web API + SignalR
- **Database**: PostgreSQL with Read Replicas + Partitioning
- **Email Protocols**: MailKit (IMAP) + EWS Managed API (Exchange)
- **Authentication**: JWT Bearer tokens + Refresh tokens
- **Real-time**: SignalR Hub for live updates
- **Security**: Data Protection API + Azure Key Vault
- **File Storage**: Azure Blob Storage for attachments
- **Search**: Elasticsearch cluster
- **Caching**: Redis Cluster
- **State Management**: NgRx for complex state
- **Mobile**: PWA with Service Workers

## Project Structure (Feature-Based for Team Development)

```
POSTA/
├── frontend/                                    # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                           # Core services (singleton)
│   │   │   │   ├── services/
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── api.service.ts
│   │   │   │   │   ├── signalr.service.ts
│   │   │   │   │   └── tenant.service.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── tenant.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── auth.interceptor.ts
│   │   │   │   │   ├── error.interceptor.ts
│   │   │   │   │   └── loading.interceptor.ts
│   │   │   │   └── models/
│   │   │   │       ├── user.model.ts
│   │   │   │       ├── tenant.model.ts
│   │   │   │       └── api-response.model.ts
│   │   │   │
│   │   │   ├── shared/                         # Shared components/services
│   │   │   │   ├── components/
│   │   │   │   │   ├── loading-spinner/
│   │   │   │   │   ├── error-display/
│   │   │   │   │   └── confirmation-dialog/
│   │   │   │   ├── directives/
│   │   │   │   ├── pipes/
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── features/                       # Feature modules (team-based)
│   │   │   │   ├── authentication/             # Team: Auth
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── register/
│   │   │   │   │   │   └── forgot-password/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── auth-api.service.ts
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── login-request.model.ts
│   │   │   │   │   │   └── auth-response.model.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   └── auth-routing.module.ts
│   │   │   │   │
│   │   │   │   ├── email-management/           # Team: Email Core
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── email-list/
│   │   │   │   │   │   │   ├── email-list.component.ts
│   │   │   │   │   │   │   ├── email-list.component.html
│   │   │   │   │   │   │   └── email-list.component.scss
│   │   │   │   │   │   ├── email-viewer/
│   │   │   │   │   │   │   ├── email-viewer.component.ts
│   │   │   │   │   │   │   ├── email-viewer.component.html
│   │   │   │   │   │   │   └── email-viewer.component.scss
│   │   │   │   │   │   ├── email-compose/
│   │   │   │   │   │   │   ├── email-compose.component.ts
│   │   │   │   │   │   │   ├── email-compose.component.html
│   │   │   │   │   │   │   └── email-compose.component.scss
│   │   │   │   │   │   └── email-thread/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── email-api.service.ts
│   │   │   │   │   │   ├── email-cache.service.ts
│   │   │   │   │   │   └── email-sync.service.ts
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── email-message.model.ts
│   │   │   │   │   │   ├── email-address.model.ts
│   │   │   │   │   │   ├── email-account.model.ts
│   │   │   │   │   │   └── send-email-request.model.ts
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── email.actions.ts
│   │   │   │   │   │   ├── email.reducer.ts
│   │   │   │   │   │   ├── email.effects.ts
│   │   │   │   │   │   └── email.selectors.ts
│   │   │   │   │   ├── email.module.ts
│   │   │   │   │   └── email-routing.module.ts
│   │   │   │   │
│   │   │   │   ├── attachment-handling/        # Team: Files
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── attachment-upload/
│   │   │   │   │   │   ├── attachment-viewer/
│   │   │   │   │   │   └── attachment-list/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── attachment-api.service.ts
│   │   │   │   │   │   └── file-preview.service.ts
│   │   │   │   │   ├── models/
│   │   │   │   │   │   └── attachment.model.ts
│   │   │   │   │   └── attachment.module.ts
│   │   │   │   │
│   │   │   │   ├── search-filtering/           # Team: Search
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── advanced-search/
│   │   │   │   │   │   ├── search-results/
│   │   │   │   │   │   └── saved-searches/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── search-api.service.ts
│   │   │   │   │   ├── models/
│   │   │   │   │   │   └── search-request.model.ts
│   │   │   │   │   └── search.module.ts
│   │   │   │   │
│   │   │   │   ├── notification-system/        # Team: Real-time
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── notification-toast/
│   │   │   │   │   │   └── notification-center/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── notification.service.ts
│   │   │   │   │   └── notification.module.ts
│   │   │   │   │
│   │   │   │   ├── user-preferences/           # Team: Settings
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── general-settings/
│   │   │   │   │   │   ├── email-settings/
│   │   │   │   │   │   └── theme-settings/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── preferences-api.service.ts
│   │   │   │   │   └── preferences.module.ts
│   │   │   │   │
│   │   │   │   └── analytics/                  # Team: Metrics
│   │   │   │       ├── components/
│   │   │   │       │   └── usage-dashboard/
│   │   │   │       ├── services/
│   │   │   │       │   └── analytics-api.service.ts
│   │   │   │       └── analytics.module.ts
│   │   │   │
│   │   │   ├── layout/                         # Application layout
│   │   │   │   ├── components/
│   │   │   │   │   ├── header/
│   │   │   │   │   ├── sidebar/
│   │   │   │   │   └── footer/
│   │   │   │   └── layout.module.ts
│   │   │   │
│   │   │   ├── app-routing.module.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   ├── app.component.scss
│   │   │   └── app.module.ts
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── i18n/
│   │   │
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   ├── _themes.scss
│   │   │   └── styles.scss
│   │   │
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── manifest.json              # PWA manifest
│   │   └── ngsw-config.json          # Service worker config
│   │
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── karma.conf.js
│
├── backend/                                     # .NET Core Backend
│   ├── src/
│   │   ├── POSTA.Api/                          # Main API
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.cs
│   │   │   │   ├── EmailsController.cs
│   │   │   │   ├── AttachmentsController.cs
│   │   │   │   ├── SearchController.cs
│   │   │   │   └── UsersController.cs
│   │   │   ├── Hubs/                          # SignalR hubs
│   │   │   │   └── EmailNotificationHub.cs
│   │   │   ├── Middleware/
│   │   │   │   ├── TenantResolutionMiddleware.cs
│   │   │   │   ├── RateLimitingMiddleware.cs
│   │   │   │   └── ErrorHandlingMiddleware.cs
│   │   │   ├── Program.cs
│   │   │   └── Startup.cs
│   │   │
│   │   ├── POSTA.Core/                         # Business Logic
│   │   │   ├── Domain/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── User.cs
│   │   │   │   │   ├── Tenant.cs
│   │   │   │   │   ├── EmailMessage.cs
│   │   │   │   │   ├── EmailAccount.cs
│   │   │   │   │   └── EmailAttachment.cs
│   │   │   │   ├── ValueObjects/
│   │   │   │   │   ├── EmailAddress.cs
│   │   │   │   │   ├── TenantId.cs
│   │   │   │   │   └── UserId.cs
│   │   │   │   └── Events/
│   │   │   ├── Application/
│   │   │   │   ├── Features/
│   │   │   │   │   ├── Authentication/
│   │   │   │   │   ├── EmailManagement/
│   │   │   │   │   ├── AttachmentHandling/
│   │   │   │   │   └── SearchFiltering/
│   │   │   │   ├── Interfaces/
│   │   │   │   └── Services/
│   │   │   └── Shared/
│   │   │       ├── DTOs/
│   │   │       ├── Enums/
│   │   │       └── Constants/
│   │   │
│   │   ├── POSTA.Infrastructure/               # External Services
│   │   │   ├── Data/
│   │   │   │   ├── Context/
│   │   │   │   │   └── PostaContext.cs
│   │   │   │   ├── Repositories/
│   │   │   │   ├── Configurations/
│   │   │   │   └── Migrations/
│   │   │   ├── Email/
│   │   │   │   ├── ImapService.cs
│   │   │   │   ├── EwsService.cs
│   │   │   │   └── EmailSyncService.cs
│   │   │   ├── Storage/
│   │   │   │   └── BlobStorageService.cs
│   │   │   ├── Search/
│   │   │   │   └── ElasticsearchService.cs
│   │   │   ├── Caching/
│   │   │   │   └── RedisCacheService.cs
│   │   │   └── Messaging/
│   │   │       └── ServiceBusService.cs
│   │   │
│   │   └── POSTA.BackgroundServices/           # Background processing
│   │       ├── EmailSyncWorker.cs
│   │       ├── IndexingWorker.cs
│   │       └── AnalyticsWorker.cs
│   │
│   └── tests/
│       ├── POSTA.Tests.Unit/
│       ├── POSTA.Tests.Integration/
│       └── POSTA.Tests.E2E/
│
├── infrastructure/                              # Infrastructure as Code
│   ├── kubernetes/
│   ├── terraform/
│   └── docker/
│
└── docs/
    ├── features/
    ├── api/
    └── deployment/
```

## CRITICAL LESSONS LEARNED IMPLEMENTATION

### 1. Reply Auto-Population Fix (TypeScript Models)
```typescript
// frontend/src/app/features/email-management/models/email-address.model.ts
export interface EmailAddress {
  address: string;
  name?: string;
  displayName?: string;
}

export class EmailAddressHelper {
  static parse(emailString: string): EmailAddress[] {
    if (!emailString?.trim()) return [];
    
    const addresses: EmailAddress[] = [];
    const parts = emailString.split(/[,;]/);
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      // Handle "Name <email>" format
      const match = trimmed.match(/^(.+?)\s*<(.+?)>$/);
      if (match) {
        addresses.push({
          name: match[1].trim().replace(/^"|"$/g, ''),
          address: match[2].trim(),
          displayName: `${match[1].trim()} <${match[2].trim()}>`
        });
      } else {
        addresses.push({
          address: trimmed,
          displayName: trimmed
        });
      }
    }
    
    return addresses;
  }
  
  static format(addresses: EmailAddress[]): string {
    return addresses
      .map(addr => addr.name ? `${addr.name} <${addr.address}>` : addr.address)
      .join(', ');
  }
}

// frontend/src/app/features/email-management/models/email-message.model.ts
export interface EmailMessage {
  id: string;
  userId: string;
  accountId: string;
  serverMessageId: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo: EmailAddress[];  // CRITICAL: Store reply-to addresses
  textBody: string;
  htmlBody: string;
  date: Date;
  isRead: boolean;
  isFlagged: boolean;
  priority: EmailPriority;
  folderName: string;
  threadId?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string;
  attachments: EmailAttachment[];
}

// CRITICAL: Reply creation service (lesson learned)
// frontend/src/app/features/email-management/services/email-compose.service.ts
@Injectable({
  providedIn: 'root'
})
export class EmailComposeService {
  
  createReply(originalMessage: EmailMessage, replyAll: boolean = false): EmailMessage {
    const reply: EmailMessage = {
      id: '',
      userId: originalMessage.userId,
      accountId: originalMessage.accountId,
      serverMessageId: '',
      // FIXED: Use replyTo if present, otherwise from address
      to: originalMessage.replyTo.length > 0 
        ? [...originalMessage.replyTo] 
        : [originalMessage.from],
      cc: [],
      bcc: [],
      replyTo: [],
      subject: originalMessage.subject.toLowerCase().startsWith('re:')
        ? originalMessage.subject
        : `Re: ${originalMessage.subject}`,
      from: { address: '', name: '' }, // Will be set by backend
      textBody: this.buildReplyTextBody(originalMessage),
      htmlBody: this.buildReplyHtmlBody(originalMessage),
      date: new Date(),
      isRead: true,
      isFlagged: false,
      priority: EmailPriority.Normal,
      folderName: 'Drafts',
      threadId: originalMessage.threadId || originalMessage.id,
      inReplyTo: originalMessage.messageId,
      references: this.buildReferencesHeader(originalMessage),
      attachments: []
    };
    
    if (replyAll) {
      // Add all original recipients except current user
      const currentUserAddresses = this.getCurrentUserAddresses();
      const allRecipients = [...originalMessage.to, ...originalMessage.cc];
      
      reply.cc = allRecipients.filter(addr => 
        !currentUserAddresses.some(userAddr => 
          userAddr.toLowerCase() === addr.address.toLowerCase()) &&
        !reply.to.some(toAddr => 
          toAddr.address.toLowerCase() === addr.address.toLowerCase())
      );
    }
    
    return reply;
  }
  
  private buildReplyHtmlBody(original: EmailMessage): string {
    const replyHeader = `<br><br>On ${new Date(original.date).toLocaleString()}, ${original.from.displayName} wrote:<br>`;
    const quotedBody = `<blockquote style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 0;">${original.htmlBody}</blockquote>`;
    return replyHeader + quotedBody;
  }
  
  private buildReplyTextBody(original: EmailMessage): string {
    const replyHeader = `\n\nOn ${new Date(original.date).toLocaleString()}, ${original.from.displayName} wrote:\n`;
    const quotedBody = original.textBody.split('\n').map(line => `> ${line}`).join('\n');
    return replyHeader + quotedBody;
  }
}
```

### 2. HTML Email Sanitization (Angular Implementation)
```typescript
// frontend/src/app/shared/services/html-sanitizer.service.ts
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root'
})
export class HtmlSanitizerService {
  
  constructor(private domSanitizer: DomSanitizer) {}
  
  sanitizeEmailHtml(htmlContent: string): SafeHtml {
    if (!htmlContent?.trim()) {
      return this.domSanitizer.bypassSecurityTrustHtml('');
    }
    
    // Configure DOMPurify for email content
    const cleanHtml = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
        'blockquote', 'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody'
      ],
      ALLOWED_ATTR: [
        'style', 'href', 'src', 'alt', 'title', 'width', 'height', 'border'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      KEEP_CONTENT: true,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      SANITIZE_DOM: true
    });
    
    // Additional cleaning for email-specific security
    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');
    
    // Remove any remaining dangerous elements
    const dangerousElements = doc.querySelectorAll('script, object, embed, applet, form');
    dangerousElements.forEach(el => el.remove());
    
    // Clean up style attributes
    const elementsWithStyle = doc.querySelectorAll('[style]');
    elementsWithStyle.forEach(el => {
      const style = el.getAttribute('style') || '';
      el.setAttribute('style', this.sanitizeStyleAttribute(style));
    });
    
    return this.domSanitizer.bypassSecurityTrustHtml(doc.body.innerHTML);
  }
  
  convertToPlainText(htmlContent: string): string {
    if (!htmlContent?.trim()) return '';
    
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  }
  
  private sanitizeStyleAttribute(style: string): string {
    // Remove dangerous CSS properties
    const dangerousProperties = ['javascript:', 'expression(', 'behavior:', 'binding:', '-moz-binding'];
    
    let cleanStyle = style;
    dangerousProperties.forEach(dangerous => {
      cleanStyle = cleanStyle.replace(new RegExp(dangerous, 'gi'), '');
    });
    
    return cleanStyle;
  }
}
```

### 3. Angular Email List with Virtual Scrolling (Superior Performance)
```typescript
// frontend/src/app/features/email-management/components/email-list/email-list.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, shareReplay } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EmailMessage } from '../../models/email-message.model';
import { EmailState } from '../../store/email.reducer';
import { EmailActions } from '../../store/email.actions';
import { EmailSelectors } from '../../store/email.selectors';
import { EmailComposeComponent } from '../email-compose/email-compose.component';
import { SignalRService } from '../../../../core/services/signalr.service';

@Component({
  selector: 'app-email-list',
  templateUrl: './email-list.component.html',
  styleUrls: ['./email-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailListComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport, { static: true })
  viewport!: CdkVirtualScrollViewport;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new BehaviorSubject<string>('');
  
  emails$: Observable<EmailMessage[]>;
  loading$: Observable<boolean>;
  selectedEmails$ = new BehaviorSubject<Set<string>>(new Set());
  
  searchQuery = '';
  itemSize = 72; // Height of each email item
  
  constructor(
    private store: Store<EmailState>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private signalRService: SignalRService
  ) {
    this.emails$ = this.store.select(EmailSelectors.getFilteredEmails);
    this.loading$ = this.store.select(EmailSelectors.getLoading);
  }
  
  ngOnInit(): void {
    this.setupSearch();
    this.setupRealTimeUpdates();
    this.loadEmails();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.store.dispatch(EmailActions.searchEmails({ query }));
        return this.emails$;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  
  private setupRealTimeUpdates(): void {
    // Listen for new email notifications
    this.signalRService.onNewEmailReceived()
      .pipe(takeUntil(this.destroy$))
      .subscribe(emailNotification => {
        this.store.dispatch(EmailActions.newEmailReceived({ email: emailNotification }));
        this.showNewEmailToast(emailNotification);
      });
      
    // Listen for email read status changes
    this.signalRService.onEmailReadStatusChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ emailId, isRead }) => {
        this.store.dispatch(EmailActions.updateEmailReadStatus({ emailId, isRead }));
      });
  }
  
  private loadEmails(): void {
    this.store.dispatch(EmailActions.loadEmails({ 
      folder: 'INBOX', 
      skip: 0, 
      take: 100 
    }));
  }
  
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }
  
  onEmailClick(email: EmailMessage): void {
    if (!email.isRead) {
      this.store.dispatch(EmailActions.markAsRead({ emailId: email.id }));
    }
    
    // Navigate to email detail or open in split view
    this.store.dispatch(EmailActions.selectEmail({ emailId: email.id }));
  }
  
  onReplyClick(email: EmailMessage, event: Event): void {
    event.stopPropagation();
    this.openComposeDialog(email, 'reply');
  }
  
  onReplyAllClick(email: EmailMessage, event: Event): void {
    event.stopPropagation();
    this.openComposeDialog(email, 'replyAll');
  }
  
  onForwardClick(email: EmailMessage, event: Event): void {
    event.stopPropagation();
    this.openComposeDialog(email, 'forward');
  }
  
  onToggleRead(email: EmailMessage, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(EmailActions.markAsRead({ 
      emailId: email.id, 
      isRead: !email.isRead 
    }));
  }
  
  onToggleFlag(email: EmailMessage, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(EmailActions.toggleFlag({ 
      emailId: email.id, 
      isFlagged: !email.isFlagged 
    }));
  }
  
  onDeleteEmail(email: EmailMessage, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(EmailActions.deleteEmail({ emailId: email.id }));
  }
  
  onLoadMore(): void {
    // Virtual scrolling will trigger this when user scrolls to bottom
    this.store.dispatch(EmailActions.loadMoreEmails());
  }
  
  private openComposeDialog(originalEmail: EmailMessage, mode: 'reply' | 'replyAll' | 'forward'): void {
    const dialogRef = this.dialog.open(EmailComposeComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      data: {
        mode,
        originalEmail
      },
      disableClose: true // Prevent accidental close
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open(
          mode === 'reply' ? 'Reply sent successfully!' : 
          mode === 'replyAll' ? 'Reply all sent successfully!' : 
          'Email forwarded successfully!',
          'Close',
          { duration: 3000 }
        );
        this.store.dispatch(EmailActions.loadEmails({ folder: 'INBOX', skip: 0, take: 100 }));
      }
    });
  }
  
  private showNewEmailToast(email: EmailMessage): void {
    const message = `New email from ${email.from.displayName || email.from.address}`;
    this.snackBar.open(message, 'View', { duration: 5000 });
  }
  
  trackByEmailId(index: number, email: EmailMessage): string {
    return email.id;
  }
}
```

```html
<!-- frontend/src/app/features/email-management/components/email-list/email-list.component.html -->
<div class="email-list-container">
  <div class="email-toolbar">
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Search emails...</mat-label>
      <input matInput 
             [(ngModel)]="searchQuery"
             (ngModelChange)="onSearchChange($event)"
             [matAutocomplete]="autoComplete"
             placeholder="Search emails...">
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>
    
    <div class="toolbar-actions">
      <button mat-raised-button 
              color="primary"
              (click)="onComposeNew()">
        <mat-icon>create</mat-icon>
        Compose
      </button>
      
      <button mat-icon-button 
              matTooltip="Refresh"
              (click)="onRefresh()">
        <mat-icon>refresh</mat-icon>
      </button>
      
      <button mat-icon-button 
              matTooltip="Mark all as read"
              (click)="onMarkAllRead()">
        <mat-icon>mark_email_read</mat-icon>
      </button>
    </div>
  </div>
  
  <div class="email-list-content">
    <div class="loading-indicator" *ngIf="loading$ | async">
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </div>
    
    <cdk-virtual-scroll-viewport 
      #viewport
      itemSize="72" 
      class="email-viewport"
      [class.loading]="loading$ | async">
      
      <div *cdkVirtualFor="let email of emails$ | async; trackBy: trackByEmailId"
           class="email-item"
           [class.unread]="!email.isRead"
           [class.flagged]="email.isFlagged"
           [class.high-priority]="email.priority === 'High'"
           (click)="onEmailClick(email)">
        
        <div class="email-checkbox">
          <mat-checkbox 
            [checked]="(selectedEmails$ | async)?.has(email.id)"
            (click)="$event.stopPropagation()"
            (change)="onEmailSelect(email, $event.checked)">
          </mat-checkbox>
        </div>
        
        <div class="email-content">
          <div class="email-header">
            <div class="email-from">
              <span class="sender-name" [title]="email.from.address">
                {{ email.from.displayName || email.from.address }}
              </span>
              <mat-icon *ngIf="email.priority === 'High'" 
                       class="priority-icon high"
                       title="High Priority">
                priority_high
              </mat-icon>
            </div>
            
            <div class="email-date">
              {{ email.date | date:'short' }}
            </div>
          </div>
          
          <div class="email-subject">
            <mat-icon *ngIf="!email.isRead" class="unread-indicator">fiber_manual_record</mat-icon>
            <span [title]="email.subject">{{ email.subject || '(no subject)' }}</span>
            <mat-icon *ngIf="email.attachments.length > 0" class="attachment-icon">attach_file</mat-icon>
          </div>
          
          <div class="email-preview">
            {{ email.textBody | slice:0:100 }}{{ email.textBody.length > 100 ? '...' : '' }}
          </div>
        </div>
        
        <div class="email-actions">
          <button mat-icon-button 
                  matTooltip="Reply"
                  (click)="onReplyClick(email, $event)">
            <mat-icon>reply</mat-icon>
          </button>
          
          <button mat-icon-button 
                  matTooltip="Reply All"
                  (click)="onReplyAllClick(email, $event)">
            <mat-icon>reply_all</mat-icon>
          </button>
          
          <button mat-icon-button 
                  matTooltip="Forward"
                  (click)="onForwardClick(email, $event)">
            <mat-icon>forward</mat-icon>
          </button>
          
          <button mat-icon-button 
                  [matTooltip]="email.isRead ? 'Mark as unread' : 'Mark as read'"
                  (click)="onToggleRead(email, $event)">
            <mat-icon>{{ email.isRead ? 'mark_email_unread' : 'mark_email_read' }}</mat-icon>
          </button>
          
          <button mat-icon-button 
                  [matTooltip]="email.isFlagged ? 'Remove flag' : 'Add flag'"
                  [class.flagged]="email.isFlagged"
                  (click)="onToggleFlag(email, $event)">
            <mat-icon>{{ email.isFlagged ? 'flag' : 'outlined_flag' }}</mat-icon>
          </button>
          
          <button mat-icon-button 
                  matTooltip="Delete"
                  color="warn"
                  (click)="onDeleteEmail(email, $event)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
    </cdk-virtual-scroll-viewport>
  </div>
</div>
```

### 4. Angular Email Compose Component (Superior Rich Text Editing)
```typescript
// frontend/src/app/features/email-management/components/email-compose/email-compose.component.ts
import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { QuillEditorComponent } from 'ngx-quill';
import Quill from 'quill';

import { EmailMessage } from '../../models/email-message.model';
import { EmailAddress } from '../../models/email-address.model';
import { EmailApiService } from '../../services/email-api.service';
import { EmailComposeService } from '../../services/email-compose.service';
import { AttachmentService } from '../../../attachment-handling/services/attachment-api.service';
import { HtmlSanitizerService } from '../../../../shared/services/html-sanitizer.service';

interface ComposeDialogData {
  mode: 'new' | 'reply' | 'replyAll' | 'forward';
  originalEmail?: EmailMessage;
}

@Component({
  selector: 'app-email-compose',
  templateUrl: './email-compose.component.html',
  styleUrls: ['./email-compose.component.scss']
})
export class EmailComposeComponent implements OnInit, OnDestroy {
  @ViewChild('quillEditor', { static: false }) quillEditor!: QuillEditorComponent;
  
  private destroy$ = new Subject<void>();
  private autoSaveSubject = new BehaviorSubject<EmailMessage | null>(null);
  
  composeForm: FormGroup;
  sending = false;
  attachments: File[] = [];
  uploadProgress: { [key: string]: number } = {};
  
  // Rich text editor configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmailComposeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComposeDialogData,
    private emailApiService: EmailApiService,
    private emailComposeService: EmailComposeService,
    private attachmentService: AttachmentService,
    private htmlSanitizer: HtmlSanitizerService,
    private snackBar: MatSnackBar
  ) {
    this.composeForm = this.createForm();
  }
  
  ngOnInit(): void {
    this.initializeEmail();
    this.setupAutoSave();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private createForm(): FormGroup {
    return this.fb.group({
      to: ['', [Validators.required, this.emailAddressValidator]],
      cc: ['', [this.emailAddressValidator]],
      bcc: ['', [this.emailAddressValidator]],
      subject: ['', [Validators.required, Validators.maxLength(255)]],
      body: [''],
      priority: ['Normal']
    });
  }
  
  private initializeEmail(): void {
    if (this.data.originalEmail && this.data.mode !== 'new') {
      const draft = this.createDraftFromOriginal();
      this.populateForm(draft);
    }
  }
  
  private createDraftFromOriginal(): EmailMessage {
    const { originalEmail, mode } = this.data;
    if (!originalEmail) throw new Error('Original email required');
    
    switch (mode) {
      case 'reply':
        return this.emailComposeService.createReply(originalEmail, false);
      case 'replyAll':
        return this.emailComposeService.createReply(originalEmail, true);
      case 'forward':
        return this.emailComposeService.createForward(originalEmail);
      default:
        throw new Error(`Unsupported compose mode: ${mode}`);
    }
  }
  
  private populateForm(email: EmailMessage): void {
    this.composeForm.patchValue({
      to: this.formatAddresses(email.to),
      cc: this.formatAddresses(email.cc),
      bcc: this.formatAddresses(email.bcc),
      subject: email.subject,
      body: email.htmlBody,
      priority: email.priority
    });
  }
  
  private formatAddresses(addresses: EmailAddress[]): string {
    return addresses.map(addr => 
      addr.name ? `${addr.name} <${addr.address}>` : addr.address
    ).join(', ');
  }
  
  private setupAutoSave(): void {
    // Auto-save every 30 seconds
    this.composeForm.valueChanges
      .pipe(
        debounceTime(30000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.autoSave();
      });
  }
  
  private autoSave(): void {
    if (this.composeForm.dirty && this.composeForm.valid) {
      const draft = this.createEmailFromForm();
      // Save to drafts folder
      // this.emailApiService.saveDraft(draft).subscribe();
    }
  }
  
  onSend(): void {
    if (this.composeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    
    this.sending = true;
    const email = this.createEmailFromForm();
    
    this.emailApiService.sendEmail(email)
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.snackBar.open('Email sent successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close({ success: true });
          } else {
            this.snackBar.open(`Failed to send email: ${result.error}`, 'Close', { duration: 5000 });
            this.sending = false;
          }
        },
        error: (error) => {
          this.snackBar.open(`Error sending email: ${error.message}`, 'Close', { duration: 5000 });
          this.sending = false;
        }
      });
  }
  
  onSaveDraft(): void {
    const draft = this.createEmailFromForm();
    this.emailApiService.saveDraft(draft)
      .subscribe({
        next: () => {
          this.snackBar.open('Draft saved', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open(`Error saving draft: ${error.message}`, 'Close', { duration: 5000 });
        }
      });
  }
  
  private createEmailFromForm(): EmailMessage {
    const formValue = this.composeForm.value;
    
    return {
      id: '',
      userId: '',
      accountId: this.data.originalEmail?.accountId || '',
      serverMessageId: '',
      to: this.parseEmailAddresses(formValue.to),
      cc: this.parseEmailAddresses(formValue.cc),
      bcc: this.parseEmailAddresses(formValue.bcc),
      replyTo: [],
      subject: formValue.subject,
      from: { address: '', name: '' }, // Will be set by backend
      // CRITICAL: Sanitize HTML content before sending
      htmlBody: this.htmlSanitizer.convertToHtml(formValue.body),
      textBody: this.htmlSanitizer.convertToPlainText(formValue.body),
      date: new Date(),
      isRead: true,
      isFlagged: false,
      priority: formValue.priority,
      folderName: 'Sent',
      threadId: this.data.originalEmail?.threadId,
      inReplyTo: this.data.originalEmail?.messageId,
      references: this.data.originalEmail?.references,
      attachments: this.attachments.map(file => ({
        id: '',
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        blobPath: '',
        data: null // Will be handled separately
      }))
    } as EmailMessage;
  }
  
  private parseEmailAddresses(addressString: string): EmailAddress[] {
    if (!addressString?.trim()) return [];
    
    const addresses: EmailAddress[] = [];
    const parts = addressString.split(/[,;]/);
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      const match = trimmed.match(/^(.+?)\s*<(.+?)>$/);
      if (match) {
        addresses.push({
          name: match[1].trim().replace(/^"|"$/g, ''),
          address: match[2].trim(),
          displayName: `${match[1].trim()} <${match[2].trim()}>`
        });
      } else {
        addresses.push({
          address: trimmed,
          displayName: trimmed
        });
      }
    }
    
    return addresses;
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.attachments.push(...files);
      
      // Upload attachments immediately
      files.forEach(file => this.uploadAttachment(file));
    }
  }
  
  private uploadAttachment(file: File): void {
    this.uploadProgress[file.name] = 0;
    
    this.attachmentService.uploadAttachment(file)
      .subscribe({
        next: (event) => {
          if (event.type === 'progress') {
            this.uploadProgress[file.name] = event.progress;
          } else if (event.type === 'complete') {
            delete this.uploadProgress[file.name];
            this.snackBar.open(`${file.name} uploaded successfully`, 'Close', { duration: 2000 });
          }
        },
        error: (error) => {
          delete this.uploadProgress[file.name];
          this.removeAttachment(file);
          this.snackBar.open(`Failed to upload ${file.name}`, 'Close', { duration: 5000 });
        }
      });
  }
  
  removeAttachment(file: File): void {
    const index = this.attachments.indexOf(file);
    if (index > -1) {
      this.attachments.splice(index, 1);
    }
  }
  
  onCancel(): void {
    if (this.composeForm.dirty) {
      // Show confirmation dialog
      const confirmDialog = confirm('You have unsaved changes. Do you want to save as draft?');
      if (confirmDialog) {
        this.onSaveDraft();
      }
    }
    
    this.dialogRef.close({ success: false });
  }
  
  private emailAddressValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const addresses = value.split(/[,;]/).map((addr: string) => addr.trim());
    
    for (const addr of addresses) {
      if (addr && !emailPattern.test(addr.replace(/^.*<(.+)>$/, '$1'))) {
        return { invalidEmail: true };
      }
    }
    
    return null;
  }
  
  private markFormGroupTouched(): void {
    Object.keys(this.composeForm.controls).forEach(key => {
      this.composeForm.get(key)?.markAsTouched();
    });
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
```

### 5. NgRx State Management (Complex State Handling)
```typescript
// frontend/src/app/features/email-management/store/email.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { EmailMessage } from '../models/email-message.model';
import { SearchRequest } from '../models/search-request.model';

export const EmailActions = createActionGroup({
  source: 'Email',
  events: {
    // Load emails
    'Load Emails': props<{ folder: string; skip: number; take: number }>(),
    'Load Emails Success': props<{ emails: EmailMessage[]; totalCount: number }>(),
    'Load Emails Failure': props<{ error: string }>(),
    
    // Load more emails (pagination)
    'Load More Emails': emptyProps(),
    'Load More Emails Success': props<{ emails: EmailMessage[] }>(),
    'Load More Emails Failure': props<{ error: string }>(),
    
    // Search emails
    'Search Emails': props<{ query: string }>(),
    'Search Emails Success': props<{ emails: EmailMessage[]; totalCount: number }>(),
    'Search Emails Failure': props<{ error: string }>(),
    
    // Email operations
    'Select Email': props<{ emailId: string }>(),
    'Mark As Read': props<{ emailId: string; isRead?: boolean }>(),
    'Mark As Read Success': props<{ emailId: string; isRead: boolean }>(),
    'Mark As Read Failure': props<{ error: string }>(),
    
    'Toggle Flag': props<{ emailId: string; isFlagged?: boolean }>(),
    'Toggle Flag Success': props<{ emailId: string; isFlagged: boolean }>(),
    'Toggle Flag Failure': props<{ error: string }>(),
    
    'Delete Email': props<{ emailId: string }>(),
    'Delete Email Success': props<{ emailId: string }>(),
    'Delete Email Failure': props<{ error: string }>(),
    
    // Send email
    'Send Email': props<{ email: EmailMessage }>(),
    'Send Email Success': props<{ email: EmailMessage }>(),
    'Send Email Failure': props<{ error: string }>(),
    
    // Real-time updates
    'New Email Received': props<{ email: EmailMessage }>(),
    'Update Email Read Status': props<{ emailId: string; isRead: boolean }>(),
    
    // Sync operations
    'Sync Emails': props<{ accountId: string }>(),
    'Sync Emails Success': props<{ newEmails: EmailMessage[] }>(),
    'Sync Emails Failure': props<{ error: string }>(),
    
    // UI state
    'Set Loading': props<{ loading: boolean }>(),
    'Set Error': props<{ error: string | null }>(),
    'Clear Error': emptyProps()
  }
});

// frontend/src/app/features/email-management/store/email.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { EmailMessage } from '../models/email-message.model';
import { EmailActions } from './email.actions';

export interface EmailState {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  searchQuery: string;
  currentFolder: string;
  totalCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: EmailState = {
  emails: [],
  selectedEmailId: null,
  searchQuery: '',
  currentFolder: 'INBOX',
  totalCount: 0,
  loading: false,
  error: null,
  hasMore: true
};

export const emailReducer = createReducer(
  initialState,
  
  // Load emails
  on(EmailActions.loadEmails, (state, { folder }) => ({
    ...state,
    loading: true,
    error: null,
    currentFolder: folder,
    emails: [] // Clear existing emails when loading new folder
  })),
  
  on(EmailActions.loadEmailsSuccess, (state, { emails, totalCount }) => ({
    ...state,
    emails,
    totalCount,
    loading: false,
    hasMore: emails.length < totalCount
  })),
  
  on(EmailActions.loadEmailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load more emails
  on(EmailActions.loadMoreEmails, (state) => ({
    ...state,
    loading: true
  })),
  
  on(EmailActions.loadMoreEmailsSuccess, (state, { emails }) => ({
    ...state,
    emails: [...state.emails, ...emails],
    loading: false,
    hasMore: emails.length > 0
  })),
  
  // Search emails
  on(EmailActions.searchEmails, (state, { query }) => ({
    ...state,
    searchQuery: query,
    loading: true
  })),
  
  on(EmailActions.searchEmailsSuccess, (state, { emails, totalCount }) => ({
    ...state,
    emails,
    totalCount,
    loading: false
  })),
  
  // Email selection
  on(EmailActions.selectEmail, (state, { emailId }) => ({
    ...state,
    selectedEmailId: emailId
  })),
  
  // Mark as read
  on(EmailActions.markAsReadSuccess, (state, { emailId, isRead }) => ({
    ...state,
    emails: state.emails.map(email =>
      email.id === emailId ? { ...email, isRead } : email
    )
  })),
  
  // Toggle flag
  on(EmailActions.toggleFlagSuccess, (state, { emailId, isFlagged }) => ({
    ...state,
    emails: state.emails.map(email =>
      email.id === emailId ? { ...email, isFlagged } : email
    )
  })),
  
  // Delete email
  on(EmailActions.deleteEmailSuccess, (state, { emailId }) => ({
    ...state,
    emails: state.emails.filter(email => email.id !== emailId),
    selectedEmailId: state.selectedEmailId === emailId ? null : state.selectedEmailId
  })),
  
  // Real-time updates
  on(EmailActions.newEmailReceived, (state, { email }) => ({
    ...state,
    emails: [email, ...state.emails],
    totalCount: state.totalCount + 1
  })),
  
  on(EmailActions.updateEmailReadStatus, (state, { emailId, isRead }) => ({
    ...state,
    emails: state.emails.map(e =>
      e.id === emailId ? { ...e, isRead } : e
    )
  }))
);

// frontend/src/app/features/email-management/store/email.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmailState } from './email.reducer';

export const selectEmailState = createFeatureSelector<EmailState>('email');

export const EmailSelectors = {
  getEmails: createSelector(selectEmailState, state => state.emails),
  
  getFilteredEmails: createSelector(
    selectEmailState,
    state => {
      if (!state.searchQuery) return state.emails;
      
      const query = state.searchQuery.toLowerCase();
      return state.emails.filter(email =>
        email.subject.toLowerCase().includes(query) ||
        email.from.displayName?.toLowerCase().includes(query) ||
        email.from.address.toLowerCase().includes(query) ||
        email.textBody.toLowerCase().includes(query)
      );
    }
  ),
  
  getSelectedEmail: createSelector(
    selectEmailState,
    state => state.emails.find(email => email.id === state.selectedEmailId) || null
  ),
  
  getUnreadCount: createSelector(
    selectEmailState,
    state => state.emails.filter(email => !email.isRead).length
  ),
  
  getFlaggedEmails: createSelector(
    selectEmailState,
    state => state.emails.filter(email => email.isFlagged)
  ),
  
  getLoading: createSelector(selectEmailState, state => state.loading),
  getError: createSelector(selectEmailState, state => state.error),
  getHasMore: createSelector(selectEmailState, state => state.hasMore),
  getTotalCount: createSelector(selectEmailState, state => state.totalCount)
};

// frontend/src/app/features/email-management/store/email.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { EmailActions } from './email.actions';
import { EmailApiService } from '../services/email-api.service';
import { EmailSelectors } from './email.selectors';

@Injectable()
export class EmailEffects {
  
  loadEmails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.loadEmails),
      switchMap(action =>
        this.emailApiService.getEmails(action.folder, action.skip, action.take).pipe(
          map(result => EmailActions.loadEmailsSuccess({
            emails: result.emails,
            totalCount: result.totalCount
          })),
          catchError(error => of(EmailActions.loadEmailsFailure({
            error: error.message
          })))
        )
      )
    )
  );
  
  loadMoreEmails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.loadMoreEmails),
      withLatestFrom(this.store.select(EmailSelectors.getEmails)),
      switchMap(([action, currentEmails]) =>
        this.emailApiService.getEmails('INBOX', currentEmails.length, 50).pipe(
          map(result => EmailActions.loadMoreEmailsSuccess({
            emails: result.emails
          })),
          catchError(error => of(EmailActions.loadMoreEmailsFailure({
            error: error.message
          })))
        )
      )
    )
  );
  
  searchEmails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.searchEmails),
      switchMap(action =>
        this.emailApiService.searchEmails({
          query: action.query,
          skip: 0,
          take: 100
        }).pipe(
          map(result => EmailActions.searchEmailsSuccess({
            emails: result.emails,
            totalCount: result.totalCount
          })),
          catchError(error => of(EmailActions.searchEmailsFailure({
            error: error.message
          })))
        )
      )
    )
  );
  
  markAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.markAsRead),
      mergeMap(action =>
        this.emailApiService.markAsRead(action.emailId, action.isRead).pipe(
          map(result => EmailActions.markAsReadSuccess({
            emailId: action.emailId,
            isRead: result.isRead
          })),
          catchError(error => of(EmailActions.markAsReadFailure({
            error: error.message
          })))
        )
      )
    )
  );
  
  toggleFlag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.toggleFlag),
      mergeMap(action =>
        this.emailApiService.toggleFlag(action.emailId, action.isFlagged).pipe(
          map(result => EmailActions.toggleFlagSuccess({
            emailId: action.emailId,
            isFlagged: result.isFlagged
          })),
          catchError(error => of(EmailActions.toggleFlagFailure({
            error: error.message
          })))
        )
      )
    )
  );
  
  deleteEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.deleteEmail),
      mergeMap(action =>
        this.emailApiService.deleteEmail(action.emailId).pipe(
          map(() => EmailActions.deleteEmailSuccess({
            emailId: action.emailId
          })),
          catchError(error => of(EmailActions.deleteEmailFailure({
            error: error.message
          })))
        )
      )
    )
  );
  
  sendEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.sendEmail),
      switchMap(action =>
        this.emailApiService.sendEmail(action.email).pipe(
          map(result => EmailActions.sendEmailSuccess({
            email: result.email
          })),
          catchError(error => of(EmailActions.sendEmailFailure({
            error: error.message
          })))
        )
      )
    )
  );
  
  constructor(
    private actions$: Actions,
    private emailApiService: EmailApiService,
    private store: Store
  ) {}
}
```

## Backend Implementation (.NET Core - Multi-Tenant)

### 1. Domain Models (Strong Typing - Lessons Learned)
```csharp
// backend/src/POSTA.Core/Domain/ValueObjects/EmailAddress.cs
using System.Text.RegularExpressions;

namespace POSTA.Core.Domain.ValueObjects
{
    public class EmailAddress : ValueObject
    {
        public string Address { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public string DisplayName => string.IsNullOrEmpty(Name) ? Address : $"{Name} <{Address}>";
        
        private EmailAddress() { } // EF Core constructor
        
        public EmailAddress(string address, string? name = null)
        {
            if (string.IsNullOrWhiteSpace(address))
                throw new ArgumentException("Email address cannot be empty", nameof(address));
                
            if (!IsValidEmail(address))
                throw new ArgumentException("Invalid email format", nameof(address));
                
            Address = address.Trim().ToLowerInvariant();
            Name = name?.Trim() ?? string.Empty;
        }
        
        public static EmailAddress Parse(string emailString)
        {
            if (string.IsNullOrWhiteSpace(emailString))
                throw new ArgumentException("Email string cannot be empty", nameof(emailString));
                
            var trimmed = emailString.Trim();
            
            // Handle "Name <email>" format
            var match = Regex.Match(trimmed, @"^(.+?)\s*<(.+?)>$");
            if (match.Success)
            {
                return new EmailAddress(
                    match.Groups[2].Value.Trim(),
                    match.Groups[1].Value.Trim().Trim('"')
                );
            }
            
            return new EmailAddress(trimmed);
        }
        
        public static List<EmailAddress> ParseMultiple(string emailString)
        {
            if (string.IsNullOrWhiteSpace(emailString)) return new List<EmailAddress>();
            
            var addresses = new List<EmailAddress>();
            var parts = emailString.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var part in parts)
            {
                try
                {
                    addresses.Add(Parse(part));
                }
                catch (ArgumentException)
                {
                    // Skip invalid email addresses
                    continue;
                }
            }
            
            return addresses;
        }
        
        private static bool IsValidEmail(string email)
        {
            const string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase);
        }
        
        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Address;
        }
        
        public override string ToString() => DisplayName;
    }
}

// backend/src/POSTA.Core/Domain/Entities/EmailMessage.cs
namespace POSTA.Core.Domain.Entities
{
    public class EmailMessage : TenantEntity
    {
        public Guid UserId { get; private set; }
        public Guid AccountId { get; private set; }
        public string ServerMessageId { get; private set; } = string.Empty;
        public string Subject { get; private set; } = string.Empty;
        public EmailAddress From { get; private set; } = null!;
        public List<EmailAddress> To { get; private set; } = new();
        public List<EmailAddress> Cc { get; private set; } = new();
        public List<EmailAddress> Bcc { get; private set; } = new();
        public List<EmailAddress> ReplyTo { get; private set; } = new(); // CRITICAL for reply handling
        public string TextBody { get; private set; } = string.Empty;
        public string HtmlBody { get; private set; } = string.Empty;
        public DateTime Date { get; private set; }
        public bool IsRead { get; private set; }
        public bool IsFlagged { get; private set; }
        public EmailPriority Priority { get; private set; } = EmailPriority.Normal;
        public string FolderName { get; private set; } = string.Empty;
        public string ThreadId { get; private set; } = string.Empty;
        public string MessageId { get; private set; } = string.Empty;
        public string InReplyTo { get; private set; } = string.Empty;
        public string References { get; private set; } = string.Empty;
        
        // Partitioning key for horizontal scaling
        public int PartitionKey => Math.Abs(UserId.GetHashCode() % 100);
        
        // Navigation properties
        public virtual User User { get; private set; } = null!;
        public virtual EmailAccount Account { get; private set; } = null!;
        public virtual ICollection<EmailAttachment> Attachments { get; private set; } = new List<EmailAttachment>();
        
        private EmailMessage() { } // EF Core constructor
        
        public EmailMessage(
            Guid tenantId,
            Guid userId, 
            Guid accountId, 
            string serverMessageId,
            string subject,
            EmailAddress from,
            List<EmailAddress> to,
            string textBody,
            string htmlBody,
            DateTime date,
            string folderName)
        {
            TenantId = tenantId;
            UserId = userId;
            AccountId = accountId;
            ServerMessageId = serverMessageId ?? throw new ArgumentNullException(nameof(serverMessageId));
            Subject = subject ?? string.Empty;
            From = from ?? throw new ArgumentNullException(nameof(from));
            To = to ?? throw new ArgumentNullException(nameof(to));
            TextBody = textBody ?? string.Empty;
            HtmlBody = htmlBody ?? string.Empty;
            Date = date;
            FolderName = folderName ?? throw new ArgumentNullException(nameof(folderName));
            IsRead = false;
            IsFlagged = false;
            Priority = EmailPriority.Normal;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        
        // CRITICAL: Reply creation method (lesson learned)
        public EmailMessage CreateReply(EmailAddress currentUserAddress, bool replyAll = false)
        {
            var replyTo = ReplyTo.Any() ? ReplyTo : new List<EmailAddress> { From };
            var replyCc = new List<EmailAddress>();
            
            if (replyAll)
            {
                var allRecipients = To.Concat(Cc).ToList();
                replyCc = allRecipients
                    .Where(addr => !addr.Address.Equals(currentUserAddress.Address, StringComparison.OrdinalIgnoreCase))
                    .Where(addr => !replyTo.Any(r => r.Address.Equals(addr.Address, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }
            
            return new EmailMessage(
                TenantId,
                UserId,
                AccountId,
                string.Empty, // Will be set when sent
                Subject.StartsWith("Re:", StringComparison.OrdinalIgnoreCase) ? Subject : $"Re: {Subject}",
                currentUserAddress,
                replyTo,
                BuildReplyTextBody(),
                BuildReplyHtmlBody(),
                DateTime.UtcNow,
                "Drafts"
            )
            {
                Cc = replyCc,
                ThreadId = ThreadId ?? Id.ToString(),
                InReplyTo = MessageId,
                References = BuildReferencesHeader()
            };
        }
        
        private string BuildReplyHtmlBody()
        {
            var replyHeader = $"<br><br>On {Date:F}, {From.DisplayName} wrote:<br>";
            var quotedBody = $"<blockquote style='border-left: 2px solid #ccc; padding-left: 10px; margin-left: 0;'>{HtmlBody}</blockquote>";
            return replyHeader + quotedBody;
        }
        
        private string BuildReplyTextBody()
        {
            var replyHeader = $"\n\nOn {Date:F}, {From.DisplayName} wrote:\n";
            var quotedLines = TextBody.Split('\n').Select(line => $"> {line}");
            return replyHeader + string.Join("\n", quotedLines);
        }
        
        private string BuildReferencesHeader()
        {
            var references = new List<string>();
            
            if (!string.IsNullOrEmpty(References))
                references.AddRange(References.Split(' ', StringSplitOptions.RemoveEmptyEntries));
                
            if (!string.IsNullOrEmpty(MessageId) && !references.Contains(MessageId))
                references.Add(MessageId);
                
            return string.Join(" ", references);
        }
        
        public void MarkAsRead() => IsRead = true;
        public void MarkAsUnread() => IsRead = false;
        public void ToggleFlag() => IsFlagged = !IsFlagged;
        public void SetPriority(EmailPriority priority) => Priority = priority;
    }
}
```

### 2. Email Service Implementation (Concurrency & Retry - Lessons Learned)
```csharp
// backend/src/POSTA.Infrastructure/Email/EmailSyncService.cs
using System.Collections.Concurrent;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace POSTA.Infrastructure.Email
{
    public class EmailSyncService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmailSyncService> _logger;
        private readonly SemaphoreSlim _globalSyncSemaphore;
        private readonly ConcurrentDictionary<Guid, SemaphoreSlim> _userSyncSemaphores;
        private readonly ConcurrentDictionary<Guid, DateTime> _lastSyncTimes;
        
        public EmailSyncService(IServiceProvider serviceProvider, ILogger<EmailSyncService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _globalSyncSemaphore = new SemaphoreSlim(Environment.ProcessorCount * 2, Environment.ProcessorCount * 2);
            _userSyncSemaphores = new ConcurrentDictionary<Guid, SemaphoreSlim>();
            _lastSyncTimes = new ConcurrentDictionary<Guid, DateTime>();
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email sync service started");
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SyncAllActiveAccountsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during background email sync");
                }
                
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
        
        private async Task SyncAllActiveAccountsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var accountRepository = scope.ServiceProvider.GetRequiredService<IEmailAccountRepository>();
            
            var activeAccounts = await accountRepository.GetActiveAccountsAsync();
            
            var syncTasks = activeAccounts.Select(async account =>
            {
                try
                {
                    await SyncUserEmailsAsync(account.UserId, account.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to sync emails for user {UserId}, account {AccountId}", 
                        account.UserId, account.Id);
                }
            });
            
            await Task.WhenAll(syncTasks);
        }
        
        public async Task SyncUserEmailsAsync(Guid userId, Guid accountId)
        {
            var userSemaphore = _userSyncSemaphores.GetOrAdd(userId, _ => new SemaphoreSlim(1, 1));
            
            await _globalSyncSemaphore.WaitAsync();
            await userSemaphore.WaitAsync();
            
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var emailServiceFactory = scope.ServiceProvider.GetRequiredService<IEmailServiceFactory>();
                var emailRepository = scope.ServiceProvider.GetRequiredService<IEmailRepository>();
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<EmailNotificationHub>>();
                
                var emailService = await emailServiceFactory.CreateAsync(accountId);
                await PerformEmailSyncWithRetry(userId, accountId, emailService, emailRepository, hubContext);
            }
            finally
            {
                userSemaphore.Release();
                _globalSyncSemaphore.Release();
            }
        }
        
        private async Task PerformEmailSyncWithRetry(
            Guid userId, 
            Guid accountId, 
            IEmailProtocolService emailService, 
            IEmailRepository emailRepository,
            IHubContext<EmailNotificationHub> hubContext)
        {
            const int maxRetries = 3;
            var retryDelay = TimeSpan.FromSeconds(1);
            
            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                try
                {
                    await PerformEmailSync(userId, accountId, emailService, emailRepository, hubContext);
                    _lastSyncTimes[accountId] = DateTime.UtcNow;
                    return;
                }
                catch (Exception ex) when (IsRetriableException(ex) && attempt < maxRetries - 1)
                {
                    _logger.LogWarning(ex, "Email sync attempt {Attempt} failed for user {UserId}, account {AccountId}. Retrying in {Delay}ms",
                        attempt + 1, userId, accountId, retryDelay.TotalMilliseconds);
                        
                    await Task.Delay(retryDelay);
                    retryDelay = TimeSpan.FromMilliseconds(retryDelay.TotalMilliseconds * 2);
                }
            }
        }
        
        private async Task PerformEmailSync(
            Guid userId, 
            Guid accountId, 
            IEmailProtocolService emailService, 
            IEmailRepository emailRepository,
            IHubContext<EmailNotificationHub> hubContext)
        {
            var lastSyncTime = await emailRepository.GetLastSyncTimeAsync(userId, accountId);
            var newMessages = await emailService.GetMessagesSinceAsync(accountId, lastSyncTime);
            
            if (!newMessages.Any()) return;
            
            _logger.LogInformation("Syncing {Count} new messages for user {UserId}, account {AccountId}",
                newMessages.Count, userId, accountId);
            
            const int batchSize = 100;
            for (int i = 0; i < newMessages.Count; i += batchSize)
            {
                var batch = newMessages.Skip(i).Take(batchSize).ToList();
                await ProcessEmailBatch(userId, accountId, batch, emailRepository, hubContext);
            }
            
            await emailRepository.UpdateLastSyncTimeAsync(userId, accountId, DateTime.UtcNow);
        }
        
        private async Task ProcessEmailBatch(
            Guid userId,
            Guid accountId,
            List<EmailMessage> emails,
            IEmailRepository emailRepository,
            IHubContext<EmailNotificationHub> hubContext)
        {
            await emailRepository.AddBulkAsync(emails);
            
            // Notify clients of new emails
            var groupName = $"user_{userId}";
            var notifications = emails.Select(email => new EmailNotificationDto
            {
                Id = email.Id.ToString(),
                From = email.From,
                Subject = email.Subject,
                Date = email.Date,
                FolderName = email.FolderName,
                Priority = email.Priority
            });
            
            await hubContext.Clients.Group(groupName)
                .SendAsync("NewEmailsReceived", notifications);
        }
        
        private static bool IsRetriableException(Exception ex)
        {
            return ex is SocketException ||
                   ex is TimeoutException ||
                   ex is HttpRequestException ||
                   (ex is InvalidOperationException && ex.Message.Contains("connection"));
        }
    }
}

// backend/src/POSTA.Infrastructure/Email/ImapEmailService.cs
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;

namespace POSTA.Infrastructure.Email
{
    public class ImapEmailService : IEmailProtocolService
    {
        private readonly ILogger<ImapEmailService> _logger;
        private readonly EmailProtocolSettings _settings;
        
        public ImapEmailService(ILogger<ImapEmailService> logger, EmailProtocolSettings settings)
        {
            _logger = logger;
            _settings = settings;
        }
        
        public async Task<List<EmailMessage>> GetMessagesSinceAsync(Guid accountId, DateTime since)
        {
            using var client = new ImapClient();
            
            try
            {
                await ConnectWithRetryAsync(client, accountId);
                
                var inbox = client.Inbox;
                await inbox.OpenAsync(FolderAccess.ReadOnly);
                
                // Search for messages since last sync
                var searchQuery = SearchQuery.DeliveredAfter(since);
                var uids = await inbox.SearchAsync(searchQuery);
                
                var messages = new List<EmailMessage>();
                const int batchSize = 50;
                
                for (int i = 0; i < uids.Count; i += batchSize)
                {
                    var batch = uids.Skip(i).Take(batchSize);
                    var mimeMessages = await inbox.GetMessagesAsync(batch);
                    
                    foreach (var mimeMessage in mimeMessages)
                    {
                        var emailMessage = ConvertMimeMessageToEmailMessage(mimeMessage, accountId);
                        messages.Add(emailMessage);
                    }
                }
                
                return messages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get messages for account {AccountId}", accountId);
                throw;
            }
            finally
            {
                if (client.IsConnected)
                    await client.DisconnectAsync(true);
            }
        }
        
        private async Task ConnectWithRetryAsync(ImapClient client, Guid accountId)
        {
            const int maxRetries = 3;
            var retryDelay = TimeSpan.FromSeconds(1);
            
            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                try
                {
                    var account = await GetEmailAccountAsync(accountId);
                    
                    await client.ConnectAsync(account.ImapServer, account.ImapPort, account.UseSSL);
                    await client.AuthenticateAsync(account.Username, account.Password);
                    
                    _logger.LogDebug("Successfully connected to IMAP server for account {AccountId}", accountId);
                    return;
                }
                catch (Exception ex) when (attempt < maxRetries - 1)
                {
                    _logger.LogWarning(ex, "IMAP connection attempt {Attempt} failed for account {AccountId}. Retrying in {Delay}ms",
                        attempt + 1, accountId, retryDelay.TotalMilliseconds);
                        
                    await Task.Delay(retryDelay);
                    retryDelay = TimeSpan.FromMilliseconds(retryDelay.TotalMilliseconds * 2);
                }
            }
        }
        
        private EmailMessage ConvertMimeMessageToEmailMessage(MimeMessage mimeMessage, Guid accountId)
        {
            // CRITICAL: Proper email address parsing (lesson learned)
            var from = ParseEmailAddress(mimeMessage.From.FirstOrDefault());
            var to = ParseEmailAddresses(mimeMessage.To);
            var cc = ParseEmailAddresses(mimeMessage.Cc);
            var bcc = ParseEmailAddresses(mimeMessage.Bcc);
            var replyTo = ParseEmailAddresses(mimeMessage.ReplyTo); // IMPORTANT: Store reply-to
            
            var textBody = mimeMessage.TextBody ?? string.Empty;
            var htmlBody = mimeMessage.HtmlBody ?? string.Empty;
            
            // CRITICAL: Sanitize HTML content (lesson learned)
            if (!string.IsNullOrEmpty(htmlBody))
            {
                htmlBody = HtmlEmailProcessor.SanitizeEmailHtml(htmlBody);
            }
            
            var emailMessage = new EmailMessage(
                GetTenantIdForAccount(accountId),
                GetUserIdForAccount(accountId),
                accountId,
                mimeMessage.MessageId ?? Guid.NewGuid().ToString(),
                mimeMessage.Subject ?? string.Empty,
                from,
                to,
                textBody,
                htmlBody,
                mimeMessage.Date.DateTime,
                "INBOX"
            );
            
            emailMessage.SetCc(cc);
            emailMessage.SetBcc(bcc);
            emailMessage.SetReplyTo(replyTo); // CRITICAL for proper reply handling
            emailMessage.SetMessageId(mimeMessage.MessageId ?? string.Empty);
            emailMessage.SetInReplyTo(mimeMessage.InReplyTo ?? string.Empty);
            emailMessage.SetReferences(string.Join(" ", mimeMessage.References));
            
            // Process attachments
            foreach (var attachment in mimeMessage.Attachments.OfType<MimePart>())
            {
                var emailAttachment = new EmailAttachment
                {
                    FileName = attachment.FileName ?? "attachment",
                    ContentType = attachment.ContentType.MimeType,
                    Size = attachment.Content?.Stream?.Length ?? 0
                };
                
                emailMessage.AddAttachment(emailAttachment);
            }
            
            return emailMessage;
        }
        
        private EmailAddress ParseEmailAddress(InternetAddress? internetAddress)
        {
            if (internetAddress is MailboxAddress mailbox)
            {
                return new EmailAddress(mailbox.Address, mailbox.Name);
            }
            
            return new EmailAddress("unknown@unknown.com");
        }
        
        private List<EmailAddress> ParseEmailAddresses(InternetAddressList addresses)
        {
            return addresses.OfType<MailboxAddress>()
                .Select(addr => new EmailAddress(addr.Address, addr.Name))
                .ToList();
        }
    }
}
```

### 3. Progressive Web App Configuration (Mobile Optimization)
```json
// frontend/src/manifest.json
{
  "name": "POSTA - Email Application",
  "short_name": "POSTA",
  "description": "Professional email application with real-time synchronization",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "orientation": "portrait",
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

```json
// frontend/src/ngsw-config.json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.json",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-emails",
      "urls": [
        "/api/emails/**"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s"
      }
    },
    {
      "name": "api-attachments",
      "urls": [
        "/api/attachments/**"
      ],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 50,
        "maxAge": "1d"
      }
    }
  ],
  "navigationUrls": [
    "/**",
    "!/**/*.*",
    "!/**/*__*",
    "!/**/*__*/**"
  ]
}
```

### 4. Docker and Kubernetes Configuration (Production Deployment)
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build for production
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist/posta /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# infrastructure/kubernetes/posta-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: posta-frontend
  labels:
    app: posta-frontend
    tier: frontend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: posta-frontend
  template:
    metadata:
      labels:
        app: posta-frontend
    spec:
      containers:
      - name: posta-frontend
        image: posta/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: posta-frontend-service
spec:
  selector:
    app: posta-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: posta-api-service
spec:
  selector:
    app: posta-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: posta-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "1000"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://app.posta.com"
spec:
  tls:
  - hosts:
    - app.posta.com
    - api.posta.com
    secretName: posta-tls
  rules:
  - host: app.posta.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: posta-frontend-service
            port:
              number: 80
  - host: api.posta.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: posta-api-service
            port:
              number: 80
```

## Performance Monitoring & Analytics (Enterprise Level)

### 1. Application Performance Monitoring (Angular)
```typescript
// frontend/src/app/core/services/performance.service.ts
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private performanceObserver: PerformanceObserver | null = null;
  
  constructor(private router: Router) {
    this.initializePerformanceMonitoring();
    this.trackRouteChanges();
  }
  
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackMetric('LCP', entry.startTime);
          } else if (entry.entryType === 'first-input') {
            this.trackMetric('FID', entry.processingStart - entry.startTime);
          } else if (entry.entryType === 'layout-shift') {
            if (!entry.hadRecentInput) {
              this.trackMetric('CLS', entry.value);
            }
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
    
    // Track Time to First Byte (TTFB)
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.requestStart;
      this.trackMetric('TTFB', ttfb);
    }
  }
  
  private trackRouteChanges(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
          this.trackMetric('PageLoadTime', pageLoadTime, { route: event.url });
        }
      });
  }
  
  trackEmailListPerformance(emailCount: number, loadTime: number): void {
    this.trackMetric('EmailListLoad', loadTime, { 
      emailCount,
      performanceGrade: this.getPerformanceGrade(loadTime)
    });
  }
  
  trackEmailComposePerformance(action: string, duration: number): void {
    this.trackMetric('EmailCompose', duration, { action });
  }
  
  trackSearchPerformance(query: string, resultCount: number, duration: number): void {
    this.trackMetric('EmailSearch', duration, { 
      queryLength: query.length,
      resultCount,
      performanceGrade: this.getPerformanceGrade(duration)
    });
  }
  
  private trackMetric(name: string, value: number, attributes?: any): void {
    // Send to Application Insights or other monitoring service
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        custom_parameter_value: value,
        ...attributes
      });
    }
    
    // Also send to custom analytics endpoint
    this.sendToAnalytics({
      metric: name,
      value,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...attributes
    });
  }
  
  private sendToAnalytics(data: any): void {
    // Send performance data to backend analytics service
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.warn('Failed to send performance data:', error);
    });
  }
  
  private getPerformanceGrade(duration: number): string {
    if (duration < 100) return 'A';
    if (duration < 300) return 'B';
    if (duration < 1000) return 'C';
    if (duration < 3000) return 'D';
    return 'F';
  }
}
```

### 2. Error Handling and Logging (Production Ready)
```typescript
// frontend/src/app/core/services/error-handler.service.ts
import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  
  constructor(private snackBar: MatSnackBar) {}
  
  handleError(error: any): void {
    console.error('Global error caught:', error);
    
    // Send error to monitoring service
    this.logErrorToService(error);
    
    // Show user-friendly message
    let message = 'An unexpected error occurred';
    
    if (error instanceof HttpErrorResponse) {
      message = this.getHttpErrorMessage(error);
    } else if (error?.message) {
      message = error.message;
    }
    
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
  
  private getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check your internet connection.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Our team has been notified.';
      default:
        return error.error?.message || `Server returned error ${error.status}`;
    }
  }
  
  private logErrorToService(error: any): void {
    const errorLog = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      tenantId: this.getCurrentTenantId()
    };
    
    // Send to backend logging service
    fetch('/api/logs/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog)
    }).catch(logError => {
      console.error('Failed to log error to service:', logError);
    });
  }
  
  private getCurrentUserId(): string | null {
    // Get from auth service or local storage
    return localStorage.getItem('userId');
  }
  
  private getCurrentTenantId(): string | null {
    // Get from auth service or local storage
    return localStorage.getItem('tenantId');
  }
}
```

### 3. Real-time Communication (SignalR Integration)
```typescript
// frontend/src/app/core/services/signalr.service.ts
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { EmailMessage } from '../../features/email-management/models/email-message.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionState$ = new BehaviorSubject<'Connected' | 'Connecting' | 'Disconnected'>('Disconnected');
  private newEmailSubject$ = new Subject<EmailMessage>();
  private emailReadStatusSubject$ = new Subject<{ emailId: string; isRead: boolean }>();
  private emailDeletedSubject$ = new Subject<string>();
  
  constructor(private authService: AuthService) {
    this.initializeConnection();
  }
  
  private initializeConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/api/hubs/email', {
        accessTokenFactory: () => this.authService.getAccessToken() || ''
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();
    
    this.setupEventHandlers();
    this.setupConnectionHandlers();
  }
  
  private setupEventHandlers(): void {
    if (!this.hubConnection) return;
    
    this.hubConnection.on('NewEmailReceived', (email: EmailMessage) => {
      this.newEmailSubject$.next(email);
    });
    
    this.hubConnection.on('EmailReadStatusChanged', (data: { emailId: string; isRead: boolean }) => {
      this.emailReadStatusSubject$.next(data);
    });
    
    this.hubConnection.on('EmailDeleted', (emailId: string) => {
      this.emailDeletedSubject$.next(emailId);
    });
    
    this.hubConnection.on('SyncCompleted', (data: { accountId: string; newEmailCount: number }) => {
      console.log(`Sync completed for account ${data.accountId}: ${data.newEmailCount} new emails`);
    });
  }
  
  private setupConnectionHandlers(): void {
    if (!this.hubConnection) return;
    
    this.hubConnection.onconnecting(() => {
      this.connectionState$.next('Connecting');
    });
    
    this.hubConnection.onconnected(() => {
      this.connectionState$.next('Connected');
      console.log('SignalR connected');
      
      // Join user group for targeted notifications
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.hubConnection?.invoke('JoinUserGroup', userId);
      }
    });
    
    this.hubConnection.onclose(() => {
      this.connectionState$.next('Disconnected');
      console.log('SignalR disconnected');
    });
    
    this.hubConnection.onreconnecting(() => {
      this.connectionState$.next('Connecting');
      console.log('SignalR reconnecting...');
    });
    
    this.hubConnection.onreconnected(() => {
      this.connectionState$.next('Connected');
      console.log('SignalR reconnected');
      
      // Rejoin user group after reconnection
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.hubConnection?.invoke('JoinUserGroup', userId);
      }
    });
  }
  
  async start(): Promise<void> {
    if (!this.hubConnection) return;
    
    try {
      await this.hubConnection.start();
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      
      // Retry connection after delay
      setTimeout(() => this.start(), 5000);
    }
  }
  
  async stop(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }
  }
  
  // Observable streams for components to subscribe to
  onNewEmailReceived(): Observable<EmailMessage> {
    return this.newEmailSubject$.asObservable();
  }
  
  onEmailReadStatusChanged(): Observable<{ emailId: string; isRead: boolean }> {
    return this.emailReadStatusSubject$.asObservable();
  }
  
  onEmailDeleted(): Observable<string> {
    return this.emailDeletedSubject$.asObservable();
  }
  
  getConnectionState(): Observable<'Connected' | 'Connecting' | 'Disconnected'> {
    return this.connectionState$.asObservable();
  }
  
  // Methods to send messages to server
  async requestEmailSync(accountId: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      await this.hubConnection.invoke('RequestEmailSync', accountId);
    }
  }
  
  async markEmailAsRead(emailId: string, isRead: boolean): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      await this.hubConnection.invoke('MarkEmailAsRead', emailId, isRead);
    }
  }
}
```

## Load Testing Configuration (Artillery.js)

### Load Test Scenarios
```yaml
# tests/load/email-load-test.yml
config:
  target: 'https://api.posta.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up phase"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up phase"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load phase"
    - duration: 120
      arrivalRate: 200
      name: "Peak load phase"
    - duration: 60
      arrivalRate: 50
      name: "Cool down phase"
  defaults:
    headers:
      Content-Type: 'application/json'
  processor: './load-test-functions.js'
  
scenarios:
  - name: "Email List Operations"
    weight: 40
    flow:
      - function: "setAuthToken"
      - get:
          url: "/api/emails"
          qs:
            folder: "INBOX"
            skip: 0
            take: 50
          capture:
            - json: "$.totalCount"
              as: "totalEmails"
      - think: 2
      - get:
          url: "/api/emails/{{ $randomString() }}"
      - think: 3
      - post:
          url: "/api/emails/{{ $randomString() }}/read"
          json:
            isRead: true

  - name: "Email Search Operations"
    weight: 25
    flow:
      - function: "setAuthToken"
      - post:
          url: "/api/emails/search"
          json:
            query: "{{ $randomString() }}"
            folder: "INBOX"
            skip: 0
            take: 25
      - think: 5
      - post:
          url: "/api/emails/search"
          json:
            from: "test@example.com"
            dateFrom: "2024-01-01"
            skip: 0
            take: 25

  - name: "Email Compose and Send"
    weight: 20
    flow:
      - function: "setAuthToken"
      - post:
          url: "/api/emails/send"
          json:
            to: "recipient@example.com"
            subject: "Load Test Email {{ $randomString() }}"
            htmlBody: "<p>This is a load test email sent at {{ $timestamp }}</p>"
            textBody: "This is a load test email sent at {{ $timestamp }}"
            priority: "Normal"
      - think: 10

  - name: "Real-time Operations"
    weight: 15
    flow:
      - function: "setAuthToken"
      - get:
          url: "/api/emails/sync/{{ $randomUUID() }}"
      - think: 30
      - ws:
          url: "wss://api.posta.com/hubs/email"
          subprotocols:
            - "signalr"
```

```javascript
// tests/load/load-test-functions.js
module.exports = {
  setAuthToken: function(requestParams, context, ee, next) {
    // Generate JWT token for load testing
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        sub: `load-test-user-${Math.floor(Math.random() * 1000)}`,
        tenant_id: 'load-test-tenant',
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      'load-test-secret'
    );
    
    requestParams.headers = requestParams.headers || {};
    requestParams.headers['Authorization'] = `Bearer ${token}`;
    
    return next();
  },

  logResponse: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400) {
      console.log(`Error response: ${response.statusCode} - ${response.body}`);
    }
    return next();
  }
};
```

## Implementation Timeline & Phases

### Phase 1: Foundation (Weeks 1-3)
```typescript
// Week 1: Project Setup & Authentication
✅ Angular project setup with Angular Material
✅ .NET Core API with JWT authentication
✅ PostgreSQL database with multi-tenant setup
✅ Basic routing and navigation
✅ Docker containers for development

// Week 2: Core Email Models & Services
✅ EmailAddress value object implementation
✅ EmailMessage entity with proper typing
✅ Basic CRUD operations for emails
✅ Email API service in Angular
✅ NgRx store setup for email state

// Week 3: Email List & Basic UI
✅ Virtual scrolling email list component
✅ Email search functionality
✅ Basic email viewer component
✅ Loading states and error handling
✅ Responsive design with Angular Material
```

### Phase 2: Core Email Features (Weeks 4-6)
```typescript
// Week 4: Email Protocols & Sync
✅ IMAP service implementation with retry logic
✅ EWS service implementation
✅ Background email sync service
✅ Concurrency control for sync operations
✅ Database partitioning strategy

// Week 5: Compose & Reply Features
✅ Rich text editor integration (Quill.js)
✅ Reply/Reply All functionality with proper addressing
✅ HTML email sanitization
✅ Draft saving and auto-save
✅ Email validation and error handling

// Week 6: Attachments & File Handling
✅ File upload component with progress
✅ Azure Blob Storage integration
✅ Attachment preview functionality
✅ Drag-and-drop file handling
✅ File size and type validation
```

### Phase 3: Advanced Features (Weeks 7-9)
```typescript
// Week 7: Search & Filtering
✅ Elasticsearch integration
✅ Advanced search component
✅ Saved searches functionality
✅ Real-time search suggestions
✅ Performance optimization for large result sets

// Week 8: Real-time & Notifications
✅ SignalR hub implementation
✅ Real-time email notifications
✅ Toast notifications for new emails
✅ Connection state management
✅ Automatic reconnection logic

// Week 9: PWA & Mobile Optimization
✅ Service worker configuration
✅ Offline capability for cached emails
✅ Push notifications setup
✅ Mobile-responsive design
✅ Touch gesture support
```

### Phase 4: Production Readiness (Weeks 10-12)
```typescript
// Week 10: Performance & Monitoring
✅ Application Insights integration
✅ Performance metrics tracking
✅ Error logging and monitoring
✅ Load testing with Artillery.js
✅ Memory leak detection and optimization

// Week 11: Security & Compliance
✅ Security headers implementation
✅ CSRF protection
✅ Rate limiting per tenant
✅ Data encryption at rest
✅ Audit logging for compliance

// Week 12: Deployment & Scaling
✅ Kubernetes deployment configuration
✅ Blue-green deployment strategy
✅ Database migration strategy
✅ CDN setup for static assets
✅ Health checks and monitoring alerts
```

## Final Production Checklist ✅

### Security
- [ ] JWT tokens with refresh mechanism
- [ ] HTTPS enforcement
- [ ] CORS properly configured  
- [ ] SQL injection protection
- [ ] XSS prevention in email content
- [ ] Rate limiting per tenant
- [ ] Security headers (HSTS, CSP, etc.)

### Performance
- [ ] Virtual scrolling for large email lists
- [ ] Database query optimization with indexes
- [ ] Redis caching strategy
- [ ] CDN for static assets
- [ ] Image optimization and lazy loading
- [ ] Bundle size optimization (tree shaking)
- [ ] Service worker for offline capability

### Scalability
- [ ] Database partitioning by tenant/user
- [ ] Horizontal scaling with load balancer
- [ ] Background services for email sync
- [ ] Circuit breaker pattern for external APIs
- [ ] Message queue for async processing
- [ ] Auto-scaling based on metrics

### Monitoring & Reliability
- [ ] Health checks for all services
- [ ] Application performance monitoring
- [ ] Error tracking and alerting
- [ ] Performance metrics dashboard
- [ ] Log aggregation and analysis
- [ ] Backup and disaster recovery plan

### User Experience
- [ ] Progressive Web App (PWA) setup
- [ ] Offline functionality for cached emails
- [ ] Push notifications for new emails
- [ ] Responsive design for all screen sizes
- [ ] Keyboard shortcuts for power users
- [ ] Accessibility compliance (WCAG 2.1)

This comprehensive POSTA implementation with Angular provides:

🚀 **Superior Performance** - Virtual scrolling, PWA, service workers
📱 **Mobile-First Design** - Responsive, touch-friendly, offline capability  
🔒 **Enterprise Security** - Multi-tenant, encrypted, compliant
📊 **Production Monitoring** - Metrics, logging, health checks
⚡ **Horizontal Scaling** - Kubernetes ready, database partitioned
🛠️ **Team-Friendly Development** - Feature-based, NgRx state management

**All critical lessons learned from the JavaScript version are properly implemented with strong typing, proper email address handling, HTML sanitization, and robust error handling.**
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: posta-api
  labels:
    app: posta-api
    tier: backend
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  selector:
    matchLabels:
      app: posta-api
  template:
    metadata:
      labels:
        app: posta-api
    spec:
      containers:
      - name: posta-api
        image: posta/api:latest
        ports:
        - containerPort: 80
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: posta-secrets
              key: database-connection
        - name: ConnectionStrings__Redis
          valueFrom:
            secretKeyRef:
              name: posta-secrets
              key: redis-connection
        - name: JWT__Secret
          valueFrom:
            secretKeyRef:
              name: posta-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        liveness