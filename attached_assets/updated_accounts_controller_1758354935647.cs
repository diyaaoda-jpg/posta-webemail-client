using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using POSTA.Infrastructure.Email.Services;
using System.Threading.Tasks;

namespace POSTA.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly ImprovedExchangeAutodiscoverService _autodiscoverService;
        private readonly EmailConnectionTestingService _connectionTestingService;
        private readonly ILogger<AccountsController> _logger;

        public AccountsController(
            ImprovedExchangeAutodiscoverService autodiscoverService,
            EmailConnectionTestingService connectionTestingService,
            ILogger<AccountsController> logger)
        {
            _autodiscoverService = autodiscoverService;
            _connectionTestingService = connectionTestingService;
            _logger = logger;
        }

        [HttpPost("discover")]
        public async Task<ActionResult<AutodiscoverResponse>> Discover([FromBody] AutodiscoverRequest request)
        {
            try
            {
                _logger.LogInformation("Starting autodiscovery for {EmailAddress}", request.EmailAddress);
                
                var result = await _autodiscoverService.DiscoverAsync(request);
                
                if (result.Success)
                {
                    _logger.LogInformation("Autodiscovery successful for {EmailAddress} using {Method}", 
                        request.EmailAddress, result.AutodiscoverMethod);
                    return Ok(result);
                }
                else
                {
                    _logger.LogWarning("Autodiscovery failed for {EmailAddress}: {Error}", 
                        request.EmailAddress, result.ErrorMessage);
                    return Ok(result); // Return the failed result with error details
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Exception during autodiscovery for {EmailAddress}", request.EmailAddress);
                return StatusCode(500, new AutodiscoverResponse
                {
                    EmailAddress = request.EmailAddress,
                    Success = false,
                    ErrorMessage = "Internal server error during autodiscovery"
                });
            }
        }

        [HttpPost("test-connection")]
        public async Task<ActionResult<ConnectionTestResult>> TestConnection([FromBody] ConnectionTestRequest request)
        {
            try
            {
                _logger.LogInformation("Starting connection test for {EmailAddress}", request.EmailAddress);
                
                var result = await _connectionTestingService.TestConnectionAsync(request);
                
                if (result.Success)
                {
                    _logger.LogInformation("Connection test successful for {EmailAddress}", request.EmailAddress);
                }
                else
                {
                    _logger.LogWarning("Connection test failed for {EmailAddress}: {Error}", 
                        request.EmailAddress, result.ErrorMessage);
                }
                
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Exception during connection test for {EmailAddress}", request.EmailAddress);
                return StatusCode(500, new ConnectionTestResult
                {
                    EmailAddress = request.EmailAddress,
                    Success = false,
                    ErrorMessage = "Internal server error during connection test",
                    TestEndTime = System.DateTime.UtcNow
                });
            }
        }

        [HttpPost("create")]
        public async Task<ActionResult<CreateAccountResponse>> CreateAccount([FromBody] CreateAccountRequest request)
        {
            try
            {
                _logger.LogInformation("Creating email account for {EmailAddress}", request.EmailAddress);
                
                // First test the connection
                var testRequest = new ConnectionTestRequest
                {
                    EmailAddress = request.EmailAddress,
                    Password = request.Password,
                    ServerHost = request.ServerConfig.ServerHost,
                    ServerPort = request.ServerConfig.ServerPort,
                    UseSsl = request.ServerConfig.UseSsl,
                    EwsUrl = request.ServerConfig.EwsUrl
                };

                var testResult = await _connectionTestingService.TestConnectionAsync(testRequest);
                
                if (!testResult.Success)
                {
                    return BadRequest(new CreateAccountResponse
                    {
                        Success = false,
                        ErrorMessage = $"Connection test failed: {testResult.ErrorMessage}",
                        TestResult = testResult
                    });
                }

                // TODO: Save account to database
                // var account = new EmailAccount
                // {
                //     EmailAddress = request.EmailAddress,
                //     DisplayName = request.DisplayName,
                //     AccountName = request.AccountName,
                //     ServerHost = request.ServerConfig.ServerHost,
                //     ServerPort = request.ServerConfig.ServerPort,
                //     UseSsl = request.ServerConfig.UseSsl,
                //     EwsUrl = request.ServerConfig.EwsUrl,
                //     // Don't store password in plain text - encrypt it
                //     EncryptedPassword = EncryptPassword(request.Password)
                // };
                // 
                // await _dbContext.EmailAccounts.AddAsync(account);
                // await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Email account created successfully for {EmailAddress}", request.EmailAddress);

                return Ok(new CreateAccountResponse
                {
                    Success = true,
                    Message = "Email account created successfully",
                    TestResult = testResult
                });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Exception during account creation for {EmailAddress}", request.EmailAddress);
                return StatusCode(500, new CreateAccountResponse
                {
                    Success = false,
                    ErrorMessage = "Internal server error during account creation"
                });
            }
        }
    }

    // Request/Response models
    public class CreateAccountRequest
    {
        public string EmailAddress { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public ServerConfig ServerConfig { get; set; } = new();
    }

    public class ServerConfig
    {
        public string ServerHost { get; set; } = string.Empty;
        public int ServerPort { get; set; }
        public bool UseSsl { get; set; }
        public string? EwsUrl { get; set; }
    }

    public class CreateAccountResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? ErrorMessage { get; set; }
        public ConnectionTestResult? TestResult { get; set; }
    }
}