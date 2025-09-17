using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POSTA.Infrastructure.Data;
using POSTA.Infrastructure.Email.Services;
using POSTA.Core.Entities;
using POSTA.Core.Interfaces;

namespace POSTA.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication for all test endpoints
public class EmailTestController : ControllerBase
{
    private readonly POSTADbContext _context;
    private readonly EwsEmailService _ewsService;
    private readonly ImapEmailService _imapService;
    private readonly IEmailSyncService _syncService;
    private readonly ILogger<EmailTestController> _logger;

    public EmailTestController(
        POSTADbContext context,
        EwsEmailService ewsService,
        ImapEmailService imapService,
        IEmailSyncService syncService,
        ILogger<EmailTestController> logger)
    {
        _context = context;
        _ewsService = ewsService;
        _imapService = imapService;
        _syncService = syncService;
        _logger = logger;
    }

    [HttpGet("health")]
    [AllowAnonymous] // Allow anonymous access for health checks
    public async Task<IActionResult> Health()
    {
        bool databaseConnected;
        try
        {
            // Test actual database connectivity
            databaseConnected = await _context.Database.CanConnectAsync();
        }
        catch
        {
            databaseConnected = false;
        }
        
        return Ok(new
        {
            Status = databaseConnected ? "OK" : "Database Unavailable",
            Timestamp = DateTime.UtcNow,
            Service = "Email Test API",
            ExchangeCredentialsConfigured = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("EXCHANGE_USERNAME")),
            DatabaseConnected = databaseConnected
        });
    }

    [HttpPost("test-exchange")]
    public async Task<IActionResult> TestExchange([FromBody] TestExchangeRequest request)
    {
        // Only allow test endpoints in development environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (!string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(); // Return 404 in production to hide endpoint existence
        }
        try
        {
            var testAccount = new EmailAccount
            {
                Id = Guid.NewGuid(),
                AccountName = "Test Exchange Account",
                EmailAddress = request.EmailAddress ?? Environment.GetEnvironmentVariable("EXCHANGE_USERNAME") ?? "test@example.com",
                ServerType = "exchange",
                ServerHost = Environment.GetEnvironmentVariable("EXCHANGE_SERVER_URL") ?? "https://outlook.office365.com/EWS/Exchange.asmx",
                Username = request.Username ?? Environment.GetEnvironmentVariable("EXCHANGE_USERNAME") ?? "",
                PasswordHash = request.Password ?? Environment.GetEnvironmentVariable("EXCHANGE_PASSWORD") ?? "", // Note: In production, this should be encrypted
                UseSsl = true,
                IsActive = true
            };

            // Never log credentials or sensitive information
            _logger.LogInformation("Testing Exchange connection for {EmailAddress}", testAccount.EmailAddress);

            var connectionResult = await _ewsService.TestConnectionAsync(testAccount);
            
            var result = new
            {
                Success = connectionResult,
                Message = connectionResult ? "Exchange connection successful" : "Exchange connection failed",
                Account = new
                {
                    testAccount.EmailAddress,
                    testAccount.ServerType,
                    ServerUrl = testAccount.ServerHost,
                    testAccount.UseSsl
                },
                Timestamp = DateTime.UtcNow
            };

            if (connectionResult)
            {
                // Try to get folders and recent emails
                try
                {
                    var folders = await _ewsService.GetFoldersAsync(testAccount);
                    var recentEmails = await _ewsService.GetEmailsAsync(testAccount, "INBOX", 5);
                    
                    return Ok(new
                    {
                        result.Success,
                        result.Message,
                        result.Account,
                        result.Timestamp,
                        Folders = folders.Take(10).ToArray(),
                        RecentEmailsCount = recentEmails.Count(),
                        RecentEmails = recentEmails.Take(3).Select(e => new
                        {
                            e.Subject,
                            e.FromAddress,
                            e.FromName,
                            e.ReceivedAt,
                            e.IsRead,
                            e.HasAttachments
                        }).ToArray()
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Connected to Exchange but failed to fetch additional data");
                    return Ok(new
                    {
                        result.Success,
                        Message = "Exchange connection successful, but failed to fetch additional data: " + ex.Message,
                        result.Account,
                        result.Timestamp
                    });
                }
            }

            return StatusCode(connectionResult ? 200 : 500, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing Exchange connection");
            return StatusCode(500, new
            {
                Success = false,
                Message = "Exchange connection test failed: " + ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpPost("test-imap")]
    public async Task<IActionResult> TestImap([FromBody] TestImapRequest request)
    {
        // Only allow test endpoints in development environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (!string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(); // Return 404 in production to hide endpoint existence
        }
        try
        {
            var testAccount = new EmailAccount
            {
                Id = Guid.NewGuid(),
                AccountName = "Test IMAP Account",
                EmailAddress = request.EmailAddress,
                ServerType = "imap",
                ServerHost = request.ImapServer,
                ServerPort = request.ImapPort,
                Username = request.Username,
                PasswordHash = request.Password, // Note: In production, this should be encrypted
                UseSsl = request.UseSsl,
                SmtpHost = request.SmtpServer,
                SmtpPort = request.SmtpPort,
                IsActive = true
            };

            // Never log credentials or sensitive information
            _logger.LogInformation("Testing IMAP connection for {EmailAddress}", testAccount.EmailAddress);

            var connectionResult = await _imapService.TestConnectionAsync(testAccount);
            
            var result = new
            {
                Success = connectionResult,
                Message = connectionResult ? "IMAP connection successful" : "IMAP connection failed",
                Account = new
                {
                    testAccount.EmailAddress,
                    testAccount.ServerType,
                    testAccount.ServerHost,
                    testAccount.ServerPort,
                    testAccount.UseSsl
                },
                Timestamp = DateTime.UtcNow
            };

            if (connectionResult)
            {
                // Try to get folders and recent emails
                try
                {
                    var folders = await _imapService.GetFoldersAsync(testAccount);
                    var recentEmails = await _imapService.GetEmailsAsync(testAccount, "INBOX", 5);
                    
                    return Ok(new
                    {
                        result.Success,
                        result.Message,
                        result.Account,
                        result.Timestamp,
                        Folders = folders.Take(10).ToArray(),
                        RecentEmailsCount = recentEmails.Count(),
                        RecentEmails = recentEmails.Take(3).Select(e => new
                        {
                            e.Subject,
                            e.FromAddress,
                            e.FromName,
                            e.ReceivedAt,
                            e.IsRead,
                            e.HasAttachments
                        }).ToArray()
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Connected to IMAP but failed to fetch additional data");
                    return Ok(new
                    {
                        result.Success,
                        Message = "IMAP connection successful, but failed to fetch additional data: " + ex.Message,
                        result.Account,
                        result.Timestamp
                    });
                }
            }

            return StatusCode(connectionResult ? 200 : 500, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing IMAP connection");
            return StatusCode(500, new
            {
                Success = false,
                Message = "IMAP connection test failed: " + ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpPost("sync-account/{accountId}")]
    [Authorize]
    public async Task<IActionResult> SyncAccount(Guid accountId)
    {
        try
        {
            var account = await _context.EmailAccounts
                .FirstOrDefaultAsync(a => a.Id == accountId && a.IsActive);

            if (account == null)
            {
                return NotFound(new { Message = "Account not found or inactive" });
            }

            var isCurrentlySyncing = await _syncService.IsAccountSyncingAsync(accountId);
            if (isCurrentlySyncing)
            {
                return Conflict(new { Message = "Account is already syncing" });
            }

            // Start sync in background
            _ = Task.Run(async () => await _syncService.SyncAccountAsync(accountId));

            return Ok(new
            {
                Message = "Email sync started",
                AccountId = accountId,
                AccountEmail = account.EmailAddress,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting sync for account {AccountId}", accountId);
            return StatusCode(500, new { Message = "Failed to start email sync: " + ex.Message });
        }
    }

    [HttpGet("sync-status/{accountId}")]
    [Authorize]
    public async Task<IActionResult> GetSyncStatus(Guid accountId)
    {
        try
        {
            var account = await _context.EmailAccounts
                .FirstOrDefaultAsync(a => a.Id == accountId);

            if (account == null)
            {
                return NotFound(new { Message = "Account not found" });
            }

            var isCurrentlySyncing = await _syncService.IsAccountSyncingAsync(accountId);
            
            return Ok(new
            {
                AccountId = accountId,
                AccountEmail = account.EmailAddress,
                IsCurrentlySyncing = isCurrentlySyncing,
                LastSyncAt = account.LastSyncAt,
                IsActive = account.IsActive,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sync status for account {AccountId}", accountId);
            return StatusCode(500, new { Message = "Failed to get sync status: " + ex.Message });
        }
    }
}

public class TestExchangeRequest
{
    public string? EmailAddress { get; set; }
    public string? Username { get; set; }
    
    // WARNING: Passwords should be sent via secure channels and never logged
    // In production, consider using secure credential storage instead
    public string? Password { get; set; }
}

public class TestImapRequest
{
    public string EmailAddress { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    
    // WARNING: Passwords should be sent via secure channels and never logged
    // In production, consider using secure credential storage instead
    public string Password { get; set; } = string.Empty;
    public string ImapServer { get; set; } = string.Empty;
    public int ImapPort { get; set; } = 993;
    public string? SmtpServer { get; set; }
    public int? SmtpPort { get; set; } = 587;
    public bool UseSsl { get; set; } = true;
}