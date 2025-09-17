import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.token,
    isLoading: false,
    isAuthenticated: true,
    error: null
  })),
  
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    error
  })),
  
  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.token,
    isLoading: false,
    isAuthenticated: true,
    error: null
  })),
  
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    error
  })),
  
  // Token management
  on(AuthActions.tokenLoaded, (state, { token, user }) => ({
    ...state,
    token,
    user,
    isAuthenticated: true,
    error: null
  })),
  
  on(AuthActions.tokenInvalid, (state) => ({
    ...state,
    token: null,
    user: null,
    isAuthenticated: false,
    error: 'Token is invalid'
  })),
  
  // Logout
  on(AuthActions.logout, AuthActions.logoutComplete, AuthActions.clearAuthState, () => ({
    ...initialState
  })),
  
  // User loading
  on(AuthActions.loadCurrentUser, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(AuthActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false
  })),
  
  on(AuthActions.loadCurrentUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  }))
);