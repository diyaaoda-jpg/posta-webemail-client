using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml.Linq;
using System.Text;
using Microsoft.Extensions.Logging;
using POSTA.Core.Interfaces;

namespace POSTA.Infrastructure.Email.Services
{
    public class ImprovedExchangeAutodiscoverService : IExchangeAutodiscoverService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ImprovedExchangeAutodiscoverService> _logger;

        public ImprovedExchangeAutodiscoverService(
            HttpClient httpClient, 
            ILogger<ImprovedExchangeAutodiscoverService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<AutodiscoverResponse> DiscoverAsync(AutodiscoverRequest request)
        {
            var response = new AutodiscoverResponse
            {
                EmailAddress = request.EmailAddress,
                TriedUrls = new List<string>()
            };

            try
            {
                var domain = ExtractDomain(request.EmailAddress);
                if (string.IsNullOrEmpty(domain))
                {
                    response.ErrorMessage = "Invalid email address format";
                    return response;
                }

                // Try multiple autodiscovery methods in order of preference
                var discoveryMethods = new List<Func<string, string, Task<AutodiscoverConfig?>>>
                {
                    TryExchangeAutodiscoverUrl,
                    TryDomainAutodiscoverUrl,
                    TryWellKnownEndpoints,
                    TryCommonExchangeSettings
                };

                foreach (var method in discoveryMethods)
                {
                    var config = await method(request.EmailAddress, domain);
                    if (config != null)
                    {
                        response.Success = true;
                        response.Config = config;
                        response.AutodiscoverMethod = config.AutodiscoverMethod;
                        return response;
                    }
                }

                // If all methods fail, try common provider patterns
                var commonConfig = TryCommonProviderPatterns(domain);
                if (commonConfig != null)
                {
                    response.Success = true;
                    response.Config = commonConfig;
                    response.AutodiscoverMethod = "CommonProviderPattern";
                    return response;
                }

                response.ErrorMessage = "Could not automatically discover email settings";
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during autodiscovery for {EmailAddress}", request.EmailAddress);
                response.ErrorMessage = $"Autodiscovery failed: {ex.Message}";
                return response;
            }
        }

        private async Task<AutodiscoverConfig?> TryExchangeAutodiscoverUrl(string emailAddress, string domain)
        {
            var autodiscoverUrl = $"https://autodiscover.{domain}/autodiscover/autodiscover.xml";
            return await TryAutodiscoverUrl(autodiscoverUrl, emailAddress);
        }

        private async Task<AutodiscoverConfig?> TryDomainAutodiscoverUrl(string emailAddress, string domain)
        {
            var autodiscoverUrl = $"https://{domain}/autodiscover/autodiscover.xml";
            return await TryAutodiscoverUrl(autodiscoverUrl, emailAddress);
        }

        private async Task<AutodiscoverConfig?> TryWellKnownEndpoints(string emailAddress, string domain)
        {
            var wellKnownUrls = new[]
            {
                $"https://{domain}/.well-known/autoconfig/mail/config-v1.1.xml",
                $"https://autoconfig.{domain}/mail/config-v1.1.xml",
                $"https://{domain}/mail/config-v1.1.xml"
            };

            foreach (var url in wellKnownUrls)
            {
                var config = await TryAutodiscoverUrl(url, emailAddress);
                if (config != null) return config;
            }

            return null;
        }

        private async Task<AutodiscoverConfig?> TryAutodiscoverUrl(string url, string emailAddress)
        {
            try
            {
                _logger.LogInformation("Trying autodiscovery URL: {Url}", url);

                // Create autodiscovery request XML
                var requestXml = CreateAutodiscoverRequestXml(emailAddress);
                var content = new StringContent(requestXml, Encoding.UTF8, "text/xml");

                // Set required headers
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "POSTA Email Client");

                var response = await _httpClient.PostAsync(url, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseXml = await response.Content.ReadAsStringAsync();
                    var config = ParseAutodiscoverResponse(responseXml);
                    if (config != null)
                    {
                        config.AutodiscoverMethod = "ExchangeAutodiscovery";
                        _logger.LogInformation("Successfully discovered settings via {Url}", url);
                        return config;
                    }
                }
                else
                {
                    _logger.LogWarning("Autodiscovery failed for {Url}: {StatusCode}", url, response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Exception during autodiscovery for {Url}", url);
            }

            return null;
        }

        private async Task<AutodiscoverConfig?> TryCommonExchangeSettings(string emailAddress, string domain)
        {
            // Try common Exchange Online patterns
            var commonExchangeHosts = new[]
            {
                "outlook.office365.com",
                $"mail.{domain}",
                $"exchange.{domain}",
                $"owa.{domain}"
            };

            foreach (var host in commonExchangeHosts)
            {
                try
                {
                    // Test if EWS endpoint is accessible
                    var ewsUrl = $"https://{host}/EWS/Exchange.asmx";
                    var testResponse = await _httpClient.GetAsync(ewsUrl);
                    
                    if (testResponse.IsSuccessStatusCode || testResponse.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    {
                        return new AutodiscoverConfig
                        {
                            ServerHost = host,
                            ServerPort = 443,
                            UseSsl = true,
                            EwsUrl = ewsUrl,
                            DisplayName = domain.Contains("office365") ? "Microsoft Exchange Online" : $"{domain} Exchange Server",
                            AutodiscoverMethod = "CommonExchangePattern"
                        };
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Failed to test Exchange host {Host}", host);
                }
            }

            return null;
        }

        private AutodiscoverConfig? TryCommonProviderPatterns(string domain)
        {
            // Gmail
            if (domain.Contains("gmail.com") || domain.Contains("googlemail.com"))
            {
                return new AutodiscoverConfig
                {
                    ServerHost = "imap.gmail.com",
                    ServerPort = 993,
                    UseSsl = true,
                    DisplayName = "Gmail",
                    AutodiscoverMethod = "CommonProviderPattern"
                };
            }

            // Outlook.com / Hotmail
            if (domain.Contains("outlook.com") || domain.Contains("hotmail.com") || domain.Contains("live.com"))
            {
                return new AutodiscoverConfig
                {
                    ServerHost = "outlook.office365.com",
                    ServerPort = 993,
                    UseSsl = true,
                    EwsUrl = "https://outlook.office365.com/EWS/Exchange.asmx",
                    DisplayName = "Microsoft Outlook",
                    AutodiscoverMethod = "CommonProviderPattern"
                };
            }

            // Yahoo
            if (domain.Contains("yahoo.com"))
            {
                return new AutodiscoverConfig
                {
                    ServerHost = "imap.mail.yahoo.com",
                    ServerPort = 993,
                    UseSsl = true,
                    DisplayName = "Yahoo Mail",
                    AutodiscoverMethod = "CommonProviderPattern"
                };
            }

            // Try generic IMAP patterns
            var genericImapHosts = new[]
            {
                $"imap.{domain}",
                $"mail.{domain}",
                $"mx.{domain}"
            };

            foreach (var host in genericImapHosts)
            {
                return new AutodiscoverConfig
                {
                    ServerHost = host,
                    ServerPort = 993,
                    UseSsl = true,
                    DisplayName = $"{domain} Mail Server",
                    AutodiscoverMethod = "GenericIMAPPattern"
                };
            }

            return null;
        }

        private string CreateAutodiscoverRequestXml(string emailAddress)
        {
            return $@"<?xml version=""1.0"" encoding=""utf-8""?>
<Autodiscover xmlns=""http://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006"">
  <Request>
    <EMailAddress>{emailAddress}</EMailAddress>
    <AcceptableResponseSchema>http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a</AcceptableResponseSchema>
  </Request>
</Autodiscover>";
        }

        private AutodiscoverConfig? ParseAutodiscoverResponse(string responseXml)
        {
            try
            {
                var doc = XDocument.Parse(responseXml);
                var ns = XNamespace.Get("http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a");

                // Look for Exchange Web Services settings
                var ewsProtocol = doc.Descendants(ns + "Protocol")
                    .FirstOrDefault(p => p.Element(ns + "Type")?.Value == "EXCH");

                if (ewsProtocol != null)
                {
                    var ewsUrl = ewsProtocol.Element(ns + "EwsUrl")?.Value;
                    var serverName = ewsProtocol.Element(ns + "Server")?.Value;

                    if (!string.IsNullOrEmpty(ewsUrl))
                    {
                        return new AutodiscoverConfig
                        {
                            ServerHost = ExtractHostFromUrl(ewsUrl) ?? serverName ?? "outlook.office365.com",
                            ServerPort = 443,
                            UseSsl = true,
                            EwsUrl = ewsUrl,
                            DisplayName = "Microsoft Exchange",
                            AutodiscoverMethod = "ExchangeAutodiscovery"
                        };
                    }
                }

                // Look for IMAP settings as fallback
                var imapProtocol = doc.Descendants(ns + "Protocol")
                    .FirstOrDefault(p => p.Element(ns + "Type")?.Value == "IMAP");

                if (imapProtocol != null)
                {
                    var server = imapProtocol.Element(ns + "Server")?.Value;
                    var portStr = imapProtocol.Element(ns + "Port")?.Value;
                    var sslStr = imapProtocol.Element(ns + "SSL")?.Value;

                    if (!string.IsNullOrEmpty(server) && int.TryParse(portStr, out var port))
                    {
                        return new AutodiscoverConfig
                        {
                            ServerHost = server,
                            ServerPort = port,
                            UseSsl = string.Equals(sslStr, "on", StringComparison.OrdinalIgnoreCase),
                            DisplayName = "IMAP Server",
                            AutodiscoverMethod = "ExchangeAutodiscovery"
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse autodiscovery response");
            }

            return null;
        }

        private string ExtractDomain(string emailAddress)
        {
            var atIndex = emailAddress.LastIndexOf('@');
            return atIndex > 0 && atIndex < emailAddress.Length - 1 
                ? emailAddress.Substring(atIndex + 1) 
                : string.Empty;
        }

        private string? ExtractHostFromUrl(string url)
        {
            try
            {
                var uri = new Uri(url);
                return uri.Host;
            }
            catch
            {
                return null;
            }
        }
    }

    // Updated interfaces and models
    public class AutodiscoverRequest
    {
        public string EmailAddress { get; set; } = string.Empty;
    }

    public class AutodiscoverResponse
    {
        public string EmailAddress { get; set; } = string.Empty;
        public bool Success { get; set; }
        public AutodiscoverConfig? Config { get; set; }
        public string? AutodiscoverMethod { get; set; }
        public List<string> TriedUrls { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public class AutodiscoverConfig
    {
        public string ServerHost { get; set; } = string.Empty;
        public int ServerPort { get; set; }
        public bool UseSsl { get; set; }
        public string? EwsUrl { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string AutodiscoverMethod { get; set; } = string.Empty;
    }
}