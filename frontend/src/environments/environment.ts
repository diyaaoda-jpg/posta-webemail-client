export const environment = {
  production: false,
  apiUrl: '', // Use relative URLs - requests will go through the proxy
  appName: 'POSTA Email Client',
  version: '1.0.0',
  signalRUrl: 'https://9d0463bd-8440-4942-a724-35e1e5db2bfe-00-2af0n2x3k6h0i.janeway.replit.dev:3000/emailHub', // SignalR hub on Replit
  features: {
    offlineSupport: true,
    pushNotifications: true,
    darkMode: true,
    richTextEditor: true
  },
  debug: {
    enableLogging: false,
    enableStateDevtools: false,
    enableMockData: false
  }
};