using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using FluentAssertions;
using POSTA.Api;
using POSTA.Infrastructure.Data;
using POSTA.Core.Entities;

namespace POSTA.Tests.Integration;

public class EmailsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public EmailsIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the real database context
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<POSTADbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory database for testing
                services.AddDbContext<POSTADbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                });

                // Set test JWT configuration
                Environment.SetEnvironmentVariable("JWT_SECRET_KEY", "test-secret-key-that-is-32-characters-long!");
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task HealthCheck_ReturnsOkResponse()
    {
        // Act
        var response = await _client.GetAsync("/health");

        // Assert
        response.Should().BeSuccessful();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("OK");
    }

    [Fact]
    public async Task GetEmails_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/emails/account/00000000-0000-0000-0000-000000000000");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Swagger_IsAvailable()
    {
        // Act
        var response = await _client.GetAsync("/swagger/index.html");

        // Assert
        response.Should().BeSuccessful();
    }

    // Helper method to seed test data
    private async Task SeedTestDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<POSTADbContext>();

        if (!await context.EmailMessages.AnyAsync())
        {
            var testEmail = new EmailMessage
            {
                Id = Guid.NewGuid(),
                AccountId = Guid.NewGuid(),
                Subject = "Test Email",
                FromAddress = "test@example.com",
                ToAddresses = "recipient@example.com",
                TextBody = "This is a test email",
                ReceivedAt = DateTime.UtcNow,
                FolderName = "INBOX",
                IsRead = false,
                IsFlagged = false,
                IsDeleted = false
            };

            context.EmailMessages.Add(testEmail);
            await context.SaveChangesAsync();
        }
    }
}