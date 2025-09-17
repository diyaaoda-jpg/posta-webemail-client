import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer,
  jsonb,
  index
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Email accounts table (IMAP/Exchange configurations)
export const emailAccounts = pgTable('email_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  emailAddress: varchar('email_address', { length: 255 }).notNull(),
  serverType: varchar('server_type', { length: 50 }).notNull(), // 'imap', 'exchange'
  serverHost: varchar('server_host', { length: 255 }).notNull(),
  serverPort: integer('server_port').notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  useSsl: boolean('use_ssl').default(true),
  isActive: boolean('is_active').default(true),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('email_accounts_user_id_idx').on(table.userId),
}));

// Email messages table
export const emailMessages = pgTable('email_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => emailAccounts.id).notNull(),
  serverMessageId: varchar('server_message_id', { length: 255 }).notNull(),
  messageId: varchar('message_id', { length: 500 }),
  threadId: varchar('thread_id', { length: 255 }),
  inReplyTo: varchar('in_reply_to', { length: 500 }),
  references: text('references'),
  subject: text('subject'),
  fromAddress: varchar('from_address', { length: 255 }).notNull(),
  fromName: varchar('from_name', { length: 255 }),
  toAddresses: jsonb('to_addresses'), // Array of {address, name}
  ccAddresses: jsonb('cc_addresses'),
  bccAddresses: jsonb('bcc_addresses'),
  replyToAddresses: jsonb('reply_to_addresses'),
  textBody: text('text_body'),
  htmlBody: text('html_body'),
  receivedAt: timestamp('received_at').notNull(),
  sentAt: timestamp('sent_at'),
  isRead: boolean('is_read').default(false),
  isFlagged: boolean('is_flagged').default(false),
  isDeleted: boolean('is_deleted').default(false),
  folderName: varchar('folder_name', { length: 255 }).default('INBOX'),
  priority: varchar('priority', { length: 20 }).default('normal'),
  hasAttachments: boolean('has_attachments').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  accountIdIdx: index('email_messages_account_id_idx').on(table.accountId),
  threadIdIdx: index('email_messages_thread_id_idx').on(table.threadId),
  receivedAtIdx: index('email_messages_received_at_idx').on(table.receivedAt),
  subjectIdx: index('email_messages_subject_idx').on(table.subject),
}));

// Email attachments table
export const emailAttachments = pgTable('email_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').references(() => emailMessages.id).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 100 }),
  size: integer('size').notNull(),
  contentId: varchar('content_id', { length: 255 }),
  isInline: boolean('is_inline').default(false),
  filePath: text('file_path'), // Path to stored file
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  messageIdIdx: index('email_attachments_message_id_idx').on(table.messageId),
}));

// Email drafts table
export const emailDrafts = pgTable('email_drafts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  accountId: uuid('account_id').references(() => emailAccounts.id).notNull(),
  subject: text('subject'),
  toAddresses: jsonb('to_addresses'),
  ccAddresses: jsonb('cc_addresses'),
  bccAddresses: jsonb('bcc_addresses'),
  textBody: text('text_body'),
  htmlBody: text('html_body'),
  inReplyTo: varchar('in_reply_to', { length: 500 }),
  threadId: varchar('thread_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('email_drafts_user_id_idx').on(table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  emailAccounts: many(emailAccounts),
  emailDrafts: many(emailDrafts)
}));

export const emailAccountsRelations = relations(emailAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [emailAccounts.userId],
    references: [users.id]
  }),
  emailMessages: many(emailMessages),
  emailDrafts: many(emailDrafts)
}));

export const emailMessagesRelations = relations(emailMessages, ({ one, many }) => ({
  account: one(emailAccounts, {
    fields: [emailMessages.accountId],
    references: [emailAccounts.id]
  }),
  attachments: many(emailAttachments)
}));

export const emailAttachmentsRelations = relations(emailAttachments, ({ one }) => ({
  message: one(emailMessages, {
    fields: [emailAttachments.messageId],
    references: [emailMessages.id]
  })
}));

export const emailDraftsRelations = relations(emailDrafts, ({ one }) => ({
  user: one(users, {
    fields: [emailDrafts.userId],
    references: [users.id]
  }),
  account: one(emailAccounts, {
    fields: [emailDrafts.accountId],
    references: [emailAccounts.id]
  })
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = typeof emailAccounts.$inferInsert;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type InsertEmailMessage = typeof emailMessages.$inferInsert;
export type EmailAttachment = typeof emailAttachments.$inferSelect;
export type InsertEmailAttachment = typeof emailAttachments.$inferInsert;
export type EmailDraft = typeof emailDrafts.$inferSelect;
export type InsertEmailDraft = typeof emailDrafts.$inferInsert;