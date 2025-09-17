using POSTA.Core.Entities;

namespace POSTA.Core.Interfaces;

// Exchange server autodiscovery interface
public interface IExchangeAutodiscoverService
{
    Task<ExchangeServerConfig?> DiscoverAsync(string emailAddress);
    Task<ExchangeServerConfig?> DiscoverManualAsync(string emailAddress, string serverInput);
    Task<bool> TestConnectionAsync(ExchangeServerConfig config, string username, string password);
}

// Exchange server configuration model
public class ExchangeServerConfig
{
    public string EwsUrl { get; set; } = string.Empty;
    public string ServerHost { get; set; } = string.Empty;
    public int ServerPort { get; set; } = 443;
    public bool UseSsl { get; set; } = true;
    public string DisplayName { get; set; } = string.Empty;
    public string AutodiscoverMethod { get; set; } = string.Empty;
    public List<string> TriedUrls { get; set; } = new();
    public string? ErrorMessage { get; set; }
}

// API request models
public class AutodiscoverRequest
{
    public string EmailAddress { get; set; } = string.Empty;
}

public class ManualDiscoverRequest
{
    public string EmailAddress { get; set; } = string.Empty;
    public string ServerInput { get; set; } = string.Empty;
}

public class TestConnectionRequest
{
    public string EmailAddress { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public ExchangeServerConfig ServerConfig { get; set; } = null!;
}

public class AccountCreationRequest
{
    public string AccountName { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public ExchangeServerConfig ServerConfig { get; set; } = null!;
    public string? DisplayName { get; set; }
}