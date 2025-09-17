using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using POSTA.Infrastructure.Data;
using POSTA.Core.Interfaces;
using POSTA.Infrastructure.Email.Services;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "POSTA",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "POSTA-Clients",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "POSTA-JWT-Secret-Key-2024-Super-Secure"))
        };
    });

builder.Services.AddAuthorization();

// Email Services
builder.Services.AddScoped<EwsEmailService>();
builder.Services.AddScoped<ImapEmailService>();
builder.Services.AddScoped<IEmailSyncService, EmailSyncService>();
builder.Services.AddHostedService<EmailSyncBackgroundService>();

// Autodiscovery Services
builder.Services.AddHttpClient<IExchangeAutodiscoverService, ExchangeAutodiscoverService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "POSTA Email Client/1.0");
});
builder.Services.AddScoped<IExchangeAutodiscoverService, ExchangeAutodiscoverService>();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
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