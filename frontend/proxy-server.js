const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// API Proxy - Route API calls to C# backend on port 3000
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  logLevel: 'debug'
}));

// Frontend Proxy - Route everything else to Angular on port 5173  
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true
}));

const PORT = 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 POSTA Host-Fix Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Forwarding to Angular dev server on http://localhost:5173`);
  console.log(`🔧 Rewriting Host headers to bypass Vite host blocking`);
  console.log(`🌐 Replit Webview will connect here - HOST BLOCKING SOLVED!`);
});

// WebSocket upgrades are handled by the middleware (ws: true)