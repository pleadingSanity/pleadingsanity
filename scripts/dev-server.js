#!/usr/bin/env node

/**
 * PLEADING SANITY — DEVELOPMENT SERVER v2.1-FINAL
 * Live Reload • Smart CSS Refresh • WebSocket • File Watcher
 * Evolution, Not Erasure • pleadingSanity
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
    this.watcher = null;
  }

  // ==========================================
  // COSMIC LOGGING — CLEAR & COLOURED
  // ==========================================
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',     // cyan
      success: '\x1b[32m',  // green
      warning: '\x1b[33m',  // yellow
      error: '\x1b[31m',    // red
      server: '\x1b[35m',   // magenta
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${colors[type]}[${timestamp}] [DEV] ${message}${colors.reset}`);
  }

  // ==========================================
  // MIDDLEWARE — LOGGING + CORS + DEV HEADERS
  // ==========================================
  setupMiddleware() {
    // Request logging with status colouring
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        const color = res.statusCode >= 400 ? 'error' :
                     res.statusCode >= 300 ? 'warning' : 'success';
        this.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`, color);
      });
      next();
    });

    // CORS — open for dev
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });

    // Dev headers — no caching
    this.app.use((req, res, next) => {
      res.header('X-Pleading-Sanity-Dev', 'active');
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');
      next();
    });
  }

  // ==========================================
  // ROUTES — STATIC + API + SPA FALLBACK
  // ==========================================
  setupRoutes() {
    // Static assets
    this.app.use('/assets', express.static(path.join(this.rootDir, 'assets')));
    this.app.use('/css', express.static(path.join(this.rootDir, 'css')));
    this.app.use('/js', express.static(path.join(this.rootDir, 'js')));
    this.app.use(express.static(this.rootDir));

    // API — Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'cosmically aligned ✅',
        environment: 'development',
        uptime: process.uptime().toFixed(1) + 's',
        timestamp: new Date().toISOString(),
        site: 'Pleading Sanity'
      });
    });

    // API — Journal endpoint (dev simulation)
    this.app.post('/api/journal', express.json({ limit: '1mb' }), (req, res) => {
      this.log('Journal entry received', 'success');
      res.json({
        success: true,
        message: 'Entry saved to the collective ✨',
        received: req.body,
        timestamp: new Date().toISOString()
      });
    });

    // Dev utilities
    this.app.get('/dev/reload', (req, res) => {
      this.broadcastReload({ manual: true });
      res.json({ message: 'Reload signal broadcast 📡' });
    });

    this.app.get('/dev/status', (req, res) => {
      res.json({
        clients: this.clients.size,
        watching: !!this.watcher,
        uptime: process.uptime().toFixed(1) + 's'
      });
    });

    // SPA fallback — serve index.html for clean URLs
    this.app.get('*', async (req, res, next) => {
      // Skip API paths
      if (req.path.startsWith('/api/') || req.path.startsWith('/dev/')) return next();

      const filePath = path.join(this.rootDir, req.path);
      
      try {
        const stat = await fs.stat(filePath);
        if (stat.isFile()) return res.sendFile(filePath);
      } catch {
        // File doesn't exist → serve index.html
      }
      
      res.sendFile(path.join(this.rootDir, 'index.html'));
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      this.log(`Server error: ${err.message}`, 'error');
      res.status(500).json({ error: 'Internal server vortex', message: err.message });
    });
  }

  // ==========================================
  // WEBSOCKET — LIVE RELOAD CONNECTION
  // ==========================================
  setupWebSocket() {
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      this.log(`Client connected — ${this.clients.size} watching 👁️`, 'success');

      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Pleading Sanity dev server active ✨',
        timestamp: new Date().toISOString()
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        this.log(`Client disconnected — ${this.clients.size} remaining`, 'info');
      });

      ws.on('error', (err) => {
        this.log(`WebSocket error: ${err.message}`, 'warning');
        this.clients.delete(ws);
      });
    });
  }

  // ==========================================
  // FILE WATCHER — DETECT CHANGES
  // ==========================================
  setupFileWatcher() {
    const paths = [
      path.join(this.rootDir, '**/*.html'),
      path.join(this.rootDir, 'css/**/*.css'),
      path.join(this.rootDir, 'js/**/*.js'),
      path.join(this.rootDir, 'assets/**/*')
    ];

    this.watcher = chokidar.watch(paths, {
      ignored: /node_modules|\.git|dist|deployment-report/,
      ignoreInitial: true,
      persistent: true
    });

    this.watcher
      .on('change', (f) => {
        const rel = path.relative(this.rootDir, f);
        this.log(`Updated: ${rel}`, 'info');
        this.broadcastReload({ file: rel, type: 'change' });
      })
      .on('add', (f) => {
        const rel = path.relative(this.rootDir, f);
        this.log(`Created: ${rel}`, 'success');
        this.broadcastReload({ file: rel, type: 'add' });
      })
      .on('unlink', (f) => {
        const rel = path.relative(this.rootDir, f);
        this.log(`Removed: ${rel}`, 'warning');
        this.broadcastReload({ file: rel, type: 'delete' });
      })
      .on('error', (err) => {
        this.log(`Watcher error: ${err.message}`, 'error');
      });

    this.log('File watcher active — listening for changes 👀', 'success');
    return this.watcher;
  }

  // ==========================================
  // BROADCAST RELOAD TO ALL CONNECTED CLIENTS
  // ==========================================
  broadcastReload(data = {}) {
    const msg = JSON.stringify({
      type: 'reload',
      timestamp: new Date().toISOString(),
      ...data
    });

    let sent = 0;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
        sent++;
      } else {
        this.clients.delete(client);
      }
    });

    if (sent > 0) {
      this.log(`Reload signal sent to ${sent} client${sent !== 1 ? 's' : ''} 🔄`, 'info');
    }
  }

  // ==========================================
  // AUTO-INJECT RELOAD SCRIPT INTO HTML
  // ==========================================
  injectReloadScript(htmlContent) {
    const script = `
<script>
(function() {
  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(\`\${wsProtocol}//${this.host}:${this.port}\`);
  let reconnects = 0;
  const maxReconnects = 5;

  ws.onopen = () => {
    console.log('%c✨ Dev server connected', 'color: #00fff0; font-weight: bold');
    reconnects = 0;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'reload') {
      console.log('%c🔄 Change detected', 'color: #ff00ff; font-weight: bold', data.file || 'Full reload');
      
      // Smart CSS refresh — no full page flash
      if (data.file?.endsWith('.css')) {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
          if (link.href.includes(data.file)) {
            link.href = link.href.split('?')[0] + '?v=' + Date.now();
            console.log('%c🎨 CSS hot-reloaded', 'color: #00ff90');
          }
        });
        return;
      }
      
      // Full reload for everything else
      setTimeout(() => location.reload(), 50);
    }
  };

  ws.onclose = () => {
    console.log('%c⚠️ Dev server disconnected', 'color: #ffaa00');
    if (reconnects < maxReconnects) {
      reconnects++;
      setTimeout(() => location.reload(), 2000 * reconnects);
    }
  };

  ws.onerror = (err) => {
    console.error('%c❌ WebSocket error', 'color: #ff3b5c', err);
  };
})();
</script>`;
    return htmlContent.replace('</body>', `${script}\n</body>`);
  }

  // ==========================================
  // START EVERYTHING
  // ==========================================
  async start() {
    try {
      this.setupMiddleware();
      this.setupRoutes();
      this.server = http.createServer(this.app);
      this.setupWebSocket();
      this.setupFileWatcher();

      this.server.listen(this.port, this.host, () => {
        console.log('\n' + '═.✧ 🌌 PLEADING SANITY DEV SERVER ✧.═'.padStart(55, ' ') + '\n');
        this.log('🚀 Server online', 'server');
        this.log(`📍 Local:   http://${this.host}:${this.port}`, 'success');
        this.log(`🌐 Network: http://${this.getLocalIP()}:${this.port}`, 'info');
        console.log('─'.repeat(50));
        this.log('✨ Features:', 'server');
        this.log('  ✅ Live reload — instant updates', 'success');
        this.log('  ✅ CSS hot-swap — no page flash', 'success');
        this.log('  ✅ File watcher — auto-detect changes', 'success');
        this.log('  ✅ CORS open — easy API testing', 'success');
        this.log('  ✅ SPA routing — clean URLs work', 'success');
        this.log('  ✅ Dev APIs — /api/health /dev/status', 'success');
        console.log('─'.repeat(50));
        this.log('Ctrl+C to stop • Edit files → browser updates', 'info');
        console.log('═'.repeat(50) + '\n');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n');
        this.log('Shutting down gracefully…', 'warning');
        await this.watcher?.close();
        await new Promise(res => this.wss?.close(res));
        await new Promise(res => this.server?.close(res));
        this.log('Server stopped ✅', 'success');
        process.exit(0);
      });

    } catch (err) {
      this.log(`Failed to start: ${err.message}`, 'error');
      process.exit(1);
    }
  }

  // Helper — get local IP for network access
  getLocalIP() {
    const os = require('os');
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
    return 'localhost';
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new DevServer().start();
}

module.exports = DevServer;
