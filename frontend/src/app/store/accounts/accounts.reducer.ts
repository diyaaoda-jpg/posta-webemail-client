import { createReducer, on } from '@ngrx/store';
import { 
  EmailAccount, 
  AccountSetupState, 
  AccountSetupStep,
  AutodiscoverResponse,
  TestConnectionResponse,
  ExchangeServerConfig
} from '../../core/models/email.model';
import { AccountsActions } from './accounts.actions';

export interface AccountsState {
  // Account setup flow state
  setup: AccountSetupState;
  
  // Account management state
  accounts: EmailAccount[];
  selectedAccountId: string | null;
  currentAccount: EmailAccount | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Operation states
  loadingAccounts: boolean;
  creatingAccount: boolean;
  updatingAccount: boolean;
  deletingAccount: boolean;
}

const initialState: AccountsState = {
  setup: {
    currentStep: 'email',
    emailAddress: '',
    serverConfig: undefined,
    credentials: undefined,
    accountDetails: undefined,
    discoveryResult: undefined,
    testResult: undefined,
    isLoading: false,
    error: undefined
  },
  accounts: [],
  selectedAccountId: null,
  currentAccount: null,
  loading: false,
  error: null,
  loadingAccounts: false,
  creatingAccount: false,
  updatingAccount: false,
  deletingAccount: false
};

export const accountsReducer = createReducer(
  initialState,

  // Setup Flow
  on(AccountsActions.initializeAccountSetup, (state) => ({
    ...state,
    setup: {
      currentStep: 'email' as AccountSetupStep,
      emailAddress: '',
      serverConfig: undefined,
      credentials: undefined,
      accountDetails: undefined,
      discoveryResult: undefined,
      testResult: undefined,
      isLoading: false,
      error: undefined
    }
  })),

  on(AccountsActions.clearAccountSetup, (state) => ({
    ...state,
    setup: initialState.setup
  })),

  on(AccountsActions.setCurrentStep, (state, { step }) => ({
    ...state,
    setup: {
      ...state.setup,
      currentStep: step,
      error: undefined
    }
  })),

  // Email Discovery
  on(AccountsActions.submitEmailForDiscovery, (state, { emailAddress }) => ({
    ...state,
    setup: {
      ...state.setup,
      emailAddress,
      currentStep: 'discovery' as AccountSetupStep,
      isLoading: true,
      error: undefined,
      discoveryResult: undefined
    }
  })),

  on(AccountsActions.emailDiscoverySuccess, (state, { response }) => ({
    ...state,
    setup: {
      ...state.setup,
      isLoading: false,
      discoveryResult: response,
      serverConfig: response.config,
      currentStep: (response.success ? 'auth' : 'manual') as AccountSetupStep,
      error: undefined
    }
  })),

  on(AccountsActions.emailDiscoveryFailure, (state, { error }) => ({
    ...state,
    setup: {
      ...state.setup,
      isLoading: false,
      error,
      currentStep: 'manual' as AccountSetupStep
    }
  })),

  // Manual Discovery
  on(AccountsActions.submitManualDiscovery, (state, { emailAddress, serverInput }) => ({
    ...state,
    setup: {
      ...state.setup,
      emailAddress,
      currentStep: 'discovery' as AccountSetupStep,
      isLoading: true,
      error: undefined,
      discoveryResult: undefined
    }
  })),

  on(AccountsActions.manualDiscoverySuccess, (state, { response }) => ({
    ...state,
    setup: {
      ...state.setup,
      isLoading: false,
      discoveryResult: response,
      serverConfig: response.config,
      currentStep: (response.success ? 'auth' : 'manual') as AccountSetupStep,
      error: undefined
    }
  })),

  on(AccountsActions.manualDiscoveryFailure, (state, { error }) => ({
    ...state,
    setup: {
      ...state.setup,
      isLoading: false,
      error,
      currentStep: 'manual' as AccountSetupStep
    }
  })),

  // Credentials
  on(AccountsActions.submitCredentials, (state, { credentials }) => ({
    ...state,
    setup: {
      ...state.setup,
      credentials: {
        username: credentials.username,
        password: credentials.password
      },
      accountDetails: {
        accountName: credentials.accountName,
        displayName: credentials.displayName
      },
      currentStep: 'testing' as AccountSetupStep,
      error: undefined
    }
  })),

  on(AccountsActions.setServerConfig, (state, { config }) => ({
    ...state,
    setup: {
      ...state.setup,
      serverConfig: config
    }
  })),

  // Connection Testing
  on(AccountsActions.testConnection, (state) => ({
    ...state,
    setup: {
      ...state.setup,
      isLoading: true,
      error: undefined,
      testResult: undefined
    }
  })),

  on(AccountsActions.testConnectionSuccess, (state, { response }) => ({
    ...state,
    setup: {
      ...state.setup,
      isLoading: false,
      testResult: response,
      currentStep: (response.success ? 'success' : 'testing') as AccountSetupStep,
      error: undefined
    }
  })),

  on(AccountsActions.testConnectionFailure, (state, { error }) => ({
    ...state,
    setup: {
      ...state.setup,
      isLoading: false,
      error,
      currentStep: 'testing' as AccountSetupStep
    }
  })),

  // Account Creation
  on(AccountsActions.createAccount, (state) => ({
    ...state,
    creatingAccount: true,
    setup: {
      ...state.setup,
      isLoading: true,
      error: undefined
    }
  })),

  on(AccountsActions.createAccountSuccess, (state, { response }) => ({
    ...state,
    creatingAccount: false,
    accounts: [...state.accounts, response.account],
    setup: {
      ...state.setup,
      isLoading: false,
      currentStep: 'success' as AccountSetupStep,
      error: undefined
    }
  })),

  on(AccountsActions.createAccountFailure, (state, { error }) => ({
    ...state,
    creatingAccount: false,
    setup: {
      ...state.setup,
      isLoading: false,
      error
    }
  })),

  // Account Management
  on(AccountsActions.loadAccounts, (state) => ({
    ...state,
    loadingAccounts: true,
    error: null
  })),

  on(AccountsActions.loadAccountsSuccess, (state, { accounts }) => ({
    ...state,
    accounts,
    loadingAccounts: false,
    error: null
  })),

  on(AccountsActions.loadAccountsFailure, (state, { error }) => ({
    ...state,
    loadingAccounts: false,
    error
  })),

  on(AccountsActions.loadAccount, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AccountsActions.loadAccountSuccess, (state, { account }) => ({
    ...state,
    currentAccount: account,
    loading: false,
    error: null
  })),

  on(AccountsActions.loadAccountFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AccountsActions.updateAccount, (state) => ({
    ...state,
    updatingAccount: true,
    error: null
  })),

  on(AccountsActions.updateAccountSuccess, (state, { account }) => ({
    ...state,
    accounts: state.accounts.map(acc => acc.id === account.id ? account : acc),
    currentAccount: state.currentAccount?.id === account.id ? account : state.currentAccount,
    updatingAccount: false,
    error: null
  })),

  on(AccountsActions.updateAccountFailure, (state, { error }) => ({
    ...state,
    updatingAccount: false,
    error
  })),

  on(AccountsActions.deleteAccount, (state) => ({
    ...state,
    deletingAccount: true,
    error: null
  })),

  on(AccountsActions.deleteAccountSuccess, (state, { accountId }) => ({
    ...state,
    accounts: state.accounts.filter(acc => acc.id !== accountId),
    currentAccount: state.currentAccount?.id === accountId ? null : state.currentAccount,
    selectedAccountId: state.selectedAccountId === accountId ? null : state.selectedAccountId,
    deletingAccount: false,
    error: null
  })),

  on(AccountsActions.deleteAccountFailure, (state, { error }) => ({
    ...state,
    deletingAccount: false,
    error
  })),

  // UI State
  on(AccountsActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(AccountsActions.setError, (state, { error }) => ({
    ...state,
    error
  })),

  on(AccountsActions.clearError, (state) => ({
    ...state,
    error: null
  })),

  // Account Selection
  on(AccountsActions.setSelectedAccount, (state, { accountId }) => ({
    ...state,
    selectedAccountId: accountId
  })),

  on(AccountsActions.clearSelectedAccount, (state) => ({
    ...state,
    selectedAccountId: null
  })),

  // Real-time updates
  on(AccountsActions.accountStatusChanged, (state, { accountId, isActive }) => ({
    ...state,
    accounts: state.accounts.map(acc => 
      acc.id === accountId ? { ...acc, isActive } : acc
    )
  })),

  on(AccountsActions.accountSyncCompleted, (state, { accountId, lastSyncAt }) => ({
    ...state,
    accounts: state.accounts.map(acc => 
      acc.id === accountId ? { ...acc, lastSyncAt } : acc
    )
  }))
);