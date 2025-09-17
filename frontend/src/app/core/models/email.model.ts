export interface EmailMessage {
  id: string;
  accountId: string;
  subject?: string;
  fromAddress: string;
  fromName?: string;
  toAddresses: string;
  ccAddresses?: string;
  bccAddresses?: string;
  textBody?: string;
  htmlBody?: string;
  isRead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
  folderName: string;
  receivedAt: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  emailId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  isInline: boolean;
  contentId?: string;
  createdAt: Date;
}

export interface EmailAccount {
  id: string;
  userId: string;
  email: string;
  displayName?: string;
  provider: string;
  isDefault: boolean;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailDraft {
  id: string;
  accountId: string;
  subject?: string;
  toAddresses: string;
  ccAddresses?: string;
  bccAddresses?: string;
  textBody?: string;
  htmlBody?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailListParams {
  page?: number;
  limit?: number;
  search?: string;
  folder?: string;
}

export interface EmailListResponse {
  emails: EmailMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Account setup and discovery models
export interface AutodiscoverRequest {
  emailAddress: string;
}

export interface ManualDiscoverRequest {
  emailAddress: string;
  serverInput: string;
}

export interface TestConnectionRequest {
  emailAddress: string;
  username: string;
  password: string;
  serverConfig: ExchangeServerConfig;
}

export interface AccountCreationRequest {
  accountName: string;
  emailAddress: string;
  username: string;
  password: string;
  serverConfig: ExchangeServerConfig;
  displayName?: string;
}

export interface ExchangeServerConfig {
  ewsUrl: string;
  serverHost: string;
  serverPort: number;
  useSsl: boolean;
  displayName: string;
  autodiscoverMethod: string;
  triedUrls: string[];
  errorMessage?: string;
}

export interface AutodiscoverResponse {
  success: boolean;
  emailAddress: string;
  config?: ExchangeServerConfig;
  triedUrls: string[];
  errorMessage?: string;
  timestamp: Date;
  suggestion?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  emailAddress: string;
  username: string;
  serverConfig: ExchangeServerConfig;
  timestamp: Date;
}

export interface AccountCreationResponse {
  success: boolean;
  message: string;
  account: EmailAccount;
  timestamp: Date;
}

// Account step types for UI flow
export type AccountSetupStep = 'email' | 'discovery' | 'manual' | 'auth' | 'testing' | 'success';

export interface AccountSetupState {
  currentStep: AccountSetupStep;
  emailAddress: string;
  serverConfig?: ExchangeServerConfig;
  credentials?: {
    username: string;
    password: string;
  };
  accountDetails?: {
    accountName: string;
    displayName?: string;
  };
  discoveryResult?: AutodiscoverResponse;
  testResult?: TestConnectionResponse;
  isLoading: boolean;
  error?: string;
}