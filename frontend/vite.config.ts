import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true, // allow Replit preview domains
    hmr: { protocol: 'wss', clientPort: 443 }
  }
});