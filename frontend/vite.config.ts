import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: [
      '9d0463bd-8440-4942-a724-35e1e5db2bfe-00-2af0n2x3k6h0i.janeway.replit.dev',
      '.replit.dev',
      'localhost'
    ],
    hmr: { 
      protocol: 'wss', 
      clientPort: 443,
      host: '9d0463bd-8440-4942-a724-35e1e5db2bfe-00-2af0n2x3k6h0i.janeway.replit.dev'
    }
  }
});