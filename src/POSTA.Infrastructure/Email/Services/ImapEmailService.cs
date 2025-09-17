using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using MimeKit;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using POSTA.Core.Entities;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Data;
using System.Text.Json;

namespace POSTA.Infrastructure.Email.Services;

public class ImapEmailService : IEmailProtocolService
{
    private readonly POSTADbContext _context;
    private readonly ILogger<ImapEmailService> _logger;

    public ImapEmailService(POSTADbContext context, ILogger<ImapEmailService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> TestConnectionAsync(EmailAccount account)
    {
        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash); // Note: Should be decrypted in production
            await client.DisconnectAsync(true);
            
            _logger.LogInformation("Successfully connected to IMAP server for account {EmailAddress}", account.EmailAddress);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to IMAP server for account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async Task<IEnumerable<POSTA.Core.Entities.EmailMessage>> GetEmailsAsync(EmailAccount account, string folderName = "INBOX", int limit = 50)
    {
        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash);

            var folder = await client.GetFolderAsync(folderName);
            await folder.OpenAsync(FolderAccess.ReadOnly);

            // Get the most recent emails
            var uids = await folder.SearchAsync(SearchQuery.All);
            var recentUids = uids.OrderByDescending(u => u.Id).Take(limit);

            var emails = new List<POSTA.Core.Entities.EmailMessage>();

            foreach (var uid in recentUids)
            {
                try
                {
                    var message = await folder.GetMessageAsync(uid);
                    var emailMessage = await ConvertToEmailMessageAsync(message, account.Id, folderName, uid.ToString());
                    if (emailMessage != null)
                    {
                        emails.Add(emailMessage);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to process message {UID} from folder {FolderName}", uid, folderName);
                }
            }

            await client.DisconnectAsync(true);
            return emails;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve emails from folder {FolderName} for account {EmailAddress}", 
                folderName, account.EmailAddress);
            return new List<EmailMessage>();
        }
    }

    public async Task<POSTA.Core.Entities.EmailMessage?> GetEmailByIdAsync(EmailAccount account, string messageId)
    {
        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash);

            // Search in common folders
            var folderNames = new[] { "INBOX", "Sent", "Drafts", "Trash" };
            
            foreach (var folderName in folderNames)
            {
                try
                {
                    var folder = await client.GetFolderAsync(folderName);
                    await folder.OpenAsync(FolderAccess.ReadOnly);

                    var query = SearchQuery.HeaderContains("Message-Id", messageId);
                    var uids = await folder.SearchAsync(query);

                    if (uids.Count > 0)
                    {
                        var message = await folder.GetMessageAsync(uids[0]);
                        var emailMessage = await ConvertToEmailMessageAsync(message, account.Id, folderName, uids[0].ToString());
                        await client.DisconnectAsync(true);
                        return emailMessage;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to search in folder {FolderName}", folderName);
                }
            }

            await client.DisconnectAsync(true);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve email by ID {MessageId} for account {EmailAddress}", 
                messageId, account.EmailAddress);
            return null;
        }
    }

    public async Task<bool> SendEmailAsync(EmailAccount account, EmailDraft draft)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(account.DisplayName ?? account.EmailAddress, account.EmailAddress));
            message.Subject = draft.Subject ?? "";

            // Add recipients
            if (!string.IsNullOrEmpty(draft.ToAddresses))
            {
                var toAddresses = JsonSerializer.Deserialize<string[]>(draft.ToAddresses);
                if (toAddresses != null)
                {
                    foreach (var address in toAddresses)
                    {
                        message.To.Add(MailboxAddress.Parse(address));
                    }
                }
            }

            // Add CC recipients
            if (!string.IsNullOrEmpty(draft.CcAddresses))
            {
                var ccAddresses = JsonSerializer.Deserialize<string[]>(draft.CcAddresses);
                if (ccAddresses != null)
                {
                    foreach (var address in ccAddresses)
                    {
                        message.Cc.Add(MailboxAddress.Parse(address));
                    }
                }
            }

            // Add BCC recipients
            if (!string.IsNullOrEmpty(draft.BccAddresses))
            {
                var bccAddresses = JsonSerializer.Deserialize<string[]>(draft.BccAddresses);
                if (bccAddresses != null)
                {
                    foreach (var address in bccAddresses)
                    {
                        message.Bcc.Add(MailboxAddress.Parse(address));
                    }
                }
            }

            // Handle reply/forward headers
            if (!string.IsNullOrEmpty(draft.InReplyTo))
            {
                message.InReplyTo = draft.InReplyTo;
            }

            // Create body
            var bodyBuilder = new BodyBuilder();
            if (!string.IsNullOrEmpty(draft.HtmlBody))
            {
                bodyBuilder.HtmlBody = draft.HtmlBody;
                if (!string.IsNullOrEmpty(draft.TextBody))
                {
                    bodyBuilder.TextBody = draft.TextBody;
                }
            }
            else
            {
                bodyBuilder.TextBody = draft.TextBody ?? "";
            }

            message.Body = bodyBuilder.ToMessageBody();

            // Send via SMTP
            using var smtpClient = new SmtpClient();
            
            // Use SMTP server settings (usually different from IMAP)
            var smtpHost = account.SmtpHost ?? account.ServerHost.Replace("imap", "smtp");
            var smtpPort = account.SmtpPort ?? (account.UseSsl ? 587 : 25);
            
            await smtpClient.ConnectAsync(smtpHost, smtpPort, account.UseSsl);
            await smtpClient.AuthenticateAsync(account.Username, account.PasswordHash);
            await smtpClient.SendAsync(message);
            await smtpClient.DisconnectAsync(true);

            _logger.LogInformation("Successfully sent email from account {EmailAddress}", account.EmailAddress);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email from account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async Task<bool> MarkAsReadAsync(EmailAccount account, string messageId, bool isRead)
    {
        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash);

            var inbox = await client.GetFolderAsync("INBOX");
            await inbox.OpenAsync(FolderAccess.ReadWrite);

            var query = SearchQuery.HeaderContains("Message-Id", messageId);
            var uids = await inbox.SearchAsync(query);

            if (uids.Count > 0)
            {
                if (isRead)
                {
                    await inbox.AddFlagsAsync(uids[0], MessageFlags.Seen, true);
                }
                else
                {
                    await inbox.RemoveFlagsAsync(uids[0], MessageFlags.Seen, true);
                }
                
                await client.DisconnectAsync(true);
                return true;
            }

            await client.DisconnectAsync(true);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark email as read for account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async Task<bool> DeleteEmailAsync(EmailAccount account, string messageId)
    {
        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash);

            var inbox = await client.GetFolderAsync("INBOX");
            await inbox.OpenAsync(FolderAccess.ReadWrite);

            var query = SearchQuery.HeaderContains("Message-Id", messageId);
            var uids = await inbox.SearchAsync(query);

            if (uids.Count > 0)
            {
                await inbox.AddFlagsAsync(uids[0], MessageFlags.Deleted, true);
                await inbox.ExpungeAsync();
                
                await client.DisconnectAsync(true);
                return true;
            }

            await client.DisconnectAsync(true);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete email for account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async Task<IEnumerable<string>> GetFoldersAsync(EmailAccount account)
    {
        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash);

            var folders = await client.GetFoldersAsync(client.PersonalNamespaces[0]);
            var folderNames = folders.Select(f => f.Name).ToList();

            await client.DisconnectAsync(true);
            return folderNames;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve folders for account {EmailAddress}", account.EmailAddress);
            return new[] { "INBOX" };
        }
    }

    public async Task<byte[]?> GetAttachmentAsync(EmailAccount account, string messageId, string attachmentId)
    {
        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash);

            var inbox = await client.GetFolderAsync("INBOX");
            await inbox.OpenAsync(FolderAccess.ReadOnly);

            var query = SearchQuery.HeaderContains("Message-Id", messageId);
            var uids = await inbox.SearchAsync(query);

            if (uids.Count > 0)
            {
                var message = await inbox.GetMessageAsync(uids[0]);
                
                foreach (var attachment in message.Attachments.OfType<MimePart>())
                {
                    if (attachment.ContentId == attachmentId || attachment.FileName == attachmentId)
                    {
                        using var stream = new MemoryStream();
                        await attachment.Content.DecodeToAsync(stream);
                        await client.DisconnectAsync(true);
                        return stream.ToArray();
                    }
                }
            }

            await client.DisconnectAsync(true);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve attachment {AttachmentId} for email {MessageId}", 
                attachmentId, messageId);
            return null;
        }
    }

    public async System.Threading.Tasks.Task SyncEmailsAsync(EmailAccount account)
    {
        try
        {
            _logger.LogInformation("Starting email sync for account {EmailAddress}", account.EmailAddress);
            
            using var client = new ImapClient();
            await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
            await client.AuthenticateAsync(account.Username, account.PasswordHash);

            // Sync common folders
            var folders = new[] { "INBOX", "Sent", "Drafts" };
            
            foreach (var folderName in folders)
            {
                await SyncFolderAsync(client, account, folderName);
            }

            await client.DisconnectAsync(true);
            _logger.LogInformation("Completed email sync for account {EmailAddress}", account.EmailAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync emails for account {EmailAddress}", account.EmailAddress);
        }
    }

    private Task<POSTA.Core.Entities.EmailMessage?> ConvertToEmailMessageAsync(MimeMessage mimeMessage, Guid accountId, string folderName, string serverMessageId)
    {
        try
        {
            var emailMessage = new POSTA.Core.Entities.EmailMessage
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                ServerMessageId = serverMessageId,
                MessageId = mimeMessage.MessageId,
                ThreadId = mimeMessage.InReplyTo,
                InReplyTo = mimeMessage.InReplyTo,
                References = string.Join(", ", mimeMessage.References),
                Subject = mimeMessage.Subject ?? "",
                FromAddress = mimeMessage.From.OfType<MailboxAddress>().FirstOrDefault()?.Address ?? "",
                FromName = mimeMessage.From.OfType<MailboxAddress>().FirstOrDefault()?.Name,
                ReceivedAt = mimeMessage.Date.DateTime,
                SentAt = mimeMessage.Date.DateTime,
                IsRead = false, // IMAP flags would need to be checked separately
                HasAttachments = mimeMessage.Attachments.Any(),
                FolderName = folderName,
                Priority = mimeMessage.Priority.ToString().ToLower(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Extract body
            if (!string.IsNullOrEmpty(mimeMessage.TextBody))
            {
                emailMessage.TextBody = mimeMessage.TextBody;
            }
            if (!string.IsNullOrEmpty(mimeMessage.HtmlBody))
            {
                emailMessage.HtmlBody = mimeMessage.HtmlBody;
            }

            // Convert recipients to JSON
            if (mimeMessage.To.Count > 0)
            {
                emailMessage.ToAddresses = JsonSerializer.Serialize(
                    mimeMessage.To.OfType<MailboxAddress>().Select(r => r.Address).ToArray());
            }

            if (mimeMessage.Cc.Count > 0)
            {
                emailMessage.CcAddresses = JsonSerializer.Serialize(
                    mimeMessage.Cc.OfType<MailboxAddress>().Select(r => r.Address).ToArray());
            }

            if (mimeMessage.Bcc.Count > 0)
            {
                emailMessage.BccAddresses = JsonSerializer.Serialize(
                    mimeMessage.Bcc.OfType<MailboxAddress>().Select(r => r.Address).ToArray());
            }

            if (mimeMessage.ReplyTo.Count > 0)
            {
                emailMessage.ReplyToAddresses = JsonSerializer.Serialize(
                    mimeMessage.ReplyTo.OfType<MailboxAddress>().Select(r => r.Address).ToArray());
            }

            return Task.FromResult<POSTA.Core.Entities.EmailMessage?>(emailMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to convert MIME message to EmailMessage");
            return Task.FromResult<POSTA.Core.Entities.EmailMessage?>(null);
        }
    }

    private async System.Threading.Tasks.Task SyncFolderAsync(ImapClient client, EmailAccount account, string folderName)
    {
        try
        {
            var folder = await client.GetFolderAsync(folderName);
            await folder.OpenAsync(FolderAccess.ReadOnly);

            // Get recent emails (last 100)
            var uids = await folder.SearchAsync(SearchQuery.All);
            var recentUids = uids.OrderByDescending(u => u.Id).Take(100);

            foreach (var uid in recentUids)
            {
                try
                {
                    // Check if email already exists
                    var existingEmail = await _context.EmailMessages
                        .FirstOrDefaultAsync(e => e.ServerMessageId == uid.ToString() && e.AccountId == account.Id);

                    if (existingEmail == null)
                    {
                        var message = await folder.GetMessageAsync(uid);
                        var emailMessage = await ConvertToEmailMessageAsync(message, account.Id, folderName, uid.ToString());
                        
                        if (emailMessage != null)
                        {
                            _context.EmailMessages.Add(emailMessage);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to sync message {UID} from folder {FolderName}", uid, folderName);
                }
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync folder {FolderName} for account {EmailAddress}", 
                folderName, account.EmailAddress);
        }
    }
}