import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Notification } from './ui.reducer';

export const UIActions = createActionGroup({
  source: 'UI',
  events: {
    // Sidebar
    'Toggle Sidebar': emptyProps(),
    'Set Sidebar Open': props<{ open: boolean }>(),
    
    // Theme
    'Toggle Theme': emptyProps(),
    'Set Theme': props<{ theme: 'light' | 'dark' }>(),
    
    // Dialogs
    'Open Compose Dialog': props<{ composeData?: any }>(),
    'Close Compose Dialog': emptyProps(),
    'Open Settings Dialog': emptyProps(),
    'Close Settings Dialog': emptyProps(),
    
    // Responsive
    'Set Mobile View': props<{ isMobile: boolean }>(),
    
    // Email List
    'Set Email List View Mode': props<{ mode: 'list' | 'grid' }>(),
    'Toggle Preview Pane': emptyProps(),
    
    // Notifications
    'Add Notification': props<{ notification: Notification }>(),
    'Remove Notification': props<{ id: string }>(),
    'Clear Notifications': emptyProps(),
    
    // Loading states
    'Set Loading': props<{ feature: string; loading: boolean }>(),
    
    // Error handling
    'Show Error': props<{ message: string }>(),
    'Show Success': props<{ message: string }>(),
    'Show Warning': props<{ message: string }>(),
    'Show Info': props<{ message: string }>(),

    // Snackbar
    'Show Snackbar': props<{ message: string; duration?: number }>()
  }
});