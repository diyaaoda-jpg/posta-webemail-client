using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using POSTA.Infrastructure.Data;
using POSTA.Core.Entities;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Email.Services;

namespace POSTA.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly POSTADbContext _context;
    private readonly IExchangeAutodiscoverService _autodiscoverService;
    private readonly IEmailConnectionTestingService _connectionTestingService;
    private readonly EwsEmailService _ewsService;
    private readonly ImapEmailService _imapService;
    private readonly ILogger<AccountsController> _logger;

    public AccountsController(
        POSTADbContext context,
        IExchangeAutodiscoverService autodiscoverService,
        IEmailConnectionTestingService connectionTestingService,
        EwsEmailService ewsService,
        ImapEmailService imapService,
        ILogger<AccountsController> logger)
    {
        _context = context;
        _autodiscoverService = autodiscoverService;
        _connectionTestingService = connectionTestingService;
        _ewsService = ewsService;
        _imapService = imapService;
        _logger = logger;
    }

    [HttpPost("discover")]
    [AllowAnonymous]
    public async Task<IActionResult> DiscoverExchangeServer([FromBody] AutodiscoverRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.EmailAddress))
            {
                return BadRequest(new { Error = "Email address is required" });
            }

            _logger.LogInformation("Starting autodiscovery for email: {EmailAddress}", request.EmailAddress);

            var config = await _autodiscoverService.DiscoverAsync(request.EmailAddress);

            // Create a structured response regardless of success or failure
            var success = config != null && !string.IsNullOrEmpty(config.EwsUrl);
            var response = new
            {
                Success = success,
                EmailAddress = request.EmailAddress,
                Config = success && config != null ? new
                {
                    config.EwsUrl,
                    config.ServerHost,
                    config.ServerPort,
                    config.UseSsl,
                    config.DisplayName,
                    config.AutodiscoverMethod
                } : null,
                TriedUrls = config?.TriedUrls ?? new List<string>(),
                ErrorMessage = success ? null : (config?.ErrorMessage ?? "Autodiscovery failed - no Exchange server configuration found"),
                Suggestion = success ? "Exchange server configuration found and ready for authentication" :
                    (config == null 
                        ? "Try manual configuration with your server name or contact your IT administrator"
                        : "Verify your email address and try manual configuration if needed"),
                Timestamp = DateTime.UtcNow
            };

            if (response.Success)
            {
                _logger.LogInformation("Autodiscovery successful for {EmailAddress}. EWS URL: {EwsUrl}", 
                    request.EmailAddress, config?.EwsUrl);
            }
            else
            {
                _logger.LogWarning("Autodiscovery failed for {EmailAddress}. Tried {Count} URLs.", 
                    request.EmailAddress, config?.TriedUrls?.Count ?? 0);
            }

            // Always return 200 OK with structured response for proper frontend handling
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during autodiscovery for {EmailAddress}", request.EmailAddress);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error during autodiscovery",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpPost("discover/manual")]
    [AllowAnonymous]
    public async Task<IActionResult> DiscoverManualExchangeServer([FromBody] ManualDiscoverRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.EmailAddress))
            {
                return BadRequest(new { Error = "Email address is required" });
            }

            if (string.IsNullOrWhiteSpace(request.ServerInput))
            {
                return BadRequest(new { Error = "Server input is required" });
            }

            _logger.LogInformation("Starting manual discovery for email: {EmailAddress} with server: {ServerInput}", 
                request.EmailAddress, request.ServerInput);

            var config = await _autodiscoverService.DiscoverManualAsync(request.EmailAddress, request.ServerInput);

            // Create a structured response regardless of success or failure
            var success = config != null && !string.IsNullOrEmpty(config.EwsUrl);
            var response = new
            {
                Success = success,
                EmailAddress = request.EmailAddress,
                ServerInput = request.ServerInput,
                Config = success && config != null ? new
                {
                    config.EwsUrl,
                    config.ServerHost,
                    config.ServerPort,
                    config.UseSsl,
                    config.DisplayName,
                    config.AutodiscoverMethod
                } : null,
                TriedUrls = config?.TriedUrls ?? new List<string>(),
                ErrorMessage = success ? null : (config?.ErrorMessage ?? "Manual discovery failed - no Exchange server configuration found"),
                Suggestion = success ? "Exchange server configuration found and ready for authentication" :
                    (config == null
                        ? "Verify the server name is correct or try the full server URL"
                        : "Server was found but configuration is incomplete - try a different server address"),
                Timestamp = DateTime.UtcNow
            };

            if (response.Success)
            {
                _logger.LogInformation("Manual discovery successful for {EmailAddress}. EWS URL: {EwsUrl}", 
                    request.EmailAddress, config?.EwsUrl);
            }
            else
            {
                _logger.LogWarning("Manual discovery failed for {EmailAddress} with server {ServerInput}. Tried {Count} URLs.", 
                    request.EmailAddress, request.ServerInput, config?.TriedUrls?.Count ?? 0);
            }

            // Always return 200 OK with structured response for proper frontend handling
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during manual discovery for {EmailAddress} with server {ServerInput}", 
                request.EmailAddress, request.ServerInput);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error during manual discovery",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpPost("test")]
    [AllowAnonymous]
    public async Task<IActionResult> TestConnection([FromBody] TestConnectionRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.EmailAddress) || 
                string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Password) ||
                request.ServerConfig == null ||
                string.IsNullOrWhiteSpace(request.ServerConfig.EwsUrl))
            {
                return BadRequest(new { Error = "Email address, username, password, and server configuration are required" });
            }

            _logger.LogInformation("Testing connection for {EmailAddress} to {EwsUrl}", 
                request.EmailAddress, request.ServerConfig.EwsUrl);

            var connectionResult = await _autodiscoverService.TestConnectionAsync(
                request.ServerConfig, request.Username, request.Password);

            var response = new
            {
                Success = connectionResult,
                Message = connectionResult ? "Connection test successful" : "Connection test failed",
                EmailAddress = request.EmailAddress,
                Username = request.Username,
                ServerConfig = new
                {
                    request.ServerConfig.EwsUrl,
                    request.ServerConfig.ServerHost,
                    request.ServerConfig.DisplayName,
                    request.ServerConfig.AutodiscoverMethod
                },
                Timestamp = DateTime.UtcNow
            };

            if (connectionResult)
            {
                _logger.LogInformation("Connection test successful for {EmailAddress} to {EwsUrl}", 
                    request.EmailAddress, request.ServerConfig.EwsUrl);
                return Ok(response);
            }
            else
            {
                _logger.LogWarning("Connection test failed for {EmailAddress} to {EwsUrl}", 
                    request.EmailAddress, request.ServerConfig.EwsUrl);
                return BadRequest(response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing connection for {EmailAddress}", request.EmailAddress);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error during connection test",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpPost("test-connection")]
    [AllowAnonymous]
    public async Task<IActionResult> TestConnectionDetailed([FromBody] ConnectionTestRequest request)
    {
        try
        {
            _logger.LogInformation("Starting detailed connection test for {EmailAddress}", request.EmailAddress);

            var result = await _connectionTestingService.TestConnectionAsync(request);

            var response = new
            {
                Success = result.Success,
                EmailAddress = result.EmailAddress,
                TestDuration = result.TestDuration.TotalSeconds,
                TestSteps = result.TestSteps.Select(step => new
                {
                    step.Step,
                    step.Status,
                    step.Timestamp,
                    step.Details
                }),
                ServerInfo = result.ServerInfo != null ? new
                {
                    result.ServerInfo.ServerType,
                    result.ServerInfo.ServerHost,
                    result.ServerInfo.ServerPort,
                    result.ServerInfo.UseSsl,
                    result.ServerInfo.EwsUrl,
                    ConnectionTime = result.ServerInfo.ConnectionTime.TotalSeconds,
                    result.ServerInfo.InboxMessageCount
                } : null,
                ErrorMessage = result.ErrorMessage,
                Timestamp = DateTime.UtcNow
            };

            if (result.Success)
            {
                _logger.LogInformation("Detailed connection test successful for {EmailAddress}", request.EmailAddress);
                return Ok(response);
            }
            else
            {
                _logger.LogWarning("Detailed connection test failed for {EmailAddress}: {Error}", 
                    request.EmailAddress, result.ErrorMessage);
                return BadRequest(response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during detailed connection test for {EmailAddress}", request.EmailAddress);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error during connection test",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateAccount([FromBody] AccountCreationRequest request)
    {
        try
        {
            var userId = await GetOrCreateUserIdAsync(request.EmailAddress, request.DisplayName);
            if (userId == Guid.Empty)
            {
                return BadRequest(new { Error = "Failed to create or find user" });
            }

            if (string.IsNullOrWhiteSpace(request.AccountName) || 
                string.IsNullOrWhiteSpace(request.EmailAddress) || 
                string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Password) ||
                request.ServerConfig == null ||
                string.IsNullOrWhiteSpace(request.ServerConfig.EwsUrl))
            {
                return BadRequest(new { Error = "All fields including server configuration are required" });
            }

            // Check if account already exists for this user
            var existingAccount = await _context.EmailAccounts
                .FirstOrDefaultAsync(a => a.UserId == userId && a.EmailAddress == request.EmailAddress);

            if (existingAccount != null)
            {
                return Conflict(new { Error = "An account with this email address already exists" });
            }

            // Hash the password
            var passwordHash = HashPassword(request.Password);

            // Create the email account
            var account = new EmailAccount
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AccountName = request.AccountName,
                EmailAddress = request.EmailAddress,
                ServerType = "exchange",
                ServerHost = request.ServerConfig.EwsUrl,
                ServerPort = request.ServerConfig.ServerPort,
                Username = request.Username,
                PasswordHash = passwordHash,
                UseSsl = request.ServerConfig.UseSsl,
                DisplayName = request.DisplayName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.EmailAccounts.Add(account);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Email account created successfully for user {UserId}, email {EmailAddress}", 
                userId, request.EmailAddress);

            var responseAccount = new
            {
                account.Id,
                account.AccountName,
                account.EmailAddress,
                account.ServerType,
                ServerUrl = account.ServerHost,
                account.Username,
                account.DisplayName,
                account.IsActive,
                account.CreatedAt,
                ServerConfig = new
                {
                    request.ServerConfig.DisplayName,
                    request.ServerConfig.AutodiscoverMethod
                }
            };

            return Created($"/api/accounts/{account.Id}", new
            {
                Success = true,
                Message = "Email account created successfully",
                Account = responseAccount,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating email account for {EmailAddress}", request.EmailAddress);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error creating account",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAccounts()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(new { Error = "User not authenticated" });
            }

            var accounts = await _context.EmailAccounts
                .Where(a => a.UserId == userId)
                .OrderBy(a => a.AccountName)
                .Select(a => new
                {
                    a.Id,
                    a.AccountName,
                    a.EmailAddress,
                    a.ServerType,
                    ServerUrl = a.ServerHost,
                    a.Username,
                    a.DisplayName,
                    a.IsActive,
                    a.LastSyncAt,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                Success = true,
                Accounts = accounts,
                Count = accounts.Count,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving accounts for user");
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error retrieving accounts",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpGet("{accountId}")]
    [Authorize]
    public async Task<IActionResult> GetAccount(Guid accountId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(new { Error = "User not authenticated" });
            }

            var account = await _context.EmailAccounts
                .Where(a => a.Id == accountId && a.UserId == userId)
                .Select(a => new
                {
                    a.Id,
                    a.AccountName,
                    a.EmailAddress,
                    a.ServerType,
                    ServerUrl = a.ServerHost,
                    a.Username,
                    a.DisplayName,
                    a.IsActive,
                    a.LastSyncAt,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (account == null)
            {
                return NotFound(new { Error = "Account not found" });
            }

            return Ok(new
            {
                Success = true,
                Account = account,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving account {AccountId}", accountId);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error retrieving account",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpPut("{accountId}")]
    [Authorize]
    public async Task<IActionResult> UpdateAccount(Guid accountId, [FromBody] UpdateAccountRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(new { Error = "User not authenticated" });
            }

            var account = await _context.EmailAccounts
                .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound(new { Error = "Account not found" });
            }

            // Update allowed fields
            if (!string.IsNullOrWhiteSpace(request.AccountName))
                account.AccountName = request.AccountName;
            
            if (!string.IsNullOrWhiteSpace(request.DisplayName))
                account.DisplayName = request.DisplayName;
            
            if (request.IsActive.HasValue)
                account.IsActive = request.IsActive.Value;

            account.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Email account {AccountId} updated successfully", accountId);

            return Ok(new
            {
                Success = true,
                Message = "Account updated successfully",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating account {AccountId}", accountId);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error updating account",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpDelete("{accountId}")]
    [Authorize]
    public async Task<IActionResult> DeleteAccount(Guid accountId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(new { Error = "User not authenticated" });
            }

            var account = await _context.EmailAccounts
                .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound(new { Error = "Account not found" });
            }

            _context.EmailAccounts.Remove(account);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Email account {AccountId} deleted successfully", accountId);

            return Ok(new
            {
                Success = true,
                Message = "Account deleted successfully",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting account {AccountId}", accountId);
            return StatusCode(500, new
            {
                Success = false,
                Error = "Internal server error deleting account",
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    private async Task<Guid> GetOrCreateUserIdAsync(string emailAddress, string? displayName)
    {
        // First try to get current authenticated user
        var currentUserId = GetCurrentUserId();
        if (currentUserId != Guid.Empty)
        {
            return currentUserId;
        }

        // If no authenticated user, check if user exists by email
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == emailAddress);

        if (existingUser != null)
        {
            return existingUser.Id;
        }

        // Create a new user for onboarding
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = emailAddress, // Use email as username for simplicity
            Email = emailAddress,
            PasswordHash = HashPassword("TempPassword123!"), // Temporary password
            FirstName = displayName?.Split(' ').FirstOrDefault() ?? "User",
            LastName = displayName?.Split(' ').Skip(1).FirstOrDefault() ?? "",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Auto-created user {UserId} for onboarding with email {EmailAddress}", 
            user.Id, emailAddress);

        return user.Id;
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var saltedPassword = password + "POSTA-Salt-2024"; // Use same salt as AuthController
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
        return Convert.ToBase64String(hashedBytes);
    }

    public class UpdateAccountRequest
    {
        public string? AccountName { get; set; }
        public string? DisplayName { get; set; }
        public bool? IsActive { get; set; }
    }
}