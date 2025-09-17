import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmailState } from './email.reducer';

export const selectEmailState = createFeatureSelector<EmailState>('email');

export const selectEmails = createSelector(
  selectEmailState,
  (state) => state.emails
);

export const selectSelectedEmail = createSelector(
  selectEmailState,
  (state) => state.selectedEmail
);

export const selectEmailAccounts = createSelector(
  selectEmailState,
  (state) => state.accounts
);

export const selectSelectedAccountId = createSelector(
  selectEmailState,
  (state) => state.selectedAccountId
);

export const selectCurrentFolder = createSelector(
  selectEmailState,
  (state) => state.currentFolder
);

export const selectSearchQuery = createSelector(
  selectEmailState,
  (state) => state.searchQuery
);

export const selectEmailLoading = createSelector(
  selectEmailState,
  (state) => state.isLoading
);

export const selectEmailError = createSelector(
  selectEmailState,
  (state) => state.error
);

export const selectEmailPagination = createSelector(
  selectEmailState,
  (state) => state.pagination
);

export const selectUnreadCount = createSelector(
  selectEmails,
  (emails) => emails.filter(email => !email.isRead).length
);

export const selectFlaggedEmails = createSelector(
  selectEmails,
  (emails) => emails.filter(email => email.isFlagged)
);

export const selectEmailsByFolder = createSelector(
  selectEmails,
  selectCurrentFolder,
  (emails, folder) => emails.filter(email => email.folderName === folder)
);

export const selectFilteredEmails = createSelector(
  selectEmailsByFolder,
  selectSearchQuery,
  (emails, searchQuery) => {
    if (!searchQuery) return emails;
    
    const query = searchQuery.toLowerCase();
    return emails.filter(email => 
      email.subject?.toLowerCase().includes(query) ||
      email.fromAddress.toLowerCase().includes(query) ||
      email.textBody?.toLowerCase().includes(query)
    );
  }
);