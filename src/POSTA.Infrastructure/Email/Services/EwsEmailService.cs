using Microsoft.Exchange.WebServices.Data;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using POSTA.Core.Entities;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Data;
using System.Net;
using System.Text.Json;

namespace POSTA.Infrastructure.Email.Services;

public class EwsEmailService : IEmailProtocolService
{
    private readonly POSTADbContext _context;
    private readonly ILogger<EwsEmailService> _logger;

    public EwsEmailService(POSTADbContext context, ILogger<EwsEmailService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<bool> TestConnectionAsync(EmailAccount account)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            // Test connection by trying to access the inbox
            var inbox = await Folder.Bind(service, WellKnownFolderName.Inbox);
            
            _logger.LogInformation("Successfully connected to Exchange server for account {EmailAddress}", account.EmailAddress);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to Exchange server for account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async System.Threading.Tasks.Task<IEnumerable<POSTA.Core.Entities.EmailMessage>> GetEmailsAsync(EmailAccount account, string folderName = "INBOX", int limit = 50)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            // Find the folder
            FolderId folderId = folderName.ToUpper() switch
            {
                "INBOX" => new FolderId(WellKnownFolderName.Inbox),
                "SENT" => new FolderId(WellKnownFolderName.SentItems),
                "DRAFTS" => new FolderId(WellKnownFolderName.Drafts),
                "TRASH" => new FolderId(WellKnownFolderName.DeletedItems),
                _ => new FolderId(WellKnownFolderName.Inbox)
            };

            var folder = await Folder.Bind(service, folderId);
            
            // Create view for retrieving emails
            var itemView = new ItemView(limit)
            {
                OrderBy = { { ItemSchema.DateTimeReceived, SortDirection.Descending } }
            };

            // Define properties to load
            var propertySet = new PropertySet(BasePropertySet.FirstClassProperties)
            {
                EmailMessageSchema.InternetMessageId,
                EmailMessageSchema.References,
                EmailMessageSchema.InReplyTo,
                EmailMessageSchema.ConversationId
            };
            itemView.PropertySet = propertySet;

            // Find items
            var findResults = await service.FindItems(folderId, itemView);
            
            var emails = new List<POSTA.Core.Entities.EmailMessage>();
            
            foreach (var item in findResults.Items.OfType<Microsoft.Exchange.WebServices.Data.EmailMessage>())
            {
                var emailMessage = await ConvertToEmailMessageAsync(item, account.Id);
                if (emailMessage != null)
                {
                    emails.Add(emailMessage);
                }
            }

            return emails;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve emails from folder {FolderName} for account {EmailAddress}", 
                folderName, account.EmailAddress);
            return new List<POSTA.Core.Entities.EmailMessage>();
        }
    }

    public async System.Threading.Tasks.Task<POSTA.Core.Entities.EmailMessage?> GetEmailByIdAsync(EmailAccount account, string messageId)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            // Try to find the email by server message ID
            var searchFilter = new SearchFilter.IsEqualTo(EmailMessageSchema.InternetMessageId, messageId);
            var itemView = new ItemView(1);
            
            var findResults = await service.FindItems(WellKnownFolderName.Inbox, searchFilter, itemView);
            
            if (findResults.Items.Count == 0)
            {
                // Try other folders
                var folders = new[] { WellKnownFolderName.SentItems, WellKnownFolderName.Drafts, WellKnownFolderName.DeletedItems };
                foreach (var folder in folders)
                {
                    findResults = await service.FindItems(folder, searchFilter, itemView);
                    if (findResults.Items.Count > 0) break;
                }
            }

            if (findResults.Items.Count > 0 && findResults.Items[0] is Microsoft.Exchange.WebServices.Data.EmailMessage ewsMessage)
            {
                await ewsMessage.Load(new PropertySet(BasePropertySet.FirstClassProperties));
                return await ConvertToEmailMessageAsync(ewsMessage, account.Id);
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve email by ID {MessageId} for account {EmailAddress}", 
                messageId, account.EmailAddress);
            return null;
        }
    }

    public async System.Threading.Tasks.Task<bool> SendEmailAsync(EmailAccount account, EmailDraft draft)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            var emailMessage = new Microsoft.Exchange.WebServices.Data.EmailMessage(service)
            {
                Subject = draft.Subject ?? "",
                Body = new MessageBody(!string.IsNullOrEmpty(draft.HtmlBody) ? BodyType.HTML : BodyType.Text, draft.HtmlBody ?? draft.TextBody ?? "")
            };

            // Add recipients
            if (!string.IsNullOrEmpty(draft.ToAddresses))
            {
                var toAddresses = JsonSerializer.Deserialize<string[]>(draft.ToAddresses);
                if (toAddresses != null)
                {
                    foreach (var address in toAddresses)
                    {
                        emailMessage.ToRecipients.Add(address);
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
                        emailMessage.CcRecipients.Add(address);
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
                        emailMessage.BccRecipients.Add(address);
                    }
                }
            }

            // Handle reply/forward
            if (!string.IsNullOrEmpty(draft.InReplyTo))
            {
                emailMessage.InReplyTo = draft.InReplyTo;
            }

            // Send the email
            await emailMessage.SendAndSaveCopy();
            
            _logger.LogInformation("Successfully sent email from account {EmailAddress}", account.EmailAddress);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email from account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async System.Threading.Tasks.Task<bool> MarkAsReadAsync(EmailAccount account, string messageId, bool isRead)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            // Find the email across all folders
            var searchFilter = new SearchFilter.IsEqualTo(EmailMessageSchema.InternetMessageId, messageId);
            var itemView = new ItemView(1);
            
            // Search in multiple folders
            var foldersToSearch = new[] 
            {
                WellKnownFolderName.Inbox,
                WellKnownFolderName.SentItems,
                WellKnownFolderName.Drafts,
                WellKnownFolderName.DeletedItems
            };
            
            foreach (var folder in foldersToSearch)
            {
                var findResults = await service.FindItems(folder, searchFilter, itemView);
                
                if (findResults.Items.Count > 0 && findResults.Items[0] is Microsoft.Exchange.WebServices.Data.EmailMessage emailMessage)
                {
                    emailMessage.IsRead = isRead;
                    await emailMessage.Update(ConflictResolutionMode.AutoResolve);
                    _logger.LogInformation("Successfully marked email as {ReadStatus} in folder {FolderName} for account {EmailAddress}", 
                        isRead ? "read" : "unread", folder, account.EmailAddress);
                    return true;
                }
            }

            _logger.LogWarning("Email with MessageId {MessageId} not found in any folder for account {EmailAddress}", 
                messageId, account.EmailAddress);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark email as read for account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async System.Threading.Tasks.Task<bool> DeleteEmailAsync(EmailAccount account, string messageId)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            // Find the email across all folders
            var searchFilter = new SearchFilter.IsEqualTo(EmailMessageSchema.InternetMessageId, messageId);
            var itemView = new ItemView(1);
            
            // Search in multiple folders (excluding already deleted items)
            var foldersToSearch = new[] 
            {
                WellKnownFolderName.Inbox,
                WellKnownFolderName.SentItems,
                WellKnownFolderName.Drafts
            };
            
            foreach (var folder in foldersToSearch)
            {
                var findResults = await service.FindItems(folder, searchFilter, itemView);
                
                if (findResults.Items.Count > 0)
                {
                    await findResults.Items[0].Delete(DeleteMode.MoveToDeletedItems);
                    _logger.LogInformation("Successfully deleted email from folder {FolderName} for account {EmailAddress}", 
                        folder, account.EmailAddress);
                    return true;
                }
            }
            
            // Also check if the email is already in deleted items and permanently delete it
            var deletedItemsResults = await service.FindItems(WellKnownFolderName.DeletedItems, searchFilter, itemView);
            if (deletedItemsResults.Items.Count > 0)
            {
                await deletedItemsResults.Items[0].Delete(DeleteMode.HardDelete);
                _logger.LogInformation("Permanently deleted email from Deleted Items for account {EmailAddress}", account.EmailAddress);
                return true;
            }

            _logger.LogWarning("Email with MessageId {MessageId} not found in any folder for account {EmailAddress}", 
                messageId, account.EmailAddress);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete email for account {EmailAddress}", account.EmailAddress);
            return false;
        }
    }

    public async System.Threading.Tasks.Task<IEnumerable<string>> GetFoldersAsync(EmailAccount account)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            var folderView = new FolderView(100);
            var findResults = await service.FindFolders(WellKnownFolderName.MsgFolderRoot, folderView);
            
            var folders = findResults.Folders.Select(f => f.DisplayName).ToList();
            
            // Add well-known folders
            folders.AddRange(new[] { "INBOX", "Sent Items", "Drafts", "Deleted Items" });
            
            return folders.Distinct();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve folders for account {EmailAddress}", account.EmailAddress);
            return new[] { "INBOX" };
        }
    }

    public async System.Threading.Tasks.Task<byte[]?> GetAttachmentAsync(EmailAccount account, string messageId, string attachmentId)
    {
        try
        {
            var service = await CreateExchangeServiceAsync(account);
            
            // Search for the message across all folders (consistent with other operations)
            var searchFilter = new SearchFilter.IsEqualTo(EmailMessageSchema.InternetMessageId, messageId);
            var itemView = new ItemView(1);
            
            // Search in multiple folders like other operations do
            var foldersToSearch = new[] 
            {
                WellKnownFolderName.Inbox,
                WellKnownFolderName.SentItems,
                WellKnownFolderName.Drafts,
                WellKnownFolderName.DeletedItems
            };
            
            foreach (var folder in foldersToSearch)
            {
                var findResults = await service.FindItems(folder, searchFilter, itemView);
                
                if (findResults.Items.Count > 0 && findResults.Items[0] is Microsoft.Exchange.WebServices.Data.EmailMessage ewsMessage)
                {
                    await ewsMessage.Load(new PropertySet(BasePropertySet.FirstClassProperties));
                    
                    foreach (var attachment in ewsMessage.Attachments.OfType<FileAttachment>())
                    {
                        if (attachment.Id == attachmentId)
                        {
                            await attachment.Load();
                            _logger.LogInformation("Successfully retrieved attachment {AttachmentId} from folder {FolderName} for account {EmailAddress}", 
                                attachmentId, folder, account.EmailAddress);
                            return attachment.Content;
                        }
                    }
                }
            }

            _logger.LogWarning("Attachment {AttachmentId} not found for email {MessageId} in any folder for account {EmailAddress}", 
                attachmentId, messageId, account.EmailAddress);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve attachment {AttachmentId} for email {MessageId} for account {EmailAddress}", 
                attachmentId, messageId, account.EmailAddress);
            return null;
        }
    }

    public async System.Threading.Tasks.Task SyncEmailsAsync(EmailAccount account)
    {
        try
        {
            _logger.LogInformation("Starting email sync for account {EmailAddress}", account.EmailAddress);
            
            var service = await CreateExchangeServiceAsync(account);
            
            // Sync emails from different folders
            var folders = new Dictionary<string, WellKnownFolderName>
            {
                { "INBOX", WellKnownFolderName.Inbox },
                { "Sent Items", WellKnownFolderName.SentItems },
                { "Drafts", WellKnownFolderName.Drafts }
            };

            foreach (var folderPair in folders)
            {
                await SyncFolderAsync(service, account, folderPair.Key, folderPair.Value);
            }
            
            _logger.LogInformation("Completed email sync for account {EmailAddress}", account.EmailAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync emails for account {EmailAddress}", account.EmailAddress);
        }
    }

    private System.Threading.Tasks.Task<ExchangeService> CreateExchangeServiceAsync(EmailAccount account)
    {
        // Use environment variables for Exchange credentials if available
        var exchangeUsername = Environment.GetEnvironmentVariable("EXCHANGE_USERNAME");
        var exchangePassword = Environment.GetEnvironmentVariable("EXCHANGE_PASSWORD");
        var exchangeServerUrl = Environment.GetEnvironmentVariable("EXCHANGE_SERVER_URL");

        // Get Exchange server URL with proper validation first
        var validatedUrl = ValidateAndGetExchangeUrl(exchangeServerUrl, account.ServerHost);
        
        var service = new ExchangeService(ExchangeVersion.Exchange2016)
        {
            Url = validatedUrl
        };

        if (!string.IsNullOrEmpty(exchangeUsername) && !string.IsNullOrEmpty(exchangePassword))
        {
            service.Credentials = new WebCredentials(exchangeUsername, exchangePassword);
        }
        else
        {
            // Fall back to account-specific credentials
            service.Credentials = new WebCredentials(account.Username, account.PasswordHash); // Note: This should be decrypted in production
        }

        // Configure SSL validation - secure implementation
        service.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
        {
            // Allow bypassing SSL validation only in development mode and if explicitly configured
            var bypassSslValidation = Environment.GetEnvironmentVariable("BYPASS_SSL_VALIDATION");
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.Equals("Development", StringComparison.OrdinalIgnoreCase) == true;
            
            if (isDevelopment && bypassSslValidation?.Equals("true", StringComparison.OrdinalIgnoreCase) == true)
            {
                _logger.LogWarning("SSL certificate validation bypassed for development mode for account {EmailAddress}", account.EmailAddress);
                return true;
            }
            
            // In production or when not explicitly bypassed, require valid certificates
            if (sslPolicyErrors == System.Net.Security.SslPolicyErrors.None)
                return true;
                
            _logger.LogError("SSL certificate validation failed for account {EmailAddress}: {SslPolicyErrors}", 
                account.EmailAddress, sslPolicyErrors);
            return false;
        };

        return System.Threading.Tasks.Task.FromResult(service);
    }

    private static bool RedirectionUrlValidationCallback(string redirectionUrl)
    {
        // Validate that the redirection URL is HTTPS
        return redirectionUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
    }

    private Uri ValidateAndGetExchangeUrl(string? environmentUrl, string? accountUrl)
    {
        // Default fallback URL for Exchange Online
        const string defaultExchangeUrl = "https://outlook.office365.com/EWS/Exchange.asmx";

        // Try environment URL first
        if (!string.IsNullOrEmpty(environmentUrl))
        {
            if (Uri.TryCreate(environmentUrl, UriKind.Absolute, out var envUri) && IsValidExchangeUrl(envUri))
            {
                return envUri;
            }
            else
            {
                _logger.LogWarning("Invalid EXCHANGE_SERVER_URL environment variable: {Url}. Using default.", environmentUrl);
            }
        }

        // Try account-specific URL
        if (!string.IsNullOrEmpty(accountUrl))
        {
            if (Uri.TryCreate(accountUrl, UriKind.Absolute, out var accountUri) && IsValidExchangeUrl(accountUri))
            {
                return accountUri;
            }
            else
            {
                _logger.LogWarning("Invalid account server host: {Url}. Using default.", accountUrl);
            }
        }

        // Return default URL
        return new Uri(defaultExchangeUrl);
    }

    private static bool IsValidExchangeUrl(Uri uri)
    {
        // Must be HTTPS
        if (!string.Equals(uri.Scheme, "https", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        // Must have a valid host
        if (string.IsNullOrEmpty(uri.Host))
        {
            return false;
        }

        // Reject obvious security issues
        if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
            uri.Host.StartsWith("127.", StringComparison.Ordinal) ||
            uri.Host.StartsWith("192.168.", StringComparison.Ordinal) ||
            uri.Host.StartsWith("10.", StringComparison.Ordinal))
        {
            return false;
        }

        return true;
    }

    private async System.Threading.Tasks.Task<POSTA.Core.Entities.EmailMessage?> ConvertToEmailMessageAsync(Microsoft.Exchange.WebServices.Data.EmailMessage ewsMessage, Guid accountId)
    {
        try
        {
            await ewsMessage.Load(new PropertySet(BasePropertySet.FirstClassProperties));

            var emailMessage = new POSTA.Core.Entities.EmailMessage
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                ServerMessageId = ewsMessage.InternetMessageId ?? ewsMessage.Id?.UniqueId ?? Guid.NewGuid().ToString(),
                MessageId = ewsMessage.InternetMessageId,
                ThreadId = ewsMessage.ConversationId?.UniqueId,
                InReplyTo = ewsMessage.InReplyTo,
                References = ewsMessage.References,
                Subject = ewsMessage.Subject ?? "",
                FromAddress = ewsMessage.From?.Address ?? "",
                FromName = ewsMessage.From?.Name,
                TextBody = ewsMessage.Body?.BodyType == BodyType.Text ? ewsMessage.Body.Text : null,
                HtmlBody = ewsMessage.Body?.BodyType == BodyType.HTML ? ewsMessage.Body.Text : null,
                ReceivedAt = ewsMessage.DateTimeReceived,
                SentAt = ewsMessage.DateTimeSent,
                IsRead = ewsMessage.IsRead,
                IsFlagged = ewsMessage.Flag?.FlagStatus == ItemFlagStatus.Flagged,
                HasAttachments = ewsMessage.HasAttachments,
                Priority = ewsMessage.Importance.ToString().ToLower(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Convert recipients to JSON
            if (ewsMessage.ToRecipients.Count > 0)
            {
                emailMessage.ToAddresses = JsonSerializer.Serialize(
                    ewsMessage.ToRecipients.Select(r => r.Address).ToArray());
            }

            if (ewsMessage.CcRecipients.Count > 0)
            {
                emailMessage.CcAddresses = JsonSerializer.Serialize(
                    ewsMessage.CcRecipients.Select(r => r.Address).ToArray());
            }

            if (ewsMessage.BccRecipients.Count > 0)
            {
                emailMessage.BccAddresses = JsonSerializer.Serialize(
                    ewsMessage.BccRecipients.Select(r => r.Address).ToArray());
            }

            return emailMessage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to convert EWS message to EmailMessage");
            return null;
        }
    }

    private async System.Threading.Tasks.Task SyncFolderAsync(ExchangeService service, EmailAccount account, string folderName, WellKnownFolderName wellKnownFolder)
    {
        try
        {
            var emails = await GetEmailsAsync(account, folderName, 100);
            
            foreach (var email in emails)
            {
                // Check if email already exists in database
                var existingEmail = await _context.EmailMessages
                    .FirstOrDefaultAsync(e => e.ServerMessageId == email.ServerMessageId && e.AccountId == account.Id);

                if (existingEmail == null)
                {
                    // Add new email
                    email.FolderName = folderName;
                    _context.EmailMessages.Add(email);
                }
                else
                {
                    // Update existing email
                    existingEmail.IsRead = email.IsRead;
                    existingEmail.IsFlagged = email.IsFlagged;
                    existingEmail.UpdatedAt = DateTime.UtcNow;
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