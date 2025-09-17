"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailDraftsRelations = exports.emailAttachmentsRelations = exports.emailMessagesRelations = exports.emailAccountsRelations = exports.usersRelations = exports.emailDrafts = exports.emailAttachments = exports.emailMessages = exports.emailAccounts = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
// Users table
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    username: (0, pg_core_1.varchar)('username', { length: 100 }).notNull().unique(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Email accounts table (IMAP/Exchange configurations)
exports.emailAccounts = (0, pg_core_1.pgTable)('email_accounts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    accountName: (0, pg_core_1.varchar)('account_name', { length: 255 }).notNull(),
    emailAddress: (0, pg_core_1.varchar)('email_address', { length: 255 }).notNull(),
    serverType: (0, pg_core_1.varchar)('server_type', { length: 50 }).notNull(), // 'imap', 'exchange'
    serverHost: (0, pg_core_1.varchar)('server_host', { length: 255 }).notNull(),
    serverPort: (0, pg_core_1.integer)('server_port').notNull(),
    username: (0, pg_core_1.varchar)('username', { length: 255 }).notNull(),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    useSsl: (0, pg_core_1.boolean)('use_ssl').default(true),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    lastSyncAt: (0, pg_core_1.timestamp)('last_sync_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)('email_accounts_user_id_idx').on(table.userId),
}));
// Email messages table
exports.emailMessages = (0, pg_core_1.pgTable)('email_messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.emailAccounts.id).notNull(),
    serverMessageId: (0, pg_core_1.varchar)('server_message_id', { length: 255 }).notNull(),
    messageId: (0, pg_core_1.varchar)('message_id', { length: 500 }),
    threadId: (0, pg_core_1.varchar)('thread_id', { length: 255 }),
    inReplyTo: (0, pg_core_1.varchar)('in_reply_to', { length: 500 }),
    references: (0, pg_core_1.text)('references'),
    subject: (0, pg_core_1.text)('subject'),
    fromAddress: (0, pg_core_1.varchar)('from_address', { length: 255 }).notNull(),
    fromName: (0, pg_core_1.varchar)('from_name', { length: 255 }),
    toAddresses: (0, pg_core_1.jsonb)('to_addresses'), // Array of {address, name}
    ccAddresses: (0, pg_core_1.jsonb)('cc_addresses'),
    bccAddresses: (0, pg_core_1.jsonb)('bcc_addresses'),
    replyToAddresses: (0, pg_core_1.jsonb)('reply_to_addresses'),
    textBody: (0, pg_core_1.text)('text_body'),
    htmlBody: (0, pg_core_1.text)('html_body'),
    receivedAt: (0, pg_core_1.timestamp)('received_at').notNull(),
    sentAt: (0, pg_core_1.timestamp)('sent_at'),
    isRead: (0, pg_core_1.boolean)('is_read').default(false),
    isFlagged: (0, pg_core_1.boolean)('is_flagged').default(false),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').default(false),
    folderName: (0, pg_core_1.varchar)('folder_name', { length: 255 }).default('INBOX'),
    priority: (0, pg_core_1.varchar)('priority', { length: 20 }).default('normal'),
    hasAttachments: (0, pg_core_1.boolean)('has_attachments').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    accountIdIdx: (0, pg_core_1.index)('email_messages_account_id_idx').on(table.accountId),
    threadIdIdx: (0, pg_core_1.index)('email_messages_thread_id_idx').on(table.threadId),
    receivedAtIdx: (0, pg_core_1.index)('email_messages_received_at_idx').on(table.receivedAt),
    subjectIdx: (0, pg_core_1.index)('email_messages_subject_idx').on(table.subject),
}));
// Email attachments table
exports.emailAttachments = (0, pg_core_1.pgTable)('email_attachments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    messageId: (0, pg_core_1.uuid)('message_id').references(() => exports.emailMessages.id).notNull(),
    filename: (0, pg_core_1.varchar)('filename', { length: 255 }).notNull(),
    contentType: (0, pg_core_1.varchar)('content_type', { length: 100 }),
    size: (0, pg_core_1.integer)('size').notNull(),
    contentId: (0, pg_core_1.varchar)('content_id', { length: 255 }),
    isInline: (0, pg_core_1.boolean)('is_inline').default(false),
    filePath: (0, pg_core_1.text)('file_path'), // Path to stored file
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
}, (table) => ({
    messageIdIdx: (0, pg_core_1.index)('email_attachments_message_id_idx').on(table.messageId),
}));
// Email drafts table
exports.emailDrafts = (0, pg_core_1.pgTable)('email_drafts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.emailAccounts.id).notNull(),
    subject: (0, pg_core_1.text)('subject'),
    toAddresses: (0, pg_core_1.jsonb)('to_addresses'),
    ccAddresses: (0, pg_core_1.jsonb)('cc_addresses'),
    bccAddresses: (0, pg_core_1.jsonb)('bcc_addresses'),
    textBody: (0, pg_core_1.text)('text_body'),
    htmlBody: (0, pg_core_1.text)('html_body'),
    inReplyTo: (0, pg_core_1.varchar)('in_reply_to', { length: 500 }),
    threadId: (0, pg_core_1.varchar)('thread_id', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)('email_drafts_user_id_idx').on(table.userId),
}));
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    emailAccounts: many(exports.emailAccounts),
    emailDrafts: many(exports.emailDrafts)
}));
exports.emailAccountsRelations = (0, drizzle_orm_1.relations)(exports.emailAccounts, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.emailAccounts.userId],
        references: [exports.users.id]
    }),
    emailMessages: many(exports.emailMessages),
    emailDrafts: many(exports.emailDrafts)
}));
exports.emailMessagesRelations = (0, drizzle_orm_1.relations)(exports.emailMessages, ({ one, many }) => ({
    account: one(exports.emailAccounts, {
        fields: [exports.emailMessages.accountId],
        references: [exports.emailAccounts.id]
    }),
    attachments: many(exports.emailAttachments)
}));
exports.emailAttachmentsRelations = (0, drizzle_orm_1.relations)(exports.emailAttachments, ({ one }) => ({
    message: one(exports.emailMessages, {
        fields: [exports.emailAttachments.messageId],
        references: [exports.emailMessages.id]
    })
}));
exports.emailDraftsRelations = (0, drizzle_orm_1.relations)(exports.emailDrafts, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.emailDrafts.userId],
        references: [exports.users.id]
    }),
    account: one(exports.emailAccounts, {
        fields: [exports.emailDrafts.accountId],
        references: [exports.emailAccounts.id]
    })
}));
//# sourceMappingURL=schema.js.map