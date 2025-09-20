# POSTA Email Client

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Development Workflow](#development-workflow)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

POSTA is a modern, enterprise-grade email client application designed to provide a comprehensive email management experience similar to Outlook or Apple Mail. The application supports multiple email protocols (IMAP and Exchange Web Services) and offers features like automatic server discovery, email synchronization, real-time updates, and offline support.

### Key Features
- **Direct Email Account Setup**: No registration required - users can immediately add their email accounts
- **Multi-Protocol Support**: Works with IMAP and Exchange Web Services (EWS)
- **Automatic Server Discovery**: Automatically detects email server configurations via Exchange Autodiscovery
- **Manual Configuration**: Fallback support for custom server settings
- **Real-time Updates**: Live email synchronization with SignalR
- **Progressive Web App**: Offline functionality and mobile-responsive design
- **Multi-tenant Architecture**: Scalable for enterprise deployments

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular 17    │    │  ASP.NET Core 8 │    │   PostgreSQL    │
│    Frontend     │◄──►│    Web API      │◄──►│    Database     │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    └─────────────────┘
│ • NgRx Store    │    │ • Clean Arch    │
│ • Angular Mat   │    │ • EF Core       │    ┌─────────────────┐
│ • SignalR Client│    │ • MailKit       │    │  Email Servers  │
│ • Service Worker│    │ • EWS           │◄──►│ • IMAP/SMTP     │
│ • PWA           │    │ • SignalR Hubs  │    │ • Exchange      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture
- **Framework**: Angular 17 with standalone components and signals
- **State Management**: NgRx for complex state management with feature-based modules
- **UI Framework**: Angular Material for consistent design system
- **Progressive Web App**: Service worker support with offline caching
- **Real-time Communication**: SignalR client integration for live updates
- **Build System**: Angular CLI with Vite for fast development

### Backend Architecture
- **Framework**: ASP.NET Core 8 Web API with clean architecture pattern
- **Project Structure**: Layered architecture with Core, Infrastructure, and API projects
- **Email Protocols**: MailKit for IMAP/SMTP and Exchange Web Services for Microsoft Exchange
- **Real-time**: SignalR hubs for push notifications and live updates
- **Authentication**: JWT Bearer token authentication with refresh token support
- **Database**: Entity Framework Core with PostgreSQL

## Technology Stack

### Frontend Dependencies
```json
{
  "core": [
    "@angular/core": "^17.3.0",
    "@angular/material": "^17.3.10",
    "@angular/cdk": "^17.3.10",
    "@angular/service-worker": "^17.3.12"
  ],
  "state-management": [
    "@ngrx/store": "^17.2.0",
    "@ngrx/effects": "^17.2.0",
    "@ngrx/entity": "^17.2.0",
    "@ngrx/store-devtools": "^17.2.0"
  ],
  "real-time": [
    "@microsoft/signalr": "^8.0.17"
  ],
  "development": [
    "@angular/cli": "^17.3.17",
    "typescript": "~5.4.2",
    "express": "^5.1.0"
  ]
}
```

### Backend Dependencies
```xml
<!-- Core Framework -->
<PackageReference Include="Microsoft.NET.Sdk.Web" Version="8.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.11" />
<PackageReference Include="Microsoft.AspNetCore.SignalR" Version="1.2.0" />

<!-- Email Protocols -->
<PackageReference Include="MailKit" Version="4.8.0" />
<PackageReference Include="Exchange.WebServices.NETCore" Version="3.1.0" />

<!-- Database -->
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.11" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.11" />

<!-- API Documentation -->
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.8.1" />
```

## Project Structure

```
POSTA/
├── frontend/                          # Angular 17 Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                 # Core services, guards, interceptors
│   │   │   │   ├── guards/           # Route guards (auth.guard.ts)
│   │   │   │   ├── interceptors/     # HTTP interceptors (auth, error)
│   │   │   │   ├── models/           # TypeScript interfaces and models
│   │   │   │   └── services/         # Core services (auth, email, account)
│   │   │   ├── features/             # Feature modules
│   │   │   │   ├── accounts/         # Account management
│   │   │   │   │   └── add-account/  # Multi-step account setup wizard
│   │   │   │   │       └── steps/    # Individual wizard steps
│   │   │   │   ├── auth/             # Authentication (login/register)
│   │   │   │   ├── email/            # Email management (list, detail, compose)
│   │   │   │   └── settings/         # Application settings
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── header/           # Application header
│   │   │   │   ├── sidebar/          # Navigation sidebar
│   │   │   │   └── main-layout/      # Main layout wrapper
│   │   │   ├── shared/               # Shared components, directives, pipes
│   │   │   ├── store/                # NgRx state management
│   │   │   │   ├── accounts/         # Account management state
│   │   │   │   ├── auth/             # Authentication state
│   │   │   │   ├── email/            # Email state
│   │   │   │   └── ui/               # UI state
│   │   │   ├── app.component.*       # Root component
│   │   │   ├── app.config.ts         # App configuration
│   │   │   └── app.routes.ts         # Routing configuration
│   │   ├── environments/             # Environment configurations
│   │   ├── assets/                   # Static assets
│   │   └── styles/                   # Global styles
│   ├── proxy-server.js               # Development proxy server
│   ├── package.json                  # Frontend dependencies
│   ├── angular.json                  # Angular CLI configuration
│   └── tsconfig.json                 # TypeScript configuration
├── src/                              # .NET Backend Application
│   ├── POSTA.Api/                    # Web API Layer
│   │   ├── Controllers/              # API Controllers
│   │   │   ├── AccountsController.cs # Account management endpoints
│   │   │   ├── AuthController.cs     # Authentication endpoints
│   │   │   ├── EmailsController.cs   # Email operations endpoints
│   │   │   └── EmailTestController.cs# Email testing endpoints
│   │   ├── Properties/               # Launch settings
│   │   ├── appsettings.json          # Configuration files
│   │   ├── Program.cs                # Application entry point
│   │   └── POSTA.Api.csproj          # Project file
│   ├── POSTA.Core/                   # Domain Layer
│   │   ├── Entities/                 # Domain entities
│   │   │   ├── EmailAccount.cs       # Email account entity
│   │   │   ├── EmailMessage.cs       # Email message entity
│   │   │   ├── EmailAttachment.cs    # Email attachment entity
│   │   │   ├── EmailDraft.cs         # Email draft entity
│   │   │   └── User.cs               # User entity
│   │   ├── Interfaces/               # Service interfaces
│   │   │   ├── IEmailProtocolService.cs
│   │   │   └── IExchangeAutodiscoverService.cs
│   │   └── POSTA.Core.csproj         # Project file
│   └── POSTA.Infrastructure/         # Infrastructure Layer
│       ├── Data/                     # Database context
│       │   └── POSTADbContext.cs     # Entity Framework context
│       ├── Email/                    # Email service implementations
│       │   ├── Services/             # Email protocol services
│       │   │   ├── EmailSyncService.cs
│       │   │   ├── EwsEmailService.cs
│       │   │   ├── ExchangeAutodiscoverService.cs
│       │   │   └── ImapEmailService.cs
│       │   └── Interfaces/           # Service interfaces
│       └── POSTA.Infrastructure.csproj # Project file
├── tests/                            # Test Projects
│   └── POSTA.Tests/                  # Unit and integration tests
├── POSTA.sln                         # Solution file
├── package-lock.json                 # Root package lock file
├── replit.md                         # Replit configuration
└── README.md                         # This file
```

## Prerequisites

### Development Environment
- **Node.js**: v18.x or higher (for Angular development)
- **npm**: v8.x or higher
- **.NET 8 SDK**: Latest stable version
- **PostgreSQL**: v13 or higher (or use Replit's managed database)

### Recommended Tools
- **Visual Studio Code** with extensions:
  - Angular Language Service
  - C# Dev Kit
  - PostgreSQL Explorer
  - GitLens
- **Postman** or **Insomnia** for API testing
- **Angular DevTools** browser extension
- **Redux DevTools** browser extension

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd POSTA
```

### 2. Backend Setup
```bash
# Navigate to the API project
cd src/POSTA.Api

# Restore .NET packages
dotnet restore

# Build the solution
dotnet build

# Setup database (see Database Setup section)
dotnet ef database update
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Build the application
npm run build
```

### 4. Environment Configuration
Create environment files based on the templates provided in the Configuration section.

## Development Workflow

### 1. Start Development Servers

#### Option A: Using Replit Workflows (Recommended)
The project is configured with three Replit workflows that start automatically:
- **Angular Frontend Server**: Serves the Angular app on port 5173
- **POSTA C# API Server**: Runs the .NET API on port 3000
- **POSTA Proxy Server**: Handles API routing during development

#### Option B: Manual Startup
```bash
# Terminal 1: Start the backend API
cd src/POSTA.Api
dotnet run --urls="http://0.0.0.0:3000"

# Terminal 2: Start the frontend development server
cd frontend
npm start -- --host 0.0.0.0 --port 5173

# Terminal 3: Start the proxy server (if needed)
cd frontend
node proxy-server.js
```

### 2. Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/swagger

### 3. Development Features
- **Hot Module Replacement**: Changes to Angular code are reflected immediately
- **API Auto-reload**: .NET API restarts automatically on code changes
- **CORS Configuration**: Properly configured for development environment
- **Source Maps**: Available for debugging in both frontend and backend

## Configuration

### Environment Variables
Create the following configuration files:

#### Frontend Environment (`frontend/src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  signalRUrl: 'http://localhost:3000/emailHub',
  features: {
    pushNotifications: false, // Set to true when SignalR hub is implemented
    offlineMode: true,
    darkMode: true
  }
};
```

#### Backend Configuration (`src/POSTA.Api/appsettings.Development.json`)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=posta_dev;Username=postgres;Password=yourpassword"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-here-minimum-32-characters",
    "Issuer": "POSTA",
    "Audience": "POSTA-Users",
    "ExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:4200"]
  }
}
```

### Database Configuration

#### Using Replit's Managed PostgreSQL (Recommended)
The project is configured to use Replit's built-in PostgreSQL database with the following environment variables:
- `DATABASE_URL`: Complete connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Individual connection parameters

#### Manual PostgreSQL Setup
```bash
# Create database
createdb posta_dev

# Run migrations
cd src/POSTA.Api
dotnet ef database update
```

#### Entity Framework Migrations
```bash
# Create a new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration (if not applied)
dotnet ef migrations remove
```

## API Documentation

### Authentication Endpoints
```
POST /api/auth/login        # User login
POST /api/auth/register     # User registration
POST /api/auth/refresh      # Refresh JWT token
POST /api/auth/logout       # User logout
```

### Account Management Endpoints
```
POST /api/accounts/discover              # Auto-discover email server settings
POST /api/accounts/discover-manual       # Manual server discovery
POST /api/accounts/test-connection       # Test email server connection
POST /api/accounts                       # Create email account
GET  /api/accounts                       # Get user's email accounts
PUT  /api/accounts/{id}                  # Update email account
DELETE /api/accounts/{id}                # Delete email account
```

### Email Management Endpoints
```
GET    /api/emails                       # Get emails for account
GET    /api/emails/{id}                  # Get specific email
POST   /api/emails                       # Send new email
PUT    /api/emails/{id}                  # Update email (mark as read, etc.)
DELETE /api/emails/{id}                  # Delete email
GET    /api/emails/sync                  # Trigger email synchronization
```

### Request/Response Examples

#### Auto-discover Email Server
```http
POST /api/accounts/discover
Content-Type: application/json

{
  "emailAddress": "user@example.com"
}
```

```json
{
  "success": true,
  "config": {
    "serverHost": "outlook.office365.com",
    "serverPort": 993,
    "useSsl": true,
    "autodiscoverMethod": "ExchangeWebServices",
    "displayName": "Microsoft Exchange",
    "ewsUrl": "https://outlook.office365.com/EWS/Exchange.asmx"
  },
  "triedUrls": [
    "https://autodiscover.example.com/autodiscover/autodiscover.xml",
    "https://example.com/autodiscover/autodiscover.xml"
  ]
}
```

#### Create Email Account
```http
POST /api/accounts
Content-Type: application/json

{
  "emailAddress": "user@example.com",
  "password": "userpassword",
  "displayName": "John Doe",
  "accountName": "Work Email",
  "serverConfig": {
    "serverHost": "outlook.office365.com",
    "serverPort": 993,
    "useSsl": true,
    "ewsUrl": "https://outlook.office365.com/EWS/Exchange.asmx"
  }
}
```

## Frontend Development

### NgRx State Management

#### Store Structure
```typescript
interface AppState {
  auth: AuthState;
  accounts: AccountsState;
  email: EmailState;
  ui: UIState;
}
```

#### Account Setup Flow
```typescript
// 1. Submit email for discovery
store.dispatch(AccountsActions.submitEmailForDiscovery({ 
  emailAddress: 'user@example.com' 
}));

// 2. Handle discovery result
store.select(selectDiscoveryResult).subscribe(result => {
  if (result.success) {
    // Proceed to authentication step
  } else {
    // Show manual configuration option
  }
});

// 3. Submit credentials
store.dispatch(AccountsActions.submitCredentials({
  credentials: { username, password, accountName, displayName }
}));

// 4. Test connection and create account
store.dispatch(AccountsActions.testConnection());
store.dispatch(AccountsActions.createAccount());
```

### Component Architecture

#### Account Setup Wizard
```typescript
@Component({
  selector: 'app-add-account',
  template: `
    <mat-stepper [linear]="true">
      <mat-step [completed]="isStepCompleted('email')">
        <app-email-step 
          (emailSubmitted)="onEmailSubmitted($event)">
        </app-email-step>
      </mat-step>
      
      <mat-step [completed]="isStepCompleted('discovery')">
        <app-discovery-step
          [discoveryResult]="discoveryResult$ | async"
          (proceedToManual)="onProceedToManual()">
        </app-discovery-step>
      </mat-step>
      
      <!-- Additional steps... -->
    </mat-stepper>
  `
})
export class AddAccountComponent {
  discoveryResult$ = this.store.select(selectDiscoveryResult);
  
  onEmailSubmitted(email: string): void {
    this.store.dispatch(AccountsActions.submitEmailForDiscovery({ 
      emailAddress: email 
    }));
  }
}
```

### Styling and Theming

#### Angular Material Theming
```scss
// Custom theme configuration
@use '@angular/material' as mat;

$custom-primary: mat.define-palette(mat.$indigo-palette);
$custom-accent: mat.define-palette(mat.$pink-palette);
$custom-warn: mat.define-palette(mat.$red-palette);

$custom-theme: mat.define-light-theme((
  color: (
    primary: $custom-primary,
    accent: $custom-accent,
    warn: $custom-warn,
  )
));

@include mat.all-component-themes($custom-theme);
```

## Backend Development

### Clean Architecture Principles

#### Project Dependencies
```
POSTA.Api (Presentation)
    ↓ depends on
POSTA.Infrastructure (Infrastructure)
    ↓ depends on
POSTA.Core (Domain)
```

#### Dependency Injection Setup
```csharp
// Program.cs
builder.Services.AddDbContext<POSTADbContext>(options =>
    options.UseNpgsql(connectionString));

// Register email services
builder.Services.AddScoped<IEmailProtocolService, ImapEmailService>();
builder.Services.AddScoped<IEmailProtocolService, EwsEmailService>();
builder.Services.AddScoped<IExchangeAutodiscoverService, ExchangeAutodiscoverService>();
builder.Services.AddScoped<EmailSyncService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### Email Protocol Implementation

#### IMAP Service Example
```csharp
public class ImapEmailService : IEmailProtocolService
{
    public async Task<List<EmailMessage>> GetEmailsAsync(
        EmailAccount account, 
        int skip = 0, 
        int take = 50)
    {
        using var client = new ImapClient();
        await client.ConnectAsync(account.ServerHost, account.ServerPort, account.UseSsl);
        await client.AuthenticateAsync(account.EmailAddress, account.Password);
        
        var inbox = client.Inbox;
        await inbox.OpenAsync(FolderAccess.ReadOnly);
        
        var messages = new List<EmailMessage>();
        var uids = await inbox.SearchAsync(SearchQuery.All);
        
        foreach (var uid in uids.Skip(skip).Take(take))
        {
            var message = await inbox.GetMessageAsync(uid);
            messages.Add(MapToEmailMessage(message, uid));
        }
        
        await client.DisconnectAsync(true);
        return messages;
    }
}
```

#### Exchange Web Services Implementation
```csharp
public class EwsEmailService : IEmailProtocolService
{
    public async Task<List<EmailMessage>> GetEmailsAsync(
        EmailAccount account, 
        int skip = 0, 
        int take = 50)
    {
        var service = new ExchangeService(ExchangeVersion.Exchange2013_SP1)
        {
            Credentials = new WebCredentials(account.EmailAddress, account.Password),
            Url = new Uri(account.EwsUrl)
        };

        var findResults = await service.FindItems(
            WellKnownFolderName.Inbox,
            new ItemView(take, skip));

        var messages = new List<EmailMessage>();
        foreach (var item in findResults)
        {
            if (item is EmailMessage ewsMessage)
            {
                messages.Add(MapToEmailMessage(ewsMessage));
            }
        }

        return messages;
    }
}
```

## Testing

### Frontend Testing

#### Unit Tests with Jasmine/Karma
```bash
# Run unit tests
cd frontend
npm test

# Run tests with code coverage
npm test -- --code-coverage

# Run tests in watch mode
npm test -- --watch
```

#### Example Component Test
```typescript
describe('EmailStepComponent', () => {
  let component: EmailStepComponent;
  let fixture: ComponentFixture<EmailStepComponent>;
  let mockStore: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmailStepComponent],
      providers: [provideMockStore({ initialState: mockInitialState })]
    });

    fixture = TestBed.createComponent(EmailStepComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
  });

  it('should emit emailSubmitted when form is valid', () => {
    spyOn(component.emailSubmitted, 'emit');
    
    component.emailForm.patchValue({ email: 'test@example.com' });
    component.onSubmit();

    expect(component.emailSubmitted.emit).toHaveBeenCalledWith('test@example.com');
  });
});
```

### Backend Testing

#### Unit Tests with xUnit
```bash
# Run backend tests
cd tests/POSTA.Tests
dotnet test

# Run tests with code coverage
dotnet test --collect:"XPlat Code Coverage"
```

#### Example Service Test
```csharp
public class ExchangeAutodiscoverServiceTests
{
    [Fact]
    public async Task DiscoverAsync_ValidEmail_ReturnsSuccessResult()
    {
        // Arrange
        var service = new ExchangeAutodiscoverService();
        var request = new AutodiscoverRequest 
        { 
            EmailAddress = "test@example.com" 
        };

        // Act
        var result = await service.DiscoverAsync(request);

        // Assert
        Assert.NotNull(result);
        // Additional assertions...
    }
}
```

### Integration Testing

#### API Integration Tests
```csharp
public class AccountsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AccountsControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Discover_ValidEmail_ReturnsOkResult()
    {
        // Arrange
        var request = new AutodiscoverRequest 
        { 
            EmailAddress = "test@example.com" 
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/accounts/discover", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<AutodiscoverResponse>();
        Assert.NotNull(result);
    }
}
```

## Deployment

### Replit Deployment (Recommended)

#### Configure Deployment Settings
```typescript
// Use deploy_config_tool to configure:
{
  "deployment_target": "autoscale", // For stateless web applications
  "run": ["dotnet", "run", "--project", "src/POSTA.Api", "--urls", "http://0.0.0.0:5000"],
  "build": ["npm", "run", "build:prod"]
}
```

#### Production Build Script
```bash
#!/bin/bash
# Build frontend for production
cd frontend
npm ci
npm run build

# Build backend for production
cd ../src/POSTA.Api
dotnet publish -c Release -o publish

# Copy frontend dist to backend wwwroot
cp -r ../../frontend/dist/* publish/wwwroot/
```

### Manual Deployment

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app
COPY src/ ./src/
RUN dotnet restore src/POSTA.Api/POSTA.Api.csproj
RUN dotnet publish src/POSTA.Api/POSTA.Api.csproj -c Release -o out

FROM base AS final
WORKDIR /app
COPY --from=backend-build /app/out .
COPY --from=frontend-build /app/frontend/dist ./wwwroot
ENTRYPOINT ["dotnet", "POSTA.Api.dll"]
```

#### Environment Variables for Production
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET_KEY=your-production-secret-key
JWT_ISSUER=POSTA
JWT_AUDIENCE=POSTA-Users

# CORS Settings
ALLOWED_ORIGINS=https://yourdomain.com

# Email Settings
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USE_SSL=true
```

## Troubleshooting

### Common Issues and Solutions

#### Frontend Issues

**Issue**: FormGroup errors when submitting email form
```
ERROR: NG01050: formControlName must be used with a parent formGroup directive
```
**Solution**: Ensure FormGroup initialization happens in `ngOnInit()` lifecycle hook:
```typescript
export class MyComponent implements OnInit {
  myForm!: FormGroup;

  ngOnInit(): void {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
}
```

**Issue**: SignalR connection errors
```
Error: Failed to complete negotiation with the server: Error: 404
```
**Solution**: Ensure SignalR is properly configured or disabled:
```typescript
// environment.ts
export const environment = {
  features: {
    pushNotifications: false // Disable if SignalR hub not implemented
  }
};
```

**Issue**: CORS errors in development
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**: Check CORS configuration in backend:
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

#### Backend Issues

**Issue**: Database connection errors
```
Npgsql.NpgsqlException: Connection refused
```
**Solution**: Verify database connection string and ensure PostgreSQL is running:
```bash
# Check PostgreSQL status
systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d posta_dev
```

**Issue**: Email autodiscovery fails
```
warn: Autodiscovery failed for email@domain.com. Tried 8 URLs.
```
**Solution**: This is normal behavior for domains without autodiscovery support. The application should proceed to manual configuration.

**Issue**: Entity Framework migration errors
```
Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while updating the entries
```
**Solution**: Reset database and apply migrations:
```bash
dotnet ef database drop
dotnet ef database update
```

### Debugging Tips

#### Frontend Debugging
```typescript
// Enable NgRx debugging
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  imports: [
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    })
  ]
})
```

#### Backend Debugging
```csharp
// Enable detailed logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);
```

### Performance Optimization

#### Frontend Optimization
- Enable OnPush change detection strategy
- Use Angular Material's virtual scrolling for large email lists
- Implement lazy loading for feature modules
- Use service workers for offline functionality

#### Backend Optimization
- Implement email caching with Redis
- Use background services for email synchronization
- Add database indexing for email queries
- Implement pagination for large result sets

## Contributing

### Development Guidelines

#### Code Style
- **Frontend**: Follow Angular style guide and use Prettier for formatting
- **Backend**: Follow Microsoft C# coding conventions and use EditorConfig
- **Commit Messages**: Use conventional commits format

#### Branch Strategy
```
main                    # Production-ready code
├── develop            # Integration branch
├── feature/feature-name # Feature development
├── bugfix/issue-name   # Bug fixes
└── hotfix/issue-name   # Critical production fixes
```

#### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit pull request with description
6. Code review and approval
7. Merge to `develop`

### Testing Requirements
- Minimum 80% code coverage for new features
- All existing tests must pass
- Add integration tests for API endpoints
- Add unit tests for components and services

### Documentation Requirements
- Update README for new features
- Add JSDoc/XML comments for public APIs
- Update API documentation in Swagger
- Add troubleshooting entries for known issues

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Quick Start Checklist

- [ ] Clone repository
- [ ] Install Node.js 18+ and .NET 8 SDK
- [ ] Run `npm install` in frontend directory
- [ ] Run `dotnet restore` in src/POSTA.Api directory
- [ ] Configure environment variables
- [ ] Setup PostgreSQL database
- [ ] Run database migrations: `dotnet ef database update`
- [ ] Start development servers (or use Replit workflows)
- [ ] Visit http://localhost:5173 to access the application
- [ ] Check API documentation at http://localhost:3000/swagger

For additional help, refer to the [Troubleshooting](#troubleshooting) section or create an issue in the repository.