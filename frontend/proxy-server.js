const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Create proxy middleware for both HTTP and WebSocket (HMR)
const proxy = createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying for HMR
  onProxyReq: (proxyReq, req, res) => {
    // Rewrite Host header to localhost to bypass Vite's host checking
    proxyReq.setHeader('Host', 'localhost');
    console.log(`✅ Proxying ${req.method} ${req.url} with Host: localhost`);
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    // Also rewrite Host header for WebSocket connections (HMR)
    proxyReq.setHeader('Host', 'localhost');
    console.log(`🔄 Proxying WebSocket ${req.url} with Host: localhost`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).send('Proxy Error: ' + err.message);
    }
  }
});

// Apply proxy to all routes
app.use('/', proxy);

const PORT = 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 POSTA Host-Fix Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Forwarding to Angular dev server on http://localhost:5173`);
  console.log(`🔧 Rewriting Host headers to bypass Vite host blocking`);
  console.log(`🌐 Replit Webview will connect here - HOST BLOCKING SOLVED!`);
});

// Handle WebSocket upgrade for HMR
server.on('upgrade', proxy.upgrade);