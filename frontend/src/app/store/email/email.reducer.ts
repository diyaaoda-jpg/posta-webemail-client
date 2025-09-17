import { createReducer, on } from '@ngrx/store';
import { EmailMessage, EmailAccount } from '../../core/models/email.model';
import { EmailActions } from './email.actions';

export interface EmailState {
  emails: EmailMessage[];
  selectedEmail: EmailMessage | null;
  accounts: EmailAccount[];
  selectedAccountId: string | null;
  currentFolder: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: EmailState = {
  emails: [],
  selectedEmail: null,
  accounts: [],
  selectedAccountId: null,
  currentFolder: 'INBOX',
  searchQuery: '',
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0
  }
};

export const emailReducer = createReducer(
  initialState,
  
  // Load Emails
  on(EmailActions.loadEmails, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(EmailActions.loadEmailsSuccess, (state, { response }) => ({
    ...state,
    emails: response.emails,
    pagination: response.pagination,
    isLoading: false,
    error: null
  })),
  
  on(EmailActions.loadEmailsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Single Email
  on(EmailActions.loadEmail, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(EmailActions.loadEmailSuccess, (state, { email }) => ({
    ...state,
    selectedEmail: email,
    isLoading: false,
    // Update email in list if it exists
    emails: state.emails.map(e => e.id === email.id ? email : e)
  })),
  
  on(EmailActions.loadEmailFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Email Actions
  on(EmailActions.markAsReadSuccess, (state, { id, isRead }) => ({
    ...state,
    emails: state.emails.map(email => 
      email.id === id ? { ...email, isRead } : email
    ),
    selectedEmail: state.selectedEmail?.id === id 
      ? { ...state.selectedEmail, isRead } 
      : state.selectedEmail
  })),
  
  on(EmailActions.toggleFlagSuccess, (state, { id, isFlagged }) => ({
    ...state,
    emails: state.emails.map(email => 
      email.id === id ? { ...email, isFlagged } : email
    ),
    selectedEmail: state.selectedEmail?.id === id 
      ? { ...state.selectedEmail, isFlagged } 
      : state.selectedEmail
  })),
  
  on(EmailActions.deleteEmailSuccess, (state, { id }) => ({
    ...state,
    emails: state.emails.filter(email => email.id !== id),
    selectedEmail: state.selectedEmail?.id === id ? null : state.selectedEmail
  })),
  
  // Accounts
  on(EmailActions.loadAccountsSuccess, (state, { accounts }) => ({
    ...state,
    accounts,
    selectedAccountId: state.selectedAccountId || accounts[0]?.id || null
  })),
  
  // UI State
  on(EmailActions.setSelectedEmail, (state, { email }) => ({
    ...state,
    selectedEmail: email
  })),
  
  on(EmailActions.setSelectedAccount, (state, { accountId }) => ({
    ...state,
    selectedAccountId: accountId
  })),
  
  on(EmailActions.setCurrentFolder, (state, { folder }) => ({
    ...state,
    currentFolder: folder
  })),
  
  on(EmailActions.clearSelectedEmail, (state) => ({
    ...state,
    selectedEmail: null
  })),
  
  // Search
  on(EmailActions.setSearchQuery, (state, { query }) => ({
    ...state,
    searchQuery: query
  })),
  
  on(EmailActions.clearSearch, (state) => ({
    ...state,
    searchQuery: ''
  })),
  
  // Real-time updates
  on(EmailActions.emailReceived, (state, { email }) => ({
    ...state,
    emails: [email, ...state.emails]
  })),
  
  on(EmailActions.emailUpdated, (state, { email }) => ({
    ...state,
    emails: state.emails.map(e => e.id === email.id ? email : e),
    selectedEmail: state.selectedEmail?.id === email.id ? email : state.selectedEmail
  })),
  
  on(EmailActions.emailDeleted, (state, { emailId }) => ({
    ...state,
    emails: state.emails.filter(e => e.id !== emailId),
    selectedEmail: state.selectedEmail?.id === emailId ? null : state.selectedEmail
  }))
);