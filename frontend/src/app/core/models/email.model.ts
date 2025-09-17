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