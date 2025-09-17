import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { SignalRService } from './signalr.service';
import { EmailActions } from '../../store/email/email.actions';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  private store = inject(Store);
  private signalRService = inject(SignalRService);

  async initializeApp(): Promise<void> {
    try {
      console.log('Initializing POSTA Email Client...');

      // Initialize SignalR connection for real-time updates
      await this.signalRService.initialize();

      // Load initial data
      this.store.dispatch(EmailActions.loadAccounts());

      console.log('POSTA Email Client initialization completed successfully');
    } catch (error) {
      console.error('Failed to initialize POSTA Email Client:', error);
      // Don't throw error to prevent app from failing to start
    }
  }

  async destroyApp(): Promise<void> {
    try {
      await this.signalRService.destroy();
      console.log('POSTA Email Client cleanup completed');
    } catch (error) {
      console.error('Error during app cleanup:', error);
    }
  }
}