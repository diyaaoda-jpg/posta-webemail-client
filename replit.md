# POSTA Email Client

## Overview

POSTA is a modern, enterprise-grade email client application built with Angular frontend and ASP.NET Core backend. The application supports multiple email protocols (IMAP and Exchange Web Services) and provides a comprehensive email management experience with features like account setup, email synchronization, real-time updates, and offline support.

The system is designed to handle email accounts from various providers through automatic server discovery and manual configuration, with a focus on user experience and enterprise-level functionality including multi-tenant support, progressive web app capabilities, and scalable architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Angular 17 with standalone components and signals
- **State Management**: NgRx for complex state management with feature-based modules (auth, email, accounts, UI)
- **UI Framework**: Angular Material for consistent design system
- **Progressive Web App**: Service worker support with offline caching strategies
- **Real-time Communication**: SignalR client integration for live email updates
- **Build System**: Angular CLI with Vite configuration for development server hosting

### Backend Architecture  
- **Framework**: ASP.NET Core 8 Web API with clean architecture pattern
- **Project Structure**: Layered architecture with separate Core, Infrastructure, and API projects
- **Email Protocols**: MailKit for IMAP support and Exchange Web Services for Microsoft Exchange
- **Real-time**: SignalR hubs for push notifications and live updates
- **Authentication**: JWT Bearer token authentication with refresh token support

### Data Management
- **ORM**: Entity Framework Core with PostgreSQL provider
- **Database**: Configured for PostgreSQL with Drizzle ORM toolkit support
- **Migrations**: Entity Framework migrations for schema management
- **Data Models**: Comprehensive email entities including messages, accounts, attachments, and user management

### Account Setup Flow
- **Autodiscovery**: Automatic email server configuration detection
- **Manual Configuration**: Support for custom server settings
- **Multi-step Wizard**: Guided setup process with discovery, testing, and account creation steps
- **Provider Support**: Built-in support for major email providers with fallback to manual configuration

### State Management Strategy
- **Feature-based Stores**: Separate NgRx stores for auth, email, accounts, and UI concerns
- **Effects**: Async operation handling with comprehensive error management
- **Selectors**: Computed state derivation with memoization
- **Local Storage**: Token persistence and offline state management

### Development Environment
- **Proxy Configuration**: Express proxy server for API routing during development
- **Hot Module Replacement**: Vite-based development server with WebSocket support
- **Host Configuration**: Replit-specific networking configuration with allowed hosts and CORS setup

## External Dependencies

### Core Framework Dependencies
- **Angular Ecosystem**: Angular 17 with Material Design, CDK, Service Worker, and PWA support
- **State Management**: NgRx store, effects, entity management, and developer tools
- **HTTP Client**: Angular HTTP client with interceptor support for authentication and error handling

### Email Protocol Libraries
- **MailKit**: .NET library for IMAP email protocol communication
- **Exchange Web Services**: Microsoft Exchange server integration
- **MimeKit**: Email message parsing and manipulation

### Database and ORM
- **Entity Framework Core**: .NET ORM with PostgreSQL provider (Npgsql)
- **Drizzle Kit**: Database schema management and migration toolkit
- **PostgreSQL**: Primary database system for data persistence

### Real-time Communication
- **Microsoft SignalR**: Client and server libraries for WebSocket-based real-time communication
- **WebSocket Support**: Browser WebSocket API integration for live updates

### Development and Build Tools
- **Angular CLI**: Project scaffolding, build, and development tools
- **Vite**: Fast development server with HMR support
- **Express**: Proxy server for development environment routing
- **TypeScript**: Type-safe JavaScript development

### Authentication and Security
- **JWT Bearer Tokens**: Stateless authentication with refresh token rotation
- **ASP.NET Core Identity**: User management and authentication infrastructure
- **CORS Configuration**: Cross-origin resource sharing for frontend-backend communication

### Testing and Quality
- **Jasmine & Karma**: Frontend unit testing framework
- **xUnit**: Backend unit testing framework
- **Coverlet**: Code coverage analysis for .NET

### Deployment and Hosting
- **Replit**: Cloud development and hosting platform
- **Service Worker**: Offline functionality and caching strategies
- **Progressive Web App**: Mobile-responsive application with native-like experience