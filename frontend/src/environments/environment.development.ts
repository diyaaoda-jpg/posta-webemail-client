export const environment = {
  production: false,
  apiUrl: 'https://9d0463bd-8440-4942-a724-35e1e5db2bfe-00-2af0n2x3k6h0i.janeway.replit.dev:3000', // Backend C# API on Replit
  appName: 'POSTA Email Client (Dev)',
  version: '1.0.0-dev',
  signalRUrl: 'https://9d0463bd-8440-4942-a724-35e1e5db2bfe-00-2af0n2x3k6h0i.janeway.replit.dev:3000/emailHub', // SignalR hub on Replit
  features: {
    offlineSupport: true,
    pushNotifications: false, // Disabled in development
    darkMode: true,
    richTextEditor: true
  },
  debug: {
    enableLogging: true,
    enableStateDevtools: true,
    enableMockData: false
  }
};