using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using POSTA.Infrastructure.Data;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Email.Services;
using POSTA.Api.Middleware;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
    .MinimumLevel.Override("POSTA", LogEventLevel.Debug)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "POSTA")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} <s:{SourceContext}>{NewLine}{Exception}")
    .WriteTo.File("logs/posta-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Configure port for deployment vs development
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Database
string GetConnectionString()
{
    var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(defaultConnection))
        return defaultConnection;
    
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (string.IsNullOrEmpty(databaseUrl))
        throw new InvalidOperationException("No database connection string found. Please set DATABASE_URL environment variable or DefaultConnection in configuration.");
    
    // Parse DATABASE_URL format: postgresql://user:password@host:port/database?options
    if (Uri.TryCreate(databaseUrl, UriKind.Absolute, out var uri) && uri.Scheme == "postgresql")
    {
        var userInfo = uri.UserInfo.Split(':');
        var database = uri.AbsolutePath.TrimStart('/');
        
        // Handle query parameters from the URL
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
        
        var port = uri.Port == -1 ? 5432 : uri.Port; // Default PostgreSQL port if not specified
        var connectionString = $"Host={uri.Host};Port={port};Database={database};Username={userInfo[0]}";
        
        if (userInfo.Length > 1)
        {
            connectionString += $";Password={Uri.UnescapeDataString(userInfo[1])}";
        }
        
        // Add SSL configuration
        if (query["sslmode"] != null)
        {
            connectionString += $";SSL Mode={query["sslmode"]}";
        }
        else if (!builder.Environment.IsDevelopment())
        {
            connectionString += ";SSL Mode=Require;Trust Server Certificate=true";
        }
        
        return connectionString;
    }
    
    // If it's already in the correct format, use it as is
    return databaseUrl;
}

builder.Services.AddDbContext<POSTADbContext>(options =>
    options.UseNpgsql(GetConnectionString()));

// Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? throw new InvalidOperationException("JWT secret key must be provided via configuration or JWT_SECRET_KEY environment variable");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? "POSTA";

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? "POSTA-Clients";

// Validate JWT key strength
if (jwtKey.Length < 32)
{
    throw new InvalidOperationException("JWT secret key must be at least 32 characters long for security");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1) // Reduce default clock skew
        };
    });

builder.Services.AddAuthorization();

// Email Services
builder.Services.AddScoped<EwsEmailService>();
builder.Services.AddScoped<ImapEmailService>();
builder.Services.AddScoped<IEmailSyncService, EmailSyncService>();
builder.Services.AddHostedService<EmailSyncBackgroundService>();

// Autodiscovery Services - HttpClient registration includes the service registration
builder.Services.AddHttpClient<IExchangeAutodiscoverService, POSTA.Infrastructure.Email.Services.ImprovedExchangeAutodiscoverService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "POSTA Email Client/1.0");
});

// Connection Testing Service
builder.Services.AddScoped<POSTA.Core.Interfaces.IEmailConnectionTestingService, POSTA.Infrastructure.Email.Services.EmailConnectionTestingService>();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("https://9d0463bd-8440-4942-a724-35e1e5db2bfe-00-2af0n2x3k6h0i.janeway.replit.dev")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR with authentication
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "POSTA Email API", Version = "v1" });
    
    // JWT Authentication for Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global exception handling
app.UseMiddleware<GlobalExceptionMiddleware>();

// Security headers middleware
app.Use(async (context, next) =>
{
    // Security headers
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

    // Remove server header for security
    context.Response.Headers.Remove("Server");

    await next();
});

// Request logging
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.GetLevel = (httpContext, elapsed, ex) => ex != null
        ? LogEventLevel.Error
        : httpContext.Response.StatusCode > 499
            ? LogEventLevel.Error
            : LogEventLevel.Information;
});

// Middleware pipeline
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Health check
app.MapGet("/health", () => new { 
    Status = "OK", 
    Timestamp = DateTime.UtcNow,
    Service = "POSTA Email API"
});

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<POSTADbContext>();
    try
    {
        context.Database.EnsureCreated();
        Console.WriteLine("✅ Database connection successful");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database connection failed: {ex.Message}");
    }
}

Console.WriteLine("🚀 POSTA API Server starting...");
Console.WriteLine("📧 Email API ready for connections");

// Force LSP refresh
app.Run();

// Make Program class accessible for integration tests
public partial class Program { }