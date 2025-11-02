#!/usr/bin/env node

/**
 * Pleading Sanity - Development Server Script
 * Enhanced development server with live reload and debugging features
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const chokidar = require('chokidar');
const WebSocket = require('ws');
const http = require('http');

class DevServer {
  constructor() {
    this.port = process.env.PORT || 3000;
    this.host = process.env.HOST || 'localhost';
    this.rootDir = path.join(__dirname, '..');
    this.app = express();
    this.server = null;
    this.wss = null;
    this.clients = new Set();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      server: '\x1b[35m',
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${colors[type]}[${timestamp}] [DEV-SERVER] ${message}${colors.reset}`);
  }

  setupMiddleware() {
    // Logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        const color = res.statusCode >= 400 ? 'error' : 
                     res.statusCode >= 300 ? 'warning' : 'success';
        this.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, color);
      });
      next();
    });

    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Development headers
    this.app.use((req, res, next) => {
      res.header('X-Dev-Server', 'Pleading Sanity Dev');
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      next();
    });
  }

  setupRoutes() {
    // Serve static files
    this.app.use('/assets', express.static(path.join(this.rootDir, 'assets')));
    this.app.use(express.static(this.rootDir));

    // API routes for development
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: 'development'
      });
    });

    // Journal vault API for development testing
    this.app.post('/api/journal', express.json(), (req, res) => {
      this.log('Journal entry received (dev mode)', 'info');
      res.json({ success: true, message: 'Journal entry saved (development)' });
    });

    // Development utilities
    this.app.get('/dev/reload', (req, res) => {
      this.broadcastReload();
      res.json({ message: 'Reload signal sent' });
    });

    this.app.get('/dev/clients', (req, res) => {
      res.json({ connectedClients: this.clients.size });
    });

    // Catch-all for SPA routing
    this.app.get('*', async (req, res) => {
      const filePath = path.join(this.rootDir, req.path);
      
      try {
        // Check if file exists
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          res.sendFile(filePath);
        } else {
          // Serve index.html for directory requests
          res.sendFile(path.join(this.rootDir, 'index.html'));
        }
      } catch (error) {
        // File not found, serve index.html (SPA fallback)
        try {
          res.sendFile(path.join(this.rootDir, 'index.html'));
        } catch (indexError) {
          res.status(404).json({ error: 'Page not found', path: req.path });
        }
      }
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      this.log(`Server error: ${error.message}`, 'error');
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  setupWebSocket() {
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      this.log(`WebSocket client connected (${this.clients.size} total)`, 'success');

      ws.on('close', () => {
        this.clients.delete(ws);
        this.log(`WebSocket client disconnected (${this.clients.size} remaining)`, 'info');
      });

      ws.on('error', (error) => {
        this.log(`WebSocket error: ${error.message}`, 'error');
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Pleading Sanity dev server',
        timestamp: new Date().toISOString()
      }));
    });
  }

  setupFileWatcher() {
    const watchPaths = [
      path.join(this.rootDir, '*.html'),
      path.join(this.rootDir, '*.css'),
      path.join(this.rootDir, '*.js'),
      path.join(this.rootDir, 'assets/**/*'),
      path.join(this.rootDir, 'Components/**/*')
    ];

    const watcher = chokidar.watch(watchPaths, {
      ignored: /node_modules|\.git|dist|coverage/,
      ignoreInitial: true,
      persistent: true
    });

    watcher.on('change', (filePath) => {
      const relativePath = path.relative(this.rootDir, filePath);
      this.log(`File changed: ${relativePath}`, 'info');
      this.broadcastReload({ file: relativePath, type: 'change' });
    });

    watcher.on('add', (filePath) => {
      const relativePath = path.relative(this.rootDir, filePath);
      this.log(`File added: ${relativePath}`, 'success');
      this.broadcastReload({ file: relativePath, type: 'add' });
    });

    watcher.on('unlink', (filePath) => {
      const relativePath = path.relative(this.rootDir, filePath);
      this.log(`File deleted: ${relativePath}`, 'warning');
      this.broadcastReload({ file: relativePath, type: 'delete' });
    });

    watcher.on('error', (error) => {
      this.log(`File watcher error: ${error.message}`, 'error');
    });

    this.log('File watcher initialized', 'success');
    return watcher;
  }

  broadcastReload(data = {}) {
    const message = JSON.stringify({
      type: 'reload',
      timestamp: new Date().toISOString(),
      ...data
    });

    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sentCount++;
      } else {
        this.clients.delete(client);
      }
    });

    if (sentCount > 0) {
      this.log(`Reload signal sent to ${sentCount} clients`, 'info');
    }
  }

  injectReloadScript(html) {
    const reloadScript = `
    <script>
      (function() {
        const ws = new WebSocket('ws://${this.host}:${this.port}');
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        
        ws.onopen = function() {
          console.log('%c[DEV] Connected to dev server', 'color: #00fff0');
          reconnectAttempts = 0;
        };
        
        ws.onmessage = function(event) {
          const data = JSON.parse(event.data);
          
          if (data.type === 'reload') {
            console.log('%c[DEV] Reloading...', 'color: #ff00ff');
            
            // Smart reload based on file type
            if (data.file && data.file.endsWith('.css')) {
              // Reload CSS without full page refresh
              const links = document.querySelectorAll('link[rel="stylesheet"]');
              links.forEach(link => {
                if (link.href.includes(data.file.replace('.css', ''))) {
                  const newHref = link.href.split('?')[0] + '?v=' + Date.now();
                  link.href = newHref;
                }
              });
            } else {
              // Full page reload for other files
              setTimeout(() => location.reload(), 100);
            }
          }
        };
        
        ws.onclose = function() {
          console.log('%c[DEV] Disconnected from dev server', 'color: #ffaa00');
          
          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
              console.log(\`%c[DEV] Reconnecting... (attempt \${reconnectAttempts})\`, 'color: #ffaa00');
              location.reload();
            }, 2000 * reconnectAttempts);
          }
        };
        
        ws.onerror = function(error) {
          console.error('%c[DEV] WebSocket error:', 'color: #ff0000', error);
        };
      })();
    </script>
    `;

    // Inject before closing body tag
    return html.replace('</body>', `${reloadScript}</body>`);
  }

  async start() {
    try {
      this.setupMiddleware();
      this.setupRoutes();

      // Create HTTP server
      this.server = http.createServer(this.app);

      // Setup WebSocket for live reload
      this.setupWebSocket();

      // Setup file watcher
      const watcher = this.setupFileWatcher();

      // Start server
      this.server.listen(this.port, this.host, () => {
        this.log('=====================================', 'server');
        this.log('🚀 Pleading Sanity Development Server', 'server');
        this.log('=====================================', 'server');
        this.log(`Local:   http://${this.host}:${this.port}`, 'success');
        this.log(`Network: http://localhost:${this.port}`, 'info');
        this.log('=====================================', 'server');
        this.log('Features:', 'info');
        this.log('  ✅ Live reload enabled', 'success');
        this.log('  ✅ File watching active', 'success');
        this.log('  ✅ CORS enabled', 'success');
        this.log('  ✅ Development APIs available', 'success');
        this.log('=====================================', 'server');
        this.log('Press Ctrl+C to stop the server', 'info');
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        this.log('Shutting down development server...', 'warning');
        
        watcher.close();
        this.wss.close();
        this.server.close(() => {
          this.log('Development server stopped', 'info');
          process.exit(0);
        });
      });

    } catch (error) {
      this.log(`Failed to start server: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run server if called directly
if (require.main === module) {
  const server = new DevServer();
  server.start().catch(error => {
    console.error('Failed to start development server:', error);
    process.exit(1);
  });
}

module.exports = DevServer;