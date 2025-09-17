using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using POSTA.Core.Entities;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Data;
using System.Collections.Concurrent;

namespace POSTA.Infrastructure.Email.Services;

public class EmailSyncService : IEmailSyncService
{
    private readonly POSTADbContext _context;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailSyncService> _logger;
    private readonly ConcurrentDictionary<Guid, bool> _syncingAccounts = new();
    private readonly SemaphoreSlim _syncSemaphore = new(5); // Max 5 concurrent syncs

    public EmailSyncService(
        POSTADbContext context,
        IServiceProvider serviceProvider,
        ILogger<EmailSyncService> logger)
    {
        _context = context;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task<bool> IsAccountSyncingAsync(Guid accountId)
    {
        return Task.FromResult(_syncingAccounts.ContainsKey(accountId));
    }

    public async Task SyncAccountAsync(Guid accountId)
    {
        if (_syncingAccounts.TryAdd(accountId, true))
        {
            await _syncSemaphore.WaitAsync();
            
            try
            {
                await PerformAccountSyncAsync(accountId);
            }
            finally
            {
                _syncingAccounts.TryRemove(accountId, out _);
                _syncSemaphore.Release();
            }
        }
        else
        {
            _logger.LogInformation("Account {AccountId} is already syncing, skipping", accountId);
        }
    }

    public async Task SyncAllAccountsAsync()
    {
        try
        {
            var activeAccounts = await _context.EmailAccounts
                .Where(a => a.IsActive)
                .Select(a => a.Id)
                .ToListAsync();

            _logger.LogInformation("Starting sync for {Count} active accounts", activeAccounts.Count);

            var syncTasks = activeAccounts.Select(accountId => SyncAccountAsync(accountId));
            await Task.WhenAll(syncTasks);

            _logger.LogInformation("Completed sync for all active accounts");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync all accounts");
        }
    }

    private async Task PerformAccountSyncAsync(Guid accountId)
    {
        try
        {
            var account = await _context.EmailAccounts
                .FirstOrDefaultAsync(a => a.Id == accountId && a.IsActive);

            if (account == null)
            {
                _logger.LogWarning("Account {AccountId} not found or inactive", accountId);
                return;
            }

            _logger.LogInformation("Starting email sync for account {EmailAddress}", account.EmailAddress);

            var emailService = GetEmailService(account);
            if (emailService == null)
            {
                _logger.LogError("No email service available for account type {ServerType}", account.ServerType);
                return;
            }

            // Test connection first
            var connectionResult = await emailService.TestConnectionAsync(account);
            if (!connectionResult)
            {
                _logger.LogError("Failed to connect to email server for account {EmailAddress}", account.EmailAddress);
                return;
            }

            // Perform the sync
            await emailService.SyncEmailsAsync(account);

            // Update last sync time
            account.LastSyncAt = DateTime.UtcNow;
            account.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully completed email sync for account {EmailAddress}", account.EmailAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync account {AccountId}", accountId);
        }
    }

    private IEmailProtocolService? GetEmailService(EmailAccount account)
    {
        return account.ServerType.ToLower() switch
        {
            "exchange" => _serviceProvider.GetService<EwsEmailService>(),
            "imap" => _serviceProvider.GetService<ImapEmailService>(),
            _ => null
        };
    }

    public void Dispose()
    {
        _syncSemaphore?.Dispose();
    }
}

public class EmailSyncBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailSyncBackgroundService> _logger;

    public EmailSyncBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<EmailSyncBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email sync background service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var syncService = scope.ServiceProvider.GetRequiredService<IEmailSyncService>();
                
                await syncService.SyncAllAccountsAsync();
                
                // Wait for 5 minutes before next sync
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when stopping
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in email sync background service");
                // Wait before retrying
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        _logger.LogInformation("Email sync background service stopped");
    }
}