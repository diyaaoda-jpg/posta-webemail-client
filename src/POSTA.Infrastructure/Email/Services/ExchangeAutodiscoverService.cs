using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text;
using System.Xml.Linq;
using System.Net;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Email.Services;

namespace POSTA.Infrastructure.Email.Services;

public class ExchangeAutodiscoverService : IExchangeAutodiscoverService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExchangeAutodiscoverService> _logger;
    private readonly EwsEmailService _ewsService;

    // Known Office 365 endpoints
    private static readonly Dictionary<string, string> Office365Domains = new()
    {
        { "outlook.com", "https://outlook.office365.com/EWS/Exchange.asmx" },
        { "hotmail.com", "https://outlook.office365.com/EWS/Exchange.asmx" },
        { "live.com", "https://outlook.office365.com/EWS/Exchange.asmx" },
        { "msn.com", "https://outlook.office365.com/EWS/Exchange.asmx" },
        { "office365.com", "https://outlook.office365.com/EWS/Exchange.asmx" }
    };

    public ExchangeAutodiscoverService(HttpClient httpClient, ILogger<ExchangeAutodiscoverService> logger, EwsEmailService ewsService)
    {
        _httpClient = httpClient;
        _logger = logger;
        _ewsService = ewsService;
        
        // Configure HttpClient
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "POSTA Email Client/1.0");
    }

    public async Task<ExchangeServerConfig?> DiscoverAsync(string emailAddress)
    {
        _logger.LogInformation("Starting autodiscovery for email address: {EmailAddress}", emailAddress);
        
        if (!IsValidEmail(emailAddress))
        {
            _logger.LogWarning("Invalid email address format: {EmailAddress}", emailAddress);
            return null;
        }

        var domain = emailAddress.Split('@')[1];
        var config = new ExchangeServerConfig
        {
            AutodiscoverMethod = "autodiscover"
        };

        // Check for known Office 365 domains first
        if (TryGetOffice365Endpoint(domain, out var office365Url))
        {
            _logger.LogInformation("Detected Office 365 domain: {Domain}", domain);
            config.EwsUrl = office365Url;
            config.ServerHost = "outlook.office365.com";
            config.DisplayName = "Microsoft Exchange Online";
            config.AutodiscoverMethod = "office365";
            return config;
        }

        // Generate autodiscovery URLs to try
        var autodiscoverUrls = GenerateAutodiscoverUrls(domain);
        
        foreach (var url in autodiscoverUrls)
        {
            config.TriedUrls.Add(url);
            
            try
            {
                _logger.LogDebug("Trying autodiscovery URL: {Url}", url);
                
                var autodiscoverXml = CreateAutodiscoverRequest(emailAddress);
                var response = await SendAutodiscoverRequest(url, autodiscoverXml);
                
                if (response != null)
                {
                    var ewsUrl = ParseAutodiscoverResponse(response);
                    if (!string.IsNullOrEmpty(ewsUrl))
                    {
                        _logger.LogInformation("Autodiscovery successful for {EmailAddress}. EWS URL: {EwsUrl}", emailAddress, ewsUrl);
                        
                        config.EwsUrl = ewsUrl;
                        config.ServerHost = new Uri(ewsUrl).Host;
                        config.DisplayName = $"Exchange Server ({config.ServerHost})";
                        return config;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug("Autodiscovery failed for URL {Url}: {Error}", url, ex.Message);
            }
        }

        _logger.LogWarning("Autodiscovery failed for {EmailAddress}. Tried {Count} URLs.", emailAddress, autodiscoverUrls.Count);
        config.ErrorMessage = $"Autodiscovery failed. Tried {autodiscoverUrls.Count} URLs.";
        return config;
    }

    public async Task<ExchangeServerConfig?> DiscoverManualAsync(string emailAddress, string serverInput)
    {
        _logger.LogInformation("Starting manual discovery for email address: {EmailAddress} with server input: {ServerInput}", emailAddress, serverInput);
        
        if (!IsValidEmail(emailAddress))
        {
            _logger.LogWarning("Invalid email address format: {EmailAddress}", emailAddress);
            return null;
        }

        var config = new ExchangeServerConfig
        {
            AutodiscoverMethod = "manual"
        };

        // Parse and construct potential URLs from the server input
        var potentialUrls = GenerateManualUrls(serverInput);
        
        foreach (var url in potentialUrls)
        {
            config.TriedUrls.Add(url);
            
            try
            {
                _logger.LogDebug("Trying manual URL: {Url}", url);
                
                var autodiscoverXml = CreateAutodiscoverRequest(emailAddress);
                var response = await SendAutodiscoverRequest(url, autodiscoverXml);
                
                if (response != null)
                {
                    var ewsUrl = ParseAutodiscoverResponse(response);
                    if (!string.IsNullOrEmpty(ewsUrl))
                    {
                        _logger.LogInformation("Manual discovery successful for {EmailAddress}. EWS URL: {EwsUrl}", emailAddress, ewsUrl);
                        
                        config.EwsUrl = ewsUrl;
                        config.ServerHost = new Uri(ewsUrl).Host;
                        config.DisplayName = $"Exchange Server ({config.ServerHost})";
                        return config;
                    }
                }
                
                // If autodiscovery fails, try treating the input as direct EWS URL
                if (await TestDirectEwsUrl(url))
                {
                    _logger.LogInformation("Direct EWS URL test successful: {Url}", url);
                    
                    config.EwsUrl = url;
                    config.ServerHost = new Uri(url).Host;
                    config.DisplayName = $"Exchange Server ({config.ServerHost})";
                    return config;
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug("Manual discovery failed for URL {Url}: {Error}", url, ex.Message);
            }
        }

        _logger.LogWarning("Manual discovery failed for {EmailAddress} with server input {ServerInput}. Tried {Count} URLs.", 
            emailAddress, serverInput, potentialUrls.Count);
        config.ErrorMessage = $"Manual discovery failed. Tried {potentialUrls.Count} URLs.";
        return config;
    }

    public async Task<bool> TestConnectionAsync(ExchangeServerConfig config, string username, string password)
    {
        try
        {
            _logger.LogInformation("Testing connection to {EwsUrl} for user {Username}", config.EwsUrl, username);
            
            // Create a temporary EmailAccount for testing
            var testAccount = new POSTA.Core.Entities.EmailAccount
            {
                Id = Guid.NewGuid(),
                ServerType = "exchange",
                ServerHost = config.EwsUrl,
                Username = username,
                PasswordHash = password, // For testing, we pass the actual password
                UseSsl = config.UseSsl,
                EmailAddress = username, // Usually the same for Exchange
                AccountName = "Test Account"
            };

            return await _ewsService.TestConnectionAsync(testAccount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Connection test failed for {EwsUrl}", config.EwsUrl);
            return false;
        }
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private bool TryGetOffice365Endpoint(string domain, out string ewsUrl)
    {
        ewsUrl = string.Empty;
        
        if (Office365Domains.TryGetValue(domain.ToLowerInvariant(), out var foundUrl) && foundUrl != null)
        {
            ewsUrl = foundUrl;
            return true;
        }
        
        // Check if domain might be using Office 365 by checking for common patterns
        var lowerDomain = domain.ToLowerInvariant();
        if (lowerDomain.Contains("onmicrosoft") || lowerDomain.Contains("outlook"))
        {
            ewsUrl = "https://outlook.office365.com/EWS/Exchange.asmx";
            return true;
        }
        
        return false;
    }

    private List<string> GenerateAutodiscoverUrls(string domain)
    {
        var urls = new List<string>();
        
        // Standard autodiscover URLs
        urls.Add($"https://autodiscover.{domain}/autodiscover/autodiscover.xml");
        urls.Add($"https://{domain}/autodiscover/autodiscover.xml");
        urls.Add($"http://autodiscover.{domain}/autodiscover/autodiscover.xml");
        urls.Add($"http://{domain}/autodiscover/autodiscover.xml");
        
        // Alternative patterns
        urls.Add($"https://autodiscover.{domain}/Autodiscover/Autodiscover.xml");
        urls.Add($"https://{domain}/Autodiscover/Autodiscover.xml");
        urls.Add($"https://mail.{domain}/autodiscover/autodiscover.xml");
        urls.Add($"https://exchange.{domain}/autodiscover/autodiscover.xml");
        
        return urls;
    }

    private List<string> GenerateManualUrls(string serverInput)
    {
        var urls = new List<string>();
        var input = serverInput.Trim();
        
        // If it's already a complete URL, try it first
        if (Uri.TryCreate(input, UriKind.Absolute, out var uri))
        {
            if (input.Contains("/autodiscover/"))
            {
                urls.Add(input);
            }
            else if (input.Contains("/EWS/"))
            {
                urls.Add(input);
                // Also try autodiscover on the same server
                var baseUrl = $"{uri.Scheme}://{uri.Host}";
                if (uri.Port != 80 && uri.Port != 443)
                    baseUrl += $":{uri.Port}";
                urls.Add($"{baseUrl}/autodiscover/autodiscover.xml");
            }
            else
            {
                // Generic URL, try common patterns
                var baseUrl = $"{uri.Scheme}://{uri.Host}";
                if (uri.Port != 80 && uri.Port != 443)
                    baseUrl += $":{uri.Port}";
                
                urls.Add($"{baseUrl}/autodiscover/autodiscover.xml");
                urls.Add($"{baseUrl}/EWS/Exchange.asmx");
                urls.Add($"{baseUrl}/exchange/");
            }
        }
        else
        {
            // Parse as hostname/domain
            var cleanInput = input.Replace("autodiscover ", "").Replace("autodiscover.", "").Trim();
            
            // Try HTTPS first, then HTTP
            foreach (var scheme in new[] { "https", "http" })
            {
                // Direct autodiscover URLs
                if (!cleanInput.StartsWith("autodiscover."))
                {
                    urls.Add($"{scheme}://autodiscover.{cleanInput}/autodiscover/autodiscover.xml");
                }
                urls.Add($"{scheme}://{cleanInput}/autodiscover/autodiscover.xml");
                
                // Alternative patterns
                urls.Add($"{scheme}://mail.{cleanInput}/autodiscover/autodiscover.xml");
                urls.Add($"{scheme}://exchange.{cleanInput}/autodiscover/autodiscover.xml");
                
                // Direct EWS URLs for testing
                urls.Add($"{scheme}://{cleanInput}/EWS/Exchange.asmx");
                urls.Add($"{scheme}://mail.{cleanInput}/EWS/Exchange.asmx");
                urls.Add($"{scheme}://exchange.{cleanInput}/EWS/Exchange.asmx");
            }
        }
        
        return urls.Distinct().ToList();
    }

    private string CreateAutodiscoverRequest(string emailAddress)
    {
        return $@"<?xml version=""1.0"" encoding=""utf-8""?>
<Autodiscover xmlns=""http://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006"">
    <Request>
        <EMailAddress>{emailAddress}</EMailAddress>
        <AcceptableResponseSchema>http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a</AcceptableResponseSchema>
    </Request>
</Autodiscover>";
    }

    private async Task<string?> SendAutodiscoverRequest(string url, string requestXml)
    {
        try
        {
            var content = new StringContent(requestXml, Encoding.UTF8, "text/xml");
            
            var response = await _httpClient.PostAsync(url, content);
            
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }
            
            _logger.LogDebug("Autodiscover request failed for {Url}. Status: {StatusCode}", url, response.StatusCode);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogDebug("Exception during autodiscover request to {Url}: {Error}", url, ex.Message);
            return null;
        }
    }

    private string? ParseAutodiscoverResponse(string responseXml)
    {
        try
        {
            var doc = XDocument.Parse(responseXml);
            
            // Try different namespaces and element names
            var namespaces = new[]
            {
                XNamespace.Get("http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a"),
                XNamespace.Get("http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006"),
                XNamespace.Get("http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006")
            };
            
            foreach (var ns in namespaces)
            {
                var ewsUrlElement = doc.Descendants(ns + "EwsUrl").FirstOrDefault();
                if (ewsUrlElement != null && !string.IsNullOrEmpty(ewsUrlElement.Value))
                {
                    return ewsUrlElement.Value;
                }
                
                // Alternative element names
                var urlElement = doc.Descendants(ns + "Url").FirstOrDefault();
                if (urlElement != null && !string.IsNullOrEmpty(urlElement.Value) && 
                    urlElement.Value.Contains("/EWS/"))
                {
                    return urlElement.Value;
                }
            }
            
            // Try without namespace
            var noNamespaceEwsElement = doc.Descendants("EwsUrl").FirstOrDefault();
            if (noNamespaceEwsElement != null && !string.IsNullOrEmpty(noNamespaceEwsElement.Value))
            {
                return noNamespaceEwsElement.Value;
            }
            
            _logger.LogDebug("Could not find EWS URL in autodiscover response");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing autodiscover response");
            return null;
        }
    }

    private async Task<bool> TestDirectEwsUrl(string url)
    {
        try
        {
            // Try a simple GET request to see if it's a valid EWS endpoint
            var response = await _httpClient.GetAsync(url);
            
            // EWS typically returns 405 Method Not Allowed for GET requests
            // or some other response that indicates it's a valid endpoint
            return response.StatusCode == HttpStatusCode.MethodNotAllowed ||
                   response.StatusCode == HttpStatusCode.Unauthorized ||
                   response.StatusCode == HttpStatusCode.OK;
        }
        catch
        {
            return false;
        }
    }
}