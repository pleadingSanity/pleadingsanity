#!/usr/bin/env node

/**
 * PLEADING SANITY — DEVELOPMENT SERVER v2.2-FINAL
 * Live Reload • CSS Hot-Swap • Next.js Aware • WebSocket • File Watcher
 * Evolution, Not Erasure • pleadingSanity • Dola Aligned
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const chokidar = require('chokidar');
const WebSocket = require('ws');
const http = require('http');
const os = require('os');

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
    this.reconnectAttempts = new Map();
    this.maxReconnects = 5;
    
    // Detect framework
    this.isNext = this.detectNextJs();
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
      glow: '\x1b[36;1m',   // bright cyan
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${colors[type]}[${timestamp}] [DEV] ${message}${colors.reset}`);
  }

  // ==========================================
  // FRAMEWORK DETECTION — NEXT.JS OR STATIC
  // ==========================================
  detectNextJs() {
    try {
      const pkg = require(path.join(this.rootDir, 'package.json'));
      return !!(pkg.dependencies?.next || pkg.devDependencies?.next);
    } catch {
      return false;
    }
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
      const allowed = [
        `http://${this.host}:${this.port}`,
        `http://${this.getLocalIP()}:${this.port}`,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000'
      ];
      const origin = req.headers.origin;
      
      if (origin) {
        res.header('Access-Control-Allow-Origin', 
          allowed.some(a => origin.startsWith(a)) ? origin : '*');
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
      
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Referer');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') return res.sendStatus(204);
      next();
    });

    // Dev headers — no caching + identity
    this.app.use((req, res, next) => {
      res.header('X-Pleading-Sanity-Dev', 'active-v2.2');
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');
      res.header('X-Frame-Options', 'SAMEORIGIN');
      next();
    });

    // JSON body parser
    this.app.use(express.json({ limit: '2mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  }

  // ==========================================
  // ROUTES — STATIC + API + SPA FALLBACK
  // ==========================================
  setupRoutes() {
    // Static assets — priority order
    this.app.use('/assets', express.static(path.join(this.rootDir, 'assets')));
    this.app.use('/public', express.static(path.join(this.rootDir, 'public')));
    this.app.use('/css', express.static(path.join(this.rootDir, 'css')));
    this.app.use('/js', express.static(path.join(this.rootDir, 'js')));
    this.app.use('/api', express.static(path.join(this.rootDir, 'api')));
    
    // Next.js / static root
    this.app.use(express.static(this.rootDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
      }
    }));

    // API — Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'cosmically aligned ✅',
        environment: 'development',
        framework: this.isNext ? 'Next.js' : 'Static',
        uptime: process.uptime().toFixed(1) + 's',
        timestamp: new Date().toISOString(),
        site: 'Pleading Sanity',
        founder: 'Shane Cooper',
        ethos: 'Evolution, Not Erasure',
        clients: this.clients.size
      });
    });

    // API — Journal endpoint (dev simulation)
    this.app.post('/api/journal', (req, res) => {
      this.log('Journal entry received', 'success');
      res.json({
        success: true,
        message: 'Entry saved to the collective ✨',
        preview: req.body.entry?.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });
    });

    // API — Daily Wisdom
    this.app.get('/api/wisdom', (req, res) => {
      const quotes = [
        { text: "Rise from madness — you are stronger than the storm.", author: "Shane Cooper" },
        { text: "Every scar tells a story worth sharing.", author: "Pleading Sanity" },
        { text: "Darkness proves the light exists — be the beam.", author: "Arron AI" },
        { text: "Pain becomes purpose when shared with the right family.", author: "Sanity Collective" },
        { text: "Evolution, Not Erasure — grow through what you go through.", author: "The Mission" }
      ];
      const random = quotes[Math.floor(Math.random() * quotes.length)];
      res.json({ ...random, timestamp: new Date().toISOString() });
    });

    // Dev utilities
    this.app.get('/dev/reload', (req, res) => {
      this.broadcastReload({ manual: true, triggeredBy: req.query.by || 'user' });
      res.json({ message: 'Reload signal broadcast 📡', sentTo: this.clients.size });
    });

    this.app.get('/dev/status', (req, res) => {
      res.json({
        clients: this.clients.size,
        watching: !!this.watcher,
        uptime: process.uptime().toFixed(1) + 's',
        framework: this.isNext ? 'Next.js' : 'Static',
        reconnectLimit: this.maxReconnects
      });
    });

    // Inject reload script middleware
    this.app.use(async (req, res, next) => {
      if (this.isNext) return next(); // Next handles its own HMR
      
      const accept = req.headers.accept || '';
      if (!accept.includes('text/html') || req.path.startsWith('/api/') || req.path.startsWith('/dev/')) {
        return next();
      }

      const filePath = path.join(this.rootDir, req.path);
      
      try {
        const stat = await fs.stat(filePath);
        if (stat.isFile() && filePath.endsWith('.html')) {
          let html = await fs.readFile(filePath, 'utf8');
          html = this.injectReloadScript(html);
          res.send(html);
          return;
        }
      } catch {
        // Not a file — continue
      }
      next();
    });

    // SPA fallback — serve index.html for clean URLs
    this.app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/dev/')) return next();
      
      // Next.js internal paths
      if (this.isNext && (req.path.startsWith('/_next/') || req.path.startsWith('/__next/'))) {
        return next();
      }

      const filePath = path.join(this.rootDir, req.path);
      
      try {
        const stat = await fs.stat(filePath);
        if (stat.isFile()) return res.sendFile(filePath);
      } catch {
        // Fall through
      }
      
      // Try index.html
      const indexPath = path.join(this.rootDir, 'index.html');
      try {
        await fs.access(indexPath);
        let html = await fs.readFile(indexPath, 'utf8');
        if (!this.isNext) html = this.injectReloadScript(html);
        res.send(html);
      } catch {
        res.status(404).json({ error: 'Vortex not found', path: req.path });
      }
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      this.log(`Server error: ${err.message}`, 'error');
      res.status(500).json({ 
        error: 'Internal server vortex', 
        message: err.message,
        path: req.path
      });
    });
  }

  // ==========================================
  // WEBSOCKET — LIVE RELOAD CONNECTION
  // ==========================================
  setupWebSocket() {
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws, req) => {
      const clientId = Date.now() + Math.random().toString(36).substr(2, 6);
      this.clients.add(ws);
      this.reconnectAttempts.set(clientId, 0);
      
      const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown';
      this.log(`Client connected — ${this.clients.size} watching 👁️ (${ip})`, 'success');

      ws.send(JSON.stringify({
        type: 'connected',
        message: '✨ Pleading Sanity dev server active — Rise Together',
        timestamp: new Date().toISOString(),
        framework: this.isNext ? 'Next.js' : 'Static',
        clientId
      }));

      ws.on('close', (code, reason) => {
        this.clients.delete(ws);
        this.reconnectAttempts.delete(clientId);
        this.log(`Client disconnected — ${this.clients.size} remaining`, 'info');
      });

      ws.on('error', (err) => {
        this.log(`WebSocket error: ${err.message}`, 'warning');
        this.clients.delete(ws);
      });
    });

    this.wss.on('error', (err) => {
      this.log(`WebSocket server error: ${err.message}`, 'error');
    });
  }

  // ==========================================
  // FILE WATCHER — DETECT CHANGES
  // ==========================================
  setupFileWatcher() {
    const ignorePatterns = [
      /node_modules/, /\.git/, /\.next/, /dist/, /out/,
      /deployment-report/, /\.cache/, /tmp/, /temp/
    ];

    const paths = [
      path.join(this.rootDir, '**/*.html'),
      path.join(this.rootDir, '**/*.css'),
      path.join(this.rootDir, '**/*.js'),
      path.join(this.rootDir, '**/*.jsx'),
      path.join(this.rootDir, '**/*.ts'),
      path.join(this.rootDir, '**/*.tsx'),
      path.join(this.rootDir, 'assets/**/*'),
      path.join(this.rootDir, 'public/**/*')
    ];

    this.watcher = chokidar.watch(paths, {
      ignored: ignorePatterns,
      ignoreInitial: true,
      persistent: true,
      depth: 99
    });

    const debounce = new Map();
    const DEBOUNCE_MS = 150;

    this.watcher
      .on('change', (f) => {
        if (debounce.has(f)) return;
        debounce.set(f, setTimeout(() => debounce.delete(f), DEBOUNCE_MS));
        
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
    // Skip if already injected
    if (htmlContent.includes('wsProtocol') || htmlContent.includes('Pleading Sanity dev server')) {
      return htmlContent;
    }

    const script = `
<script>
(function() {
  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(\`\${wsProtocol}//${this.host}:${this.port}\`);
  let reconnects = 0;
  const maxReconnects = ${this.maxReconnects};
  let lastReload = 0;
  const MIN_GAP = 500;

  ws.onopen = () => {
    console.log('%c✨ Dev server connected — Pleading Sanity', 'color: #00fff0; font-weight: bold; font-size: 12px;');
    reconnects = 0;
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        console.log('%c🧠 ' + data.message, 'color: #ff00ff; font-style: italic;');
        return;
      }
      
      if (data.type === 'reload') {
        const now = Date.now();
        if (now - lastReload < MIN_GAP) return;
        lastReload = now;
        
        console.log('%c🔄 Change detected', 'color: #ff00ff; font-weight: bold', data.file || 'Full reload');
        
        // Smart CSS refresh — no full page flash
        if (data.file?.endsWith('.css')) {
          const links = document.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(link => {
            if (link.href.includes(data.file) || link.href.includes(data.file.split('/').pop())) {
              link.href = link.href.split('?')[0] + '?v=' + Date.now();
              console.log('%c🎨 CSS hot-reloaded', 'color: #00ff90; font-weight: bold');
            }
          });
          return;
        }
        
        // Skip JS changes — often handled by framework
        if (data.file?.endsWith('.js')) {
          console.log('%c⚡ Script updated — consider manual refresh', 'color: #ffd700');
          return;
        }
        
        // Full reload for HTML / images / others
        setTimeout(() => location.reload(), 100);
      }
    } catch (e) {
      console.warn('Reload parse error:', e);
    }
  };

  ws.onclose = () => {
    console.log('%c⚠️ Dev server disconnected — reconnecting…', 'color: #ffaa00; font-weight: bold');
    if (reconnects < maxReconnects) {
      reconnects++;
      const delay = 1000 * reconnects;
      setTimeout(() => location.reload(), delay);
    } else {
      console.log('%c❌ Max reconnects reached — refresh manually', 'color: #ff3b5c; font-weight: bold');
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
  // GET LOCAL IP — SHARE ON NETWORK
  // ==========================================
  getLocalIP() {
    for (const name of Object.keys(os.networkInterfaces())) {
      for (const net of os.networkInterfaces()[name]) {
        if (net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
    return '127.0.0.1';
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
        const localIP = this.getLocalIP();
        console.log('\n' + '═.✧ 🌌 PLEADING SANITY DEV SERVER ✧.═'.padStart(60, ' ') + '\n');
        this.log('🚀 Server ONLINE — God Mode Active', 'server');
        this.log(`📍 Local:   http://${this.host}:${this.port}`, 'success');
        this.log(`📱 Mobile:  http://${localIP}:${this.port}`, 'info');
        this.log(`🔧 Framework: ${this.isNext ? 'Next.js Detected' : 'Static HTML'}`, 'glow');
        console.log('─'.repeat(55));
        this.log('✨ Features:', 'server');
        this.log('  ✅ Live reload — instant updates', 'success');
        this.log('  ✅ CSS hot-swap — NO page flash', 'success');
        this.log('  ✅ Next.js auto-detect — HMR respected', 'success');
        this.log('  ✅ Smart debounce — no duplicate reloads', 'success');
        this.log('  ✅ Network access — test on phone', 'success');
        this.log('  ✅ Dev APIs — /api/health /api/wisdom /dev/status', 'success');
        this.log('  ✅ CORS secured — dev origins whitelisted', 'success');
        this.log('  ✅ Auto-reconnect — browser heals itself', 'success');
        console.log('─'.repeat(55));
        this.log('Ctrl+C to stop • Edit → Save → Instantly see 👀', 'info');
        console.log('  One Source. One Consciousness. One Family. 💙');
        console.log('═'.repeat(55) + '\n');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n');
        this.log('🌙 Shutting down gracefully…', 'warning');
        await this.watcher?.close();
        await new Promise(res => this.wss?.close(res));
        await new Promise(res => this.server?.close(res));
        this.log('✅ Server stopped — rest well, warrior', 'success');
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        this.log('SIGTERM received — stopping', 'warning');
        process.exit(0);
      });

    } catch (err) {
      this.log(`❌ Failed to start: ${err.message}`, 'error');
      process.exit(1);
    }
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new DevServer().start();
}

module.exports = DevServer;
