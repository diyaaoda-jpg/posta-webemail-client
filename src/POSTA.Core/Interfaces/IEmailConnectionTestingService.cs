using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace POSTA.Core.Interfaces
{
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