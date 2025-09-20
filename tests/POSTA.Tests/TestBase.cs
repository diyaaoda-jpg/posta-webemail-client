using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using POSTA.Infrastructure.Data;
using AutoFixture;
using AutoFixture.AutoMoq;

namespace POSTA.Tests;

public abstract class TestBase : IDisposable
{
    protected readonly IFixture Fixture;
    protected readonly POSTADbContext DbContext;
    protected readonly Mock<ILogger> MockLogger;

    protected TestBase()
    {
        Fixture = new Fixture().Customize(new AutoMoqCustomization());

        // Setup in-memory database
        var options = new DbContextOptionsBuilder<POSTADbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        DbContext = new POSTADbContext(options);

        // Setup mock logger
        MockLogger = new Mock<ILogger>();

        // Configure AutoFixture to avoid circular references
        Fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => Fixture.Behaviors.Remove(b));
        Fixture.Behaviors.Add(new OmitOnRecursionBehavior());
    }

    public void Dispose()
    {
        DbContext?.Dispose();
    }
}