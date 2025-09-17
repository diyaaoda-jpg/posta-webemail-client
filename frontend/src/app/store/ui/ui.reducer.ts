import { createReducer, on } from '@ngrx/store';
import { UIActions } from './ui.actions';

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  composeDialogOpen: boolean;
  settingsDialogOpen: boolean;
  mobileView: boolean;
  emailListViewMode: 'list' | 'grid';
  previewPaneVisible: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  composeDialogOpen: false,
  settingsDialogOpen: false,
  mobileView: false,
  emailListViewMode: 'list',
  previewPaneVisible: true,
  notifications: []
};

export const uiReducer = createReducer(
  initialState,
  
  on(UIActions.toggleSidebar, (state) => ({
    ...state,
    sidebarOpen: !state.sidebarOpen
  })),
  
  on(UIActions.setSidebarOpen, (state, { open }) => ({
    ...state,
    sidebarOpen: open
  })),
  
  on(UIActions.toggleTheme, (state) => ({
    ...state,
    theme: (state.theme === 'light' ? 'dark' : 'light') as 'light' | 'dark'
  })),
  
  on(UIActions.setTheme, (state, { theme }) => ({
    ...state,
    theme
  })),
  
  on(UIActions.openComposeDialog, (state) => ({
    ...state,
    composeDialogOpen: true
  })),
  
  on(UIActions.closeComposeDialog, (state) => ({
    ...state,
    composeDialogOpen: false
  })),
  
  on(UIActions.openSettingsDialog, (state) => ({
    ...state,
    settingsDialogOpen: true
  })),
  
  on(UIActions.closeSettingsDialog, (state) => ({
    ...state,
    settingsDialogOpen: false
  })),
  
  on(UIActions.setMobileView, (state, { isMobile }) => ({
    ...state,
    mobileView: isMobile,
    sidebarOpen: !isMobile // Close sidebar on mobile by default
  })),
  
  on(UIActions.setEmailListViewMode, (state, { mode }) => ({
    ...state,
    emailListViewMode: mode
  })),
  
  on(UIActions.togglePreviewPane, (state) => ({
    ...state,
    previewPaneVisible: !state.previewPaneVisible
  })),
  
  on(UIActions.addNotification, (state, { notification }) => ({
    ...state,
    notifications: [...state.notifications, notification]
  })),
  
  on(UIActions.removeNotification, (state, { id }) => ({
    ...state,
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  on(UIActions.clearNotifications, (state) => ({
    ...state,
    notifications: []
  }))
);