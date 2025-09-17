import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { 
  AutodiscoverRequest, 
  AutodiscoverResponse, 
  ManualDiscoverRequest, 
  TestConnectionRequest, 
  TestConnectionResponse, 
  AccountCreationRequest, 
  AccountCreationResponse,
  EmailAccount,
  AccountSetupStep,
  ExchangeServerConfig
} from '../../core/models/email.model';

export const AccountsActions = createActionGroup({
  source: 'Accounts',
  events: {
    // Account Setup Flow
    'Initialize Account Setup': emptyProps(),
    'Clear Account Setup': emptyProps(),
    'Set Current Step': props<{ step: AccountSetupStep }>(),
    
    // Email Autodiscovery
    'Submit Email for Discovery': props<{ emailAddress: string }>(),
    'Email Discovery Success': props<{ response: AutodiscoverResponse }>(),
    'Email Discovery Failure': props<{ error: string }>(),
    
    // Manual Discovery
    'Submit Manual Discovery': props<{ emailAddress: string; serverInput: string }>(),
    'Manual Discovery Success': props<{ response: AutodiscoverResponse }>(),
    'Manual Discovery Failure': props<{ error: string }>(),
    
    // Credentials and Auth
    'Submit Credentials': props<{ credentials: { username: string; password: string; accountName: string; displayName?: string } }>(),
    'Set Server Config': props<{ config: ExchangeServerConfig }>(),
    
    // Connection Testing
    'Test Connection': emptyProps(),
    'Test Connection Success': props<{ response: TestConnectionResponse }>(),
    'Test Connection Failure': props<{ error: string }>(),
    
    // Account Creation
    'Create Account': emptyProps(),
    'Create Account Success': props<{ response: AccountCreationResponse }>(),
    'Create Account Failure': props<{ error: string }>(),
    
    // Account Management (CRUD)
    'Load Accounts': emptyProps(),
    'Load Accounts Success': props<{ accounts: EmailAccount[] }>(),
    'Load Accounts Failure': props<{ error: string }>(),
    
    'Load Account': props<{ accountId: string }>(),
    'Load Account Success': props<{ account: EmailAccount }>(),
    'Load Account Failure': props<{ error: string }>(),
    
    'Update Account': props<{ accountId: string; updates: Partial<EmailAccount> }>(),
    'Update Account Success': props<{ account: EmailAccount }>(),
    'Update Account Failure': props<{ error: string }>(),
    
    'Delete Account': props<{ accountId: string }>(),
    'Delete Account Success': props<{ accountId: string }>(),
    'Delete Account Failure': props<{ error: string }>(),
    
    // UI State
    'Set Loading': props<{ loading: boolean }>(),
    'Set Error': props<{ error: string | null }>(),
    'Clear Error': emptyProps(),
    
    // Account Selection
    'Set Selected Account': props<{ accountId: string }>(),
    'Clear Selected Account': emptyProps(),
    
    // Real-time updates
    'Account Status Changed': props<{ accountId: string; isActive: boolean }>(),
    'Account Sync Completed': props<{ accountId: string; lastSyncAt: Date }>()
  }
});