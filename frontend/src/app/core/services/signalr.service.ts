import { Injectable, inject, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { EmailActions } from '../../store/email/email.actions';
import { EmailMessage } from '../models/email.model';
import { selectAuthToken } from '../../store/auth/auth.selectors';

export interface SignalRConnectionState {
  state: HubConnectionState;
  isConnected: boolean;
  error?: string;
  lastConnected?: Date;
  reconnectAttempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private store = inject(Store);
  
  private hubConnection: HubConnection | null = null;
  private reconnectTimer: number | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  // Connection state signal
  connectionState = signal<SignalRConnectionState>({
    state: HubConnectionState.Disconnected,
    isConnected: false,
    reconnectAttempts: 0
  });

  async startConnection(): Promise<void> {
    if (!environment.features.pushNotifications || !environment.signalRUrl) {
      return;
    }
    
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(environment.signalRUrl, {
          accessTokenFactory: () => {
            // Get the current auth token from the store
            let token: string | null = null;
            this.store.select(selectAuthToken).subscribe(authToken => {
              token = authToken;
            }).unsubscribe();
            return token || '';
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 2s, 4s, 8s, 16s, 30s max
            return Math.min(2000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(environment.debug.enableLogging ? LogLevel.Information : LogLevel.Warning)
        .build();

      this.setupEventHandlers();
      this.setupConnectionStateHandlers();

      await this.hubConnection.start();
      
      this.updateConnectionState({
        state: HubConnectionState.Connected,
        isConnected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: undefined
      });

      console.log('SignalR connection established successfully');
      
      // Join user-specific groups for targeted notifications
      await this.joinUserGroups();
      
    } catch (error) {
      console.error('Failed to start SignalR connection:', error);
      this.updateConnectionState({
        state: HubConnectionState.Disconnected,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        reconnectAttempts: this.connectionState().reconnectAttempts + 1
      });
      
      this.scheduleReconnect();
    }
  }

  async stopConnection(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
      this.hubConnection = null;
    }

    this.updateConnectionState({
      state: HubConnectionState.Disconnected,
      isConnected: false,
      reconnectAttempts: 0
    });
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Email-related events
    this.hubConnection.on('EmailReceived', (email: EmailMessage) => {
      console.log('New email received via SignalR:', email);
      this.store.dispatch(EmailActions.emailReceived({ email }));
    });

    this.hubConnection.on('EmailUpdated', (email: EmailMessage) => {
      console.log('Email updated via SignalR:', email);
      this.store.dispatch(EmailActions.emailUpdated({ email }));
    });

    this.hubConnection.on('EmailDeleted', (emailId: string) => {
      console.log('Email deleted via SignalR:', emailId);
      this.store.dispatch(EmailActions.emailDeleted({ emailId }));
    });

    // Sync-related events
    this.hubConnection.on('SyncStarted', (accountId: string) => {
      console.log('Email sync started for account:', accountId);
      // Future: Dispatch sync actions
    });

    this.hubConnection.on('SyncCompleted', (accountId: string) => {
      console.log('Email sync completed for account:', accountId);
      // Future: Dispatch sync completion actions
    });

    // Connection status events
    this.hubConnection.on('ConnectionAcknowledged', (message: string) => {
      console.log('SignalR connection acknowledged:', message);
    });
  }

  private setupConnectionStateHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      this.updateConnectionState({
        state: HubConnectionState.Disconnected,
        isConnected: false,
        error: error?.message || 'Connection closed'
      });
      
      this.scheduleReconnect();
    });

    this.hubConnection.onreconnecting((error) => {
      console.log('SignalR reconnecting:', error);
      this.updateConnectionState({
        state: HubConnectionState.Reconnecting,
        isConnected: false,
        error: error?.message || 'Reconnecting...'
      });
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR reconnected with ID:', connectionId);
      this.updateConnectionState({
        state: HubConnectionState.Connected,
        isConnected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: undefined
      });
      
      // Rejoin groups after reconnection
      this.joinUserGroups();
    });
  }

  private async joinUserGroups(): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      // Join user-specific group for targeted notifications
      await this.hubConnection.invoke('JoinUserGroup');
      console.log('Joined user-specific SignalR group');
    } catch (error) {
      console.error('Failed to join user groups:', error);
    }
  }

  private scheduleReconnect(): void {
    if (!environment.features.pushNotifications || !environment.signalRUrl) {
      return;
    }
    
    const currentState = this.connectionState();
    
    if (currentState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Stopping reconnection attempts.');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = this.reconnectDelay * Math.pow(2, currentState.reconnectAttempts);
    console.log(`Scheduling SignalR reconnection in ${delay}ms (attempt ${currentState.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.startConnection();
    }, delay) as unknown as number;
  }

  private updateConnectionState(updates: Partial<SignalRConnectionState>): void {
    this.connectionState.update(current => ({
      ...current,
      ...updates
    }));
  }

  // Public methods for manual control
  isConnected(): boolean {
    return this.connectionState().isConnected;
  }

  getConnectionState(): HubConnectionState {
    return this.connectionState().state;
  }

  async reconnect(): Promise<void> {
    await this.stopConnection();
    await this.startConnection();
  }

  // Method to send messages to server (future use)
  async sendMessage(methodName: string, ...args: any[]): Promise<any> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      return await this.hubConnection.invoke(methodName, ...args);
    } catch (error) {
      console.error(`Failed to invoke ${methodName}:`, error);
      throw error;
    }
  }

  // Lifecycle methods
  async initialize(): Promise<void> {
    if (environment.features.pushNotifications) {
      await this.startConnection();
    }
  }

  async destroy(): Promise<void> {
    await this.stopConnection();
  }
}