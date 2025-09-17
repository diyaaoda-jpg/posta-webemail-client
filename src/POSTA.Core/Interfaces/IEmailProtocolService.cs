using POSTA.Core.Entities;

namespace POSTA.Core.Interfaces;

public interface IEmailProtocolService
{
    Task<bool> TestConnectionAsync(EmailAccount account);
    Task<IEnumerable<POSTA.Core.Entities.EmailMessage>> GetEmailsAsync(EmailAccount account, string folderName = "INBOX", int limit = 50);
    Task<POSTA.Core.Entities.EmailMessage?> GetEmailByIdAsync(EmailAccount account, string messageId);
    Task<bool> SendEmailAsync(EmailAccount account, EmailDraft draft);
    Task<bool> MarkAsReadAsync(EmailAccount account, string messageId, bool isRead);
    Task<bool> DeleteEmailAsync(EmailAccount account, string messageId);
    Task<IEnumerable<string>> GetFoldersAsync(EmailAccount account);
    Task<byte[]?> GetAttachmentAsync(EmailAccount account, string messageId, string attachmentId);
    Task SyncEmailsAsync(EmailAccount account);
}

public interface IEmailSyncService
{
    Task SyncAccountAsync(Guid accountId);
    Task SyncAllAccountsAsync();
    Task<bool> IsAccountSyncingAsync(Guid accountId);
}

public enum EmailProtocolType
{
    IMAP,
    Exchange
}