import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { EmailMessage, EmailListParams, EmailListResponse, EmailAccount, EmailDraft } from '../../core/models/email.model';

export const EmailActions = createActionGroup({
  source: 'Email',
  events: {
    // Email List
    'Load Emails': props<{ accountId: string; params?: EmailListParams }>(),
    'Load Emails Success': props<{ response: EmailListResponse }>(),
    'Load Emails Failure': props<{ error: string }>(),
    
    // Single Email
    'Load Email': props<{ id: string }>(),
    'Load Email Success': props<{ email: EmailMessage }>(),
    'Load Email Failure': props<{ error: string }>(),
    
    // Email Actions
    'Mark As Read': props<{ id: string; isRead: boolean }>(),
    'Mark As Read Success': props<{ id: string; isRead: boolean }>(),
    'Mark As Read Failure': props<{ error: string }>(),
    
    'Toggle Flag': props<{ id: string; isFlagged: boolean }>(),
    'Toggle Flag Success': props<{ id: string; isFlagged: boolean }>(),
    'Toggle Flag Failure': props<{ error: string }>(),
    
    'Delete Email': props<{ id: string }>(),
    'Delete Email Success': props<{ id: string }>(),
    'Delete Email Failure': props<{ error: string }>(),

    'Move To Folder': props<{ id: string; folder: string }>(),
    'Move To Folder Success': props<{ id: string; folder: string }>(),
    'Move To Folder Failure': props<{ error: string }>(),
    
    // Email Accounts
    'Load Accounts': emptyProps(),
    'Load Accounts Success': props<{ accounts: EmailAccount[] }>(),
    'Load Accounts Failure': props<{ error: string }>(),
    
    // UI State
    'Set Selected Email': props<{ email: EmailMessage | null }>(),
    'Set Selected Account': props<{ accountId: string }>(),
    'Set Current Folder': props<{ folder: string }>(),
    'Clear Selected Email': emptyProps(),
    
    // Search
    'Set Search Query': props<{ query: string }>(),
    'Clear Search': emptyProps(),
    
    // Email Composition
    'Send Email': props<{ emailData: any }>(),
    'Send Email Success': props<{ email: EmailMessage }>(),
    'Send Email Failure': props<{ error: string }>(),
    
    'Save Draft': props<{ draftData: any }>(),
    'Save Draft Success': props<{ draft: EmailDraft }>(),
    'Save Draft Failure': props<{ error: string }>(),
    
    'Load Drafts': emptyProps(),
    'Load Drafts Success': props<{ drafts: EmailDraft[] }>(),
    'Load Drafts Failure': props<{ error: string }>(),
    
    'Delete Draft': props<{ draftId: string }>(),
    'Delete Draft Success': props<{ draftId: string }>(),
    'Delete Draft Failure': props<{ error: string }>(),
    
    // Real-time updates
    'Email Received': props<{ email: EmailMessage }>(),
    'Email Updated': props<{ email: EmailMessage }>(),
    'Email Deleted': props<{ emailId: string }>()
  }
});