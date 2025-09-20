using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using POSTA.Api.Controllers;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Email.Services;
using AutoFixture.Xunit2;

namespace POSTA.Tests.Controllers;

public class AccountsControllerTests : TestBase
{
    private readonly AccountsController _controller;
    private readonly Mock<ILogger<AccountsController>> _mockLogger;
    private readonly Mock<IExchangeAutodiscoverService> _mockAutodiscoverService;
    private readonly Mock<IEmailConnectionTestingService> _mockConnectionTestingService;

    public AccountsControllerTests()
    {
        _mockLogger = new Mock<ILogger<AccountsController>>();
        _mockAutodiscoverService = new Mock<IExchangeAutodiscoverService>();
        _mockConnectionTestingService = new Mock<IEmailConnectionTestingService>();

        _controller = new AccountsController(
            DbContext,
            _mockLogger.Object,
            _mockAutodiscoverService.Object,
            _mockConnectionTestingService.Object);
    }

    [Theory, AutoData]
    public async Task Discover_WithValidEmail_ReturnsSuccessResponse(string emailAddress)
    {
        // Arrange
        var expectedConfig = new ExchangeServerConfig
        {
            EwsUrl = "https://outlook.office365.com/EWS/Exchange.asmx",
            ServerHost = "outlook.office365.com",
            ServerPort = 443,
            UseSsl = true,
            DisplayName = "Microsoft Exchange",
            AutodiscoverMethod = "ExchangeWebServices"
        };

        _mockAutodiscoverService.Setup(x => x.DiscoverAsync(emailAddress))
            .ReturnsAsync(expectedConfig);

        var request = new AutodiscoverRequest { EmailAddress = emailAddress };

        // Act
        var result = await _controller.Discover(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        _mockAutodiscoverService.Verify(x => x.DiscoverAsync(emailAddress), Times.Once);
    }

    [Theory, AutoData]
    public async Task Discover_WithInvalidEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new AutodiscoverRequest { EmailAddress = "invalid-email" };

        // Act
        var result = await _controller.Discover(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Theory, AutoData]
    public async Task DiscoverManual_WithValidInput_ReturnsSuccessResponse(string emailAddress, string serverInput)
    {
        // Arrange
        var expectedConfig = new ExchangeServerConfig
        {
            EwsUrl = $"https://{serverInput}/EWS/Exchange.asmx",
            ServerHost = serverInput,
            ServerPort = 443,
            UseSsl = true,
            DisplayName = $"{serverInput} Exchange Server",
            AutodiscoverMethod = "Manual"
        };

        _mockAutodiscoverService.Setup(x => x.DiscoverManualAsync(emailAddress, serverInput))
            .ReturnsAsync(expectedConfig);

        var request = new ManualDiscoverRequest
        {
            EmailAddress = emailAddress,
            ServerInput = serverInput
        };

        // Act
        var result = await _controller.DiscoverManual(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        _mockAutodiscoverService.Verify(x => x.DiscoverManualAsync(emailAddress, serverInput), Times.Once);
    }

    [Theory, AutoData]
    public async Task TestConnection_WithValidConnection_ReturnsSuccess(string emailAddress, string password)
    {
        // Arrange
        var serverConfig = Fixture.Create<ExchangeServerConfig>();
        serverConfig.EwsUrl = "https://outlook.office365.com/EWS/Exchange.asmx";

        _mockConnectionTestingService.Setup(x => x.TestConnectionAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<ExchangeServerConfig>()))
            .ReturnsAsync((true, "Connection successful"));

        var request = new TestConnectionRequest
        {
            EmailAddress = emailAddress,
            Password = password,
            ServerConfig = serverConfig
        };

        // Act
        var result = await _controller.TestConnection(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        _mockConnectionTestingService.Verify(x => x.TestConnectionAsync(
            emailAddress, password, It.IsAny<ExchangeServerConfig>()), Times.Once);
    }

    [Fact]
    public async Task Discover_WithNullRequest_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.Discover(null!);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Theory, AutoData]
    public async Task Discover_WhenServiceFails_ReturnsFailureResponse(string emailAddress)
    {
        // Arrange
        _mockAutodiscoverService.Setup(x => x.DiscoverAsync(emailAddress))
            .ReturnsAsync((ExchangeServerConfig?)null);

        var request = new AutodiscoverRequest { EmailAddress = emailAddress };

        // Act
        var result = await _controller.Discover(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult?.Value.Should().NotBeNull();
    }
}