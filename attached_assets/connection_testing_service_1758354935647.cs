using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MailKit.Net.Imap;
using MailKit.Security;
using Microsoft.Exchange.WebServices.Data;
using POSTA.Core.Interfaces;

namespace POSTA.Infrastructure.Email.Services
{
    public class EmailConnectionTestingService : IEmailConnectionTestingService
    {
        private readonly ILogger<EmailConnectionTestingService> _logger;

        public EmailConnectionTestingService(ILogger<EmailConnectionTestingService> logger)
        {
            _logger = logger;
        }

        public async Task<ConnectionTestResult> TestConnectionAsync(ConnectionTestRequest request)
        {
            var result = new ConnectionTestResult
            {
                EmailAddress = request.EmailAddress,
                TestStartTime = DateTime.UtcNow
            };

            try
            {
                _logger.LogInformation("Starting connection test for {EmailAddress}", request.EmailAddress);

                // Determine which protocol to test
                if (!string.IsNullOrEmpty(request.EwsUrl))
                {
                    result = await TestExchangeConnection(request, result);
                }
                else
                {
                    result = await TestImapConnection(request, result);
                }

                result.TestEndTime = DateTime.UtcNow;
                result.TestDuration = result.TestEndTime - result.TestStartTime;

                _logger.LogInformation("Connection test completed for {EmailAddress}: {Success}", 
                    request.EmailAddress, result.Success);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Connection test failed for {EmailAddress}", request.EmailAddress);
                
                result.Success = false;
                result.ErrorMessage = $"Connection test failed: {ex.Message}";
                result.TestEndTime = DateTime.UtcNow;
                result.TestDuration = result.TestEndTime - result.TestStartTime;
                
                return result;
            }
        }

        private async Task<ConnectionTestResult> TestImapConnection(
            ConnectionTestRequest request, 
            ConnectionTestResult result)
        {
            try
            {
                _logger.LogInformation("Testing IMAP connection to {ServerHost}:{ServerPort}", 
                    request.ServerHost, request.ServerPort);

                result.TestSteps.Add(new TestStep
                {
                    Step = "Connecting to IMAP server",
                    Status = "In Progress",
                    Timestamp = DateTime.UtcNow
                });

                using var client = new ImapClient();

                // Connect to server
                var secureSocketOptions = request.UseSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.None;
                await client.ConnectAsync(request.ServerHost, request.ServerPort, secureSocketOptions);

                result.TestSteps.Add(new TestStep
                {
                    Step = "Server connection established",
                    Status = "Success",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Connected to {request.ServerHost}:{request.ServerPort} (SSL: {request.UseSsl})"
                });

                // Authenticate
                result.TestSteps.Add(new TestStep
                {
                    Step = "Authenticating with server",
                    Status = "In Progress",
                    Timestamp = DateTime.UtcNow
                });

                await client.AuthenticateAsync(request.EmailAddress, request.Password);

                result.TestSteps.Add(new TestStep
                {
                    Step = "Authentication successful",
                    Status = "Success",
                    Timestamp = DateTime.UtcNow,
                    Details = "Successfully authenticated with IMAP server"
                });

                // Test inbox access
                result.TestSteps.Add(new TestStep
                {
                    Step = "Testing inbox access",
                    Status = "In Progress",
                    Timestamp = DateTime.UtcNow
                });

                var inbox = client.Inbox;
                await inbox.OpenAsync(MailKit.FolderAccess.ReadOnly);

                result.TestSteps.Add(new TestStep
                {
                    Step = "Inbox access verified",
                    Status = "Success",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Inbox contains {inbox.Count} messages"
                });

                await client.DisconnectAsync(true);

                result.Success = true;
                result.ServerInfo = new ServerInfo
                {
                    ServerType = "IMAP",
                    ServerHost = request.ServerHost,
                    ServerPort = request.ServerPort,
                    UseSsl = request.UseSsl,
                    ConnectionTime = DateTime.UtcNow - result.TestStartTime,
                    InboxMessageCount = inbox.Count
                };

                return result;
            }
            catch (MailKit.Security.AuthenticationException ex)
            {
                result.Success = false;
                result.ErrorMessage = "Authentication failed. Please check your email address and password.";
                result.TestSteps.Add(new TestStep
                {
                    Step = "IMAP authentication",
                    Status = "Failed",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Authentication failed: {ex.Message}"
                });
                return result;
            }
            catch (MailKit.Net.Imap.ImapProtocolException ex)
            {
                result.Success = false;
                result.ErrorMessage = $"IMAP protocol error: {ex.Message}";
                result.TestSteps.Add(new TestStep
                {
                    Step = "IMAP protocol communication",
                    Status = "Failed",
                    Timestamp = DateTime.UtcNow,
                    Details = ex.Message
                });
                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = $"IMAP connection failed: {ex.Message}";
                result.TestSteps.Add(new TestStep
                {
                    Step = "IMAP connection",
                    Status = "Failed",
                    Timestamp = DateTime.UtcNow,
                    Details = ex.Message
                });
                return result;
            }
        }

        private string ExtractHostFromUrl(string url)
        {
            try
            {
                var uri = new Uri(url);
                return uri.Host;
            }
            catch
            {
                return url;
            }
        }
    }

    // Supporting models and interfaces
    public interface IEmailConnectionTestingService
    {
        Task<ConnectionTestResult> TestConnectionAsync(ConnectionTestRequest request);
    }

    public class ConnectionTestRequest
    {
        public string EmailAddress { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ServerHost { get; set; } = string.Empty;
        public int ServerPort { get; set; }
        public bool UseSsl { get; set; }
        public string? EwsUrl { get; set; }
    }

    public class ConnectionTestResult
    {
        public string EmailAddress { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime TestStartTime { get; set; }
        public DateTime TestEndTime { get; set; }
        public TimeSpan TestDuration { get; set; }
        public List<TestStep> TestSteps { get; set; } = new();
        public ServerInfo? ServerInfo { get; set; }
    }

    public class TestStep
    {
        public string Step { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // "In Progress", "Success", "Failed"
        public DateTime Timestamp { get; set; }
        public string? Details { get; set; }
    }

    public class ServerInfo
    {
        public string ServerType { get; set; } = string.Empty; // "IMAP", "Exchange Web Services"
        public string ServerHost { get; set; } = string.Empty;
        public int ServerPort { get; set; }
        public bool UseSsl { get; set; }
        public string? EwsUrl { get; set; }
        public TimeSpan ConnectionTime { get; set; }
        public int? InboxMessageCount { get; set; }
    }
}

        private async Task<ConnectionTestResult> TestExchangeConnection(
            ConnectionTestRequest request, 
            ConnectionTestResult result)
        {
            try
            {
                _logger.LogInformation("Testing Exchange Web Services connection to {EwsUrl}", request.EwsUrl);

                var service = new ExchangeService(ExchangeVersion.Exchange2013_SP1)
                {
                    Credentials = new WebCredentials(request.EmailAddress, request.Password),
                    Url = new Uri(request.EwsUrl!)
                };

                // Test connection by getting user settings
                result.TestSteps.Add(new TestStep
                {
                    Step = "Connecting to Exchange Web Services",
                    Status = "In Progress",
                    Timestamp = DateTime.UtcNow
                });

                // Test by getting folder information
                var inboxFolder = await Task.Run(() => Folder.Bind(service, WellKnownFolderName.Inbox));
                
                result.TestSteps.Add(new TestStep
                {
                    Step = "Authenticating with Exchange server",
                    Status = "Success",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Successfully authenticated and accessed inbox"
                });

                // Get basic folder statistics
                var folderView = new FolderView(10);
                var findFoldersResults = await Task.Run(() => service.FindFolders(WellKnownFolderName.MsgFolderRoot, folderView));
                
                result.TestSteps.Add(new TestStep
                {
                    Step = "Testing folder access",
                    Status = "Success",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Found {findFoldersResults.TotalCount} folders"
                });

                result.Success = true;
                result.ServerInfo = new ServerInfo
                {
                    ServerType = "Exchange Web Services",
                    ServerHost = ExtractHostFromUrl(request.EwsUrl!),
                    ServerPort = 443,
                    UseSsl = true,
                    EwsUrl = request.EwsUrl,
                    ConnectionTime = DateTime.UtcNow - result.TestStartTime
                };

                return result;
            }
            catch (ServiceRequestException ex)
            {
                result.Success = false;
                result.ErrorMessage = $"Exchange authentication failed: {ex.Message}";
                result.TestSteps.Add(new TestStep
                {
                    Step = "Exchange Web Services authentication",
                    Status = "Failed",
                    Timestamp = DateTime.UtcNow,
                    Details = ex.Message
                });
                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = $"Exchange connection failed: {ex.Message}";
                result.TestSteps.Add(new TestStep
                {
                    Step = "Exchange Web Services connection",
                    Status = "Failed",
                    Timestamp = DateTime.UtcNow,
                    Details = ex.Message
                });
                return result;
                