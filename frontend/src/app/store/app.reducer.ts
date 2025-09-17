import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { emailReducer, EmailState } from './email/email.reducer';
import { accountsReducer, AccountsState } from './accounts/accounts.reducer';
import { uiReducer, UIState } from './ui/ui.reducer';

export interface AppState {
  auth: AuthState;
  email: EmailState;
  accounts: AccountsState;
  ui: UIState;
}

export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  email: emailReducer,
  accounts: accountsReducer,
  ui: uiReducer
};