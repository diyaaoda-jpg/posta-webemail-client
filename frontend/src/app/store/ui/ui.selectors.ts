import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.reducer';

export const selectUIState = createFeatureSelector<UIState>('ui');

export const selectSidebarOpen = createSelector(
  selectUIState,
  (state) => state.sidebarOpen
);

export const selectTheme = createSelector(
  selectUIState,
  (state) => state.theme
);

export const selectComposeDialogOpen = createSelector(
  selectUIState,
  (state) => state.composeDialogOpen
);

export const selectSettingsDialogOpen = createSelector(
  selectUIState,
  (state) => state.settingsDialogOpen
);

export const selectMobileView = createSelector(
  selectUIState,
  (state) => state.mobileView
);

export const selectEmailListViewMode = createSelector(
  selectUIState,
  (state) => state.emailListViewMode
);

export const selectPreviewPaneVisible = createSelector(
  selectUIState,
  (state) => state.previewPaneVisible
);

export const selectNotifications = createSelector(
  selectUIState,
  (state) => state.notifications
);

export const selectActiveNotifications = createSelector(
  selectNotifications,
  (notifications) => notifications.filter(n => 
    !n.duration || Date.now() - n.timestamp.getTime() < n.duration
  )
);