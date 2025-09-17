import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../core/models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    'Login': props<{ request: LoginRequest }>(),
    'Login Success': props<{ response: AuthResponse }>(),
    'Login Failure': props<{ error: string }>(),
    
    // Register
    'Register': props<{ request: RegisterRequest }>(),
    'Register Success': props<{ response: AuthResponse }>(),
    'Register Failure': props<{ error: string }>(),
    
    // Logout
    'Logout': emptyProps(),
    'Logout Complete': emptyProps(),
    
    // Token management
    'Load Token From Storage': emptyProps(),
    'Token Loaded': props<{ token: string; user: User }>(),
    'Token Invalid': emptyProps(),
    
    // User management
    'Load Current User': emptyProps(),
    'Load Current User Success': props<{ user: User }>(),
    'Load Current User Failure': props<{ error: string }>(),
    
    // Clear auth state
    'Clear Auth State': emptyProps()
  }
});