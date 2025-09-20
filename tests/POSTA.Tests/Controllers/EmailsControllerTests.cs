using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using POSTA.Api.Controllers;
using POSTA.Core.Entities;
using AutoFixture.Xunit2;

namespace POSTA.Tests.Controllers;

public class EmailsControllerTests : TestBase
{
    private readonly EmailsController _controller;
    private readonly Mock<ILogger<EmailsController>> _mockLogger;

    public EmailsControllerTests()
    {
        _mockLogger = new Mock<ILogger<EmailsController>>();
        _controller = new EmailsController(DbContext, _mockLogger.Object);
    }

    [Theory, AutoData]
    public async Task GetEmails_WithValidAccountId_ReturnsOkResult(Guid accountId)
    {
        // Arrange
        var emailMessages = Fixture.CreateMany<EmailMessage>(3).ToList();
        emailMessages.ForEach(e =>
        {
            e.AccountId = accountId;
            e.FolderName = "INBOX";
            e.IsDeleted = false;
        });

        await DbContext.EmailMessages.AddRangeAsync(emailMessages);
        await DbContext.SaveChangesAsync();

        // Act
        var result = await _controller.GetEmails(accountId);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
    }

    [Theory, AutoData]
    public async Task GetEmail_WithValidId_ReturnsEmail(Guid emailId)
    {
        // Arrange
        var email = Fixture.Create<EmailMessage>();
        email.Id = emailId;

        await DbContext.EmailMessages.AddAsync(email);
        await DbContext.SaveChangesAsync();

        // Act
        var result = await _controller.GetEmail(emailId);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedEmail = okResult?.Value as EmailMessage;
        returnedEmail?.Id.Should().Be(emailId);
    }

    [Theory, AutoData]
    public async Task GetEmail_WithInvalidId_ReturnsNotFound(Guid invalidId)
    {
        // Act
        var result = await _controller.GetEmail(invalidId);

        // Assert
        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Theory, AutoData]
    public async Task MarkAsRead_WithValidId_UpdatesReadStatus(Guid emailId, bool isRead)
    {
        // Arrange
        var email = Fixture.Create<EmailMessage>();
        email.Id = emailId;
        email.IsRead = !isRead;

        await DbContext.EmailMessages.AddAsync(email);
        await DbContext.SaveChangesAsync();

        // Act
        var result = await _controller.MarkAsRead(emailId, isRead);

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var updatedEmail = await DbContext.EmailMessages.FindAsync(emailId);
        updatedEmail?.IsRead.Should().Be(isRead);
    }

    [Theory, AutoData]
    public async Task ToggleFlag_WithValidId_UpdatesFlagStatus(Guid emailId, bool isFlagged)
    {
        // Arrange
        var email = Fixture.Create<EmailMessage>();
        email.Id = emailId;
        email.IsFlagged = !isFlagged;

        await DbContext.EmailMessages.AddAsync(email);
        await DbContext.SaveChangesAsync();

        // Act
        var result = await _controller.ToggleFlag(emailId, isFlagged);

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var updatedEmail = await DbContext.EmailMessages.FindAsync(emailId);
        updatedEmail?.IsFlagged.Should().Be(isFlagged);
    }

    [Theory, AutoData]
    public async Task MoveToFolder_WithValidId_MovesEmailToFolder(Guid emailId, string targetFolder)
    {
        // Arrange
        var email = Fixture.Create<EmailMessage>();
        email.Id = emailId;
        email.FolderName = "INBOX";

        await DbContext.EmailMessages.AddAsync(email);
        await DbContext.SaveChangesAsync();

        var request = new MoveEmailRequest { Folder = targetFolder };

        // Act
        var result = await _controller.MoveToFolder(emailId, request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var updatedEmail = await DbContext.EmailMessages.FindAsync(emailId);
        updatedEmail?.FolderName.Should().Be(targetFolder);
    }

    [Theory, AutoData]
    public async Task DeleteEmail_WithValidId_MarksEmailAsDeleted(Guid emailId)
    {
        // Arrange
        var email = Fixture.Create<EmailMessage>();
        email.Id = emailId;
        email.IsDeleted = false;

        await DbContext.EmailMessages.AddAsync(email);
        await DbContext.SaveChangesAsync();

        // Act
        var result = await _controller.DeleteEmail(emailId);

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var updatedEmail = await DbContext.EmailMessages.FindAsync(emailId);
        updatedEmail?.IsDeleted.Should().BeTrue();
    }
}