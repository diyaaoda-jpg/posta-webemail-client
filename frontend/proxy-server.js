const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// API Proxy - Route API calls to C# backend on port 3000
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Host', 'localhost');
    console.log(`🔗 API Request: ${req.method} ${req.url} → http://localhost:3000`);
  },
  onError: (err, req, res) => {
    console.error('❌ API Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).send('API Proxy Error: ' + err.message);
    }
  }
});

// Frontend Proxy - Route everything else to Angular on port 5173
const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying for HMR
  onProxyReq: (proxyReq, req, res) => {
    // Rewrite Host header to localhost to bypass Vite's host checking
    proxyReq.setHeader('Host', 'localhost');
    console.log(`✅ Frontend Request: ${req.method} ${req.url} → http://localhost:5173`);
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    // Also rewrite Host header for WebSocket connections (HMR)
    proxyReq.setHeader('Host', 'localhost');
    console.log(`🔄 WebSocket: ${req.url} → http://localhost:5173`);
  },
  onError: (err, req, res) => {
    console.error('❌ Frontend Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).send('Frontend Proxy Error: ' + err.message);
    }
  }
});

// Route API calls to C# backend, everything else to Angular
app.use('/api', apiProxy);
app.use('/', frontendProxy);

const PORT = 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 POSTA Host-Fix Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Forwarding to Angular dev server on http://localhost:5173`);
  console.log(`🔧 Rewriting Host headers to bypass Vite host blocking`);
  console.log(`🌐 Replit Webview will connect here - HOST BLOCKING SOLVED!`);
});

// Handle WebSocket upgrade for HMR
server.on('upgrade', frontendProxy.upgrade);