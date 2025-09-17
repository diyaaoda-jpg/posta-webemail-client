import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountsState } from './accounts.reducer';

export const selectAccountsState = createFeatureSelector<AccountsState>('accounts');

// Setup selectors
export const selectAccountSetupState = createSelector(
  selectAccountsState,
  (state) => state.setup
);

export const selectCurrentStep = createSelector(
  selectAccountSetupState,
  (setup) => setup.currentStep
);

export const selectSetupEmailAddress = createSelector(
  selectAccountSetupState,
  (setup) => setup.emailAddress
);

export const selectSetupServerConfig = createSelector(
  selectAccountSetupState,
  (setup) => setup.serverConfig
);

export const selectSetupCredentials = createSelector(
  selectAccountSetupState,
  (setup) => setup.credentials
);

export const selectSetupAccountDetails = createSelector(
  selectAccountSetupState,
  (setup) => setup.accountDetails
);

export const selectDiscoveryResult = createSelector(
  selectAccountSetupState,
  (setup) => setup.discoveryResult
);

export const selectTestResult = createSelector(
  selectAccountSetupState,
  (setup) => setup.testResult
);

export const selectSetupLoading = createSelector(
  selectAccountSetupState,
  (setup) => setup.isLoading
);

export const selectSetupError = createSelector(
  selectAccountSetupState,
  (setup) => setup.error
);

// Account management selectors
export const selectAllAccounts = createSelector(
  selectAccountsState,
  (state) => state.accounts
);

export const selectAccountsCount = createSelector(
  selectAllAccounts,
  (accounts) => accounts.length
);

export const selectActiveAccounts = createSelector(
  selectAllAccounts,
  (accounts) => accounts.filter(acc => acc.isActive)
);

export const selectActiveAccountsCount = createSelector(
  selectActiveAccounts,
  (accounts) => accounts.length
);

export const selectCurrentAccount = createSelector(
  selectAccountsState,
  (state) => state.currentAccount
);

export const selectSelectedAccountId = createSelector(
  selectAccountsState,
  (state) => state.selectedAccountId
);

export const selectSelectedAccount = createSelector(
  selectAllAccounts,
  selectSelectedAccountId,
  (accounts, selectedId) => 
    selectedId ? accounts.find(acc => acc.id === selectedId) : null
);

export const selectAccountById = (accountId: string) => createSelector(
  selectAllAccounts,
  (accounts) => accounts.find(acc => acc.id === accountId)
);

// Loading state selectors
export const selectAccountsLoading = createSelector(
  selectAccountsState,
  (state) => state.loading
);

export const selectLoadingAccounts = createSelector(
  selectAccountsState,
  (state) => state.loadingAccounts
);

export const selectCreatingAccount = createSelector(
  selectAccountsState,
  (state) => state.creatingAccount
);

export const selectUpdatingAccount = createSelector(
  selectAccountsState,
  (state) => state.updatingAccount
);

export const selectDeletingAccount = createSelector(
  selectAccountsState,
  (state) => state.deletingAccount
);

export const selectAnyAccountOperation = createSelector(
  selectLoadingAccounts,
  selectCreatingAccount,
  selectUpdatingAccount,
  selectDeletingAccount,
  (loading, creating, updating, deleting) => loading || creating || updating || deleting
);

// Error selectors
export const selectAccountsError = createSelector(
  selectAccountsState,
  (state) => state.error
);

export const selectHasAccountsError = createSelector(
  selectAccountsError,
  (error) => !!error
);

// Composite selectors
export const selectAccountsSummary = createSelector(
  selectAllAccounts,
  selectActiveAccounts,
  selectLoadingAccounts,
  selectAccountsError,
  (allAccounts, activeAccounts, loading, error) => ({
    total: allAccounts.length,
    active: activeAccounts.length,
    inactive: allAccounts.length - activeAccounts.length,
    loading,
    error
  })
);

export const selectSetupProgress = createSelector(
  selectCurrentStep,
  selectSetupEmailAddress,
  selectDiscoveryResult,
  selectSetupServerConfig,
  selectSetupCredentials,
  selectTestResult,
  (step, email, discovery, config, credentials, test) => {
    const steps = ['email', 'discovery', 'manual', 'auth', 'testing', 'success'];
    const currentIndex = steps.indexOf(step);
    const completedSteps = [];
    
    if (email) completedSteps.push('email');
    if (discovery || config) completedSteps.push('discovery');
    if (config && !discovery?.success) completedSteps.push('manual');
    if (credentials) completedSteps.push('auth');
    if (test) completedSteps.push('testing');
    if (step === 'success') completedSteps.push('success');
    
    return {
      currentStep: step,
      currentIndex,
      completedSteps,
      progress: Math.round((completedSteps.length / steps.length) * 100)
    };
  }
);

// Setup completion checks
export const selectCanProceedFromEmail = createSelector(
  selectSetupEmailAddress,
  (email) => !!email && email.includes('@')
);

export const selectCanProceedFromDiscovery = createSelector(
  selectDiscoveryResult,
  selectSetupServerConfig,
  (discovery, config) => !!(discovery?.success || config)
);

export const selectCanProceedFromAuth = createSelector(
  selectSetupCredentials,
  selectSetupAccountDetails,
  (credentials, details) => !!(credentials?.username && credentials?.password && details?.accountName)
);

export const selectCanProceedFromTesting = createSelector(
  selectTestResult,
  (test) => !!test?.success
);

export const selectSetupReadyForCreation = createSelector(
  selectSetupEmailAddress,
  selectSetupServerConfig,
  selectSetupCredentials,
  selectSetupAccountDetails,
  selectTestResult,
  (email, config, credentials, details, test) => 
    !!(email && config && credentials && details && test?.success)
);