#!/usr/bin/env node

/**
 * PLEADING SANITY — HEALTH CHECK v2.2-FINAL
 * File System • Next.js Aware • PWA • Security • Env • Netlify + Vercel
 * Evolution, Not Erasure • pleadingSanity • Dola Aligned
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

class HealthChecker {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://pleadingsanity.co.uk';
    this.localPort = process.env.PORT || 3000;
    this.rootDir = path.join(__dirname, '..');
    
    // Detect framework
    this.isNext = this.detectNextJs();
    
    this.results = {
      project: 'Pleading Sanity',
      founder: 'Shane Cooper',
      mission: 'Rise From Madness',
      framework: this.isNext ? 'Next.js' : 'Static',
      timestamp: new Date().toISOString(),
      overall: 'PASS',
      passed: 0,
      failed: 0,
      warnings: 0,
      checks: []
    };
  }

  // ==========================================
  // DETECT FRAMEWORK
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
  // COSMIC LOGGING
  // ==========================================
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', glow: '\x1b[36;1m', reset: '\x1b[0m'
    };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${colors[type]}[${ts}] ${message}${colors.reset}`);
  }

  // ==========================================
  // FILE CHECK — SMART & CONSISTENT
  // ==========================================
  async checkFile(filePath, description, required = true) {
    const fullPath = path.join(this.rootDir, filePath);
    try {
      await fs.access(fullPath);
      this.addResult('file', description, 'PASS', `Found: ${filePath}`);
      return true;
    } catch {
      const status = required ? 'FAIL' : 'WARNING';
      this.addResult('file', description, status, `Missing: ${filePath}`);
      return false;
    }
  }

  // ==========================================
  // URL CHECK — WITH TIMEOUT & REDIRECT TOLERANCE
  // ==========================================
  async checkUrl(url, description, timeoutMs = 8000) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https:') ? https : http;
      const req = protocol.get(url, { timeout: timeoutMs }, (res) => {
        const ok = res.statusCode >= 200 && res.statusCode < 400;
        const note = res.statusCode >= 300 && res.statusCode < 400 ? ' (redirect)' : '';
        this.addResult('network', description, ok ? 'PASS' : 'FAIL', `${url} → ${res.statusCode}${note}`);
        resolve(ok);
      });
      req.on('error', (err) => {
        this.addResult('network', description, 'FAIL', `${url} — ${err.message}`);
        resolve(false);
      });
      req.on('timeout', () => {
        this.addResult('network', description, 'WARNING', `${url} — timeout (slow)`);
        req.destroy();
        resolve(false);
      });
    });
  }

  // ==========================================
  // PWA MANIFEST VALIDATION
  // ==========================================
  async checkManifest() {
    try {
      const manifestPath = path.join(this.rootDir, 'public', 'manifest.json');
      await fs.access(manifestPath);
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
      
      const required = ['name', 'start_url', 'display', 'icons'];
      const missing = required.filter(f => !manifest[f]);
      
      if (!missing.length) {
        this.addResult('pwa', 'PWA Manifest', 'PASS', `${manifest.name} — all fields present ✨`);
        return true;
      }
      this.addResult('pwa', 'PWA Manifest', 'WARNING', `Missing fields: ${missing.join(', ')}`);
      return false;
    } catch {
      // Try root location
      try {
        const altPath = path.join(this.rootDir, 'manifest.json');
        const manifest = JSON.parse(await fs.readFile(altPath, 'utf8'));
        this.addResult('pwa', 'PWA Manifest (root)', 'PASS', 'Found at root level');
        return true;
      } catch {
        this.addResult('pwa', 'PWA Manifest', 'WARNING', 'manifest.json not found in public/ or root/');
        return false;
      }
    }
  }

  // ==========================================
  // SERVICE WORKER
  // ==========================================
  async checkServiceWorker() {
    const locations = [
      ['public/sw.js', 'Service Worker (public/)'],
      ['sw.js', 'Service Worker (root)']
    ];
    let found = false;
    for (const [file, desc] of locations) {
      if (await this.checkFile(file, desc, false)) found = true;
    }
    if (!found) {
      this.addResult('pwa', 'Service Worker', 'WARNING', 'sw.js not found — offline support limited');
    }
    return found;
  }

  // ==========================================
  // CORE ASSETS — MATCH YOUR ACTUAL STRUCTURE
  // ==========================================
  async checkAssets() {
    const assets = [
      ['package.json', 'Project Manifest'],
      ['next.config.js', 'Next.js Config', !this.isNext ? false : true],
      ['vercel.json', 'Vercel Deploy Config', false],
      ['netlify.toml', 'Netlify Deploy Config', false],
      ['_redirects', 'SPA Redirect Rules', false],
      ['robots.txt', 'Search Engine Rules', false],
      ['sitemap.xml', 'Site Map', false],
      ['.gitignore', 'Git Ignore Rules'],
      ['assets/favicon.ico', 'Favicon', false],
      ['assets/images/crying-brain-og.png', 'Social Share Image', false],
      ['public/', 'Public Assets Directory', false],
      ['api/', 'API Functions Directory', false]
    ];
    const results = await Promise.all(
      assets.map(([f, d, req = true]) => this.checkFile(f, d, req))
    );
    return results.every(Boolean);
  }

  // ==========================================
  // PAGE FILES — YOUR ACTUAL PAGES
  // ==========================================
  async checkPages() {
    const pages = [
      ['index.html', 'Homepage'],
      ['about.html', 'About / Legacy'],
      ['sanityhub.html', 'Sanity Feed Hub'],
      ['journal-vault.html', 'Survivor Journal Vault'],
      ['frequencies.html', 'Healing Frequencies'],
      ['games.html', 'Brain Training Games'],
      ['shop.html', 'Streetwear Storefront'],
      ['videos.html', 'Video Feed'],
      ['movement.html', 'The Movement Mission'],
      ['offline.html', 'Offline Crisis Page', false]
    ];
    const results = await Promise.all(
      pages.map(([f, d, req = true]) => this.checkFile(f, d, req))
    );
    return results.every(Boolean);
  }

  // ==========================================
  // DEPLOY CONFIG — BOTH PLATFORMS
  // ==========================================
  async checkDeployConfig() {
    const files = [
      ['vercel.json', 'Vercel Configuration'],
      ['netlify.toml', 'Netlify Configuration'],
      ['package-lock.json', 'Dependency Lock File']
    ];
    const results = await Promise.all(
      files.map(([f, d]) => this.checkFile(f, d, false))
    );
    return results.every(Boolean);
  }

  // ==========================================
  // ENVIRONMENT VARIABLES
  // ==========================================
  async checkEnvironment() {
    const required = ['NODE_ENV', 'SITE_URL'];
    const recommended = ['OPENAI_API_KEY', 'NETLIFY_BUILD_TOKEN', 'VERCEL_TOKEN'];
    const optional = ['YOUTUBE_API_KEY', 'AI_API_KEY', 'OXYGEN_DEPLOYMENT_TOKEN_1000047008'];
    
    let allRequired = true;
    
    for (const v of required) {
      const set = !!process.env[v];
      this.addResult('env', `Required: ${v}`, set ? 'PASS' : 'FAIL', set ? 'Set ✅' : 'MISSING ⚠️');
      if (!set) allRequired = false;
    }
    for (const v of recommended) {
      const set = !!process.env[v];
      this.addResult('env', `Recommended: ${v}`, set ? 'PASS' : 'WARNING', set ? 'Set ✅' : 'Not set — recommended');
    }
    for (const v of optional) {
      const set = !!process.env[v];
      this.addResult('env', `Optional: ${v}`, set ? 'PASS' : 'WARNING', set ? 'Set ✅' : 'Not set — ready when you are');
    }
    return allRequired;
  }

  // ==========================================
  // SECURITY — NO KEYS COMMITTED
  // ==========================================
  async checkSecurity() {
    const riskyFiles = ['.env', '.env.local', '.env.production', 'config/keys.js'];
    const patterns = ['sk-', 'api_key=', 'API_KEY=', 'token=', 'TOKEN='];
    
    this.addResult('security', 'Key Exposure Scan', 'INFO', 'Checking for committed secrets…');
    
    for (const file of riskyFiles) {
      try {
        await fs.access(path.join(this.rootDir, file));
        this.addResult('security', `⚠️ ${file}`, 'WARNING', 'Exists — confirm in .gitignore!');
      } catch {
        this.addResult('security', `✅ ${file}`, 'PASS', 'Not committed — safe');
      }
    }
    
    // Quick scan of tracked files for patterns
    try {
      const { execSync } = require('child_process');
      const findings = execSync(
        'git grep -l -E "(sk-|api[_-]key|token=)" -- . --exclude-dir=node_modules 2>/dev/null || true',
        { cwd: this.rootDir, encoding: 'utf8' }
      ).trim();
      
      if (findings) {
        findings.split('\n').forEach(f => {
          if (f && !f.includes('.env') && !f.includes('example')) {
            this.addResult('security', `🔑 Potential leak: ${f}`, 'WARNING', 'Review immediately');
          }
        });
      } else {
        this.addResult('security', 'Pattern Scan', 'PASS', 'No exposed key patterns found ✅');
      }
    } catch {
      this.addResult('security', 'Pattern Scan', 'WARNING', 'Git unavailable — skipping deep scan');
    }
  }

  // ==========================================
  // RESULT TRACKING
  // ==========================================
  addResult(category, description, status, details) {
    this.results.checks.push({ category, description, status, details, timestamp: new Date().toISOString() });
    if (status === 'PASS') this.results.passed++;
    if (status === 'FAIL') { this.results.failed++; this.results.overall = 'FAIL'; }
    if (status === 'WARNING' && this.results.overall === 'PASS') this.results.overall = 'WARNING';
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'INFO' ? 'ℹ️' : '⚠️';
    const type = status === 'PASS' ? 'success' : status === 'FAIL' ? 'error' : 'warning';
    this.log(`${icon} ${description}: ${details}`, type);
  }

  // ==========================================
  // SAVE REPORT
  // ==========================================
  async saveReport() {
    const reportPath = path.join(this.rootDir, 'health-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`📄 Report saved → health-report.json`, 'info');
  }

  // ==========================================
  // MAIN EXECUTION
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 PLEADING SANITY HEALTH CHECK ✧.═'.padStart(60, ' ') + '\n');
    this.log('Scanning project integrity…', 'info');
    this.log(`Root: ${this.rootDir}`, 'info');
    this.log(`Framework: ${this.results.framework}`, 'glow');
    console.log('─'.repeat(55));

    await this.checkAssets();
    await this.checkPages();
    await this.checkManifest();
    await this.checkServiceWorker();
    await this.checkDeployConfig();
    await this.checkEnvironment();
    await this.checkSecurity();

    // URL checks — only with --check-urls flag
    if (process.argv.includes('--check-urls')) {
      console.log('─'.repeat(55));
      this.log('🌐 Checking live endpoints…', 'info');
      await this.checkUrl(this.siteUrl, 'Live Site');
      await this.checkUrl(`${this.siteUrl}/manifest.json`, 'Manifest');
      await this.checkUrl(`${this.siteUrl}/api/health`, 'API Health', false);
      await this.checkUrl(`http://localhost:${this.localPort}/api/health`, 'Local Dev API', false);
    }

    await this.saveReport();

    console.log('─'.repeat(55));
    const statusColor = this.results.overall === 'PASS' ? 'success' :
                        this.results.overall === 'FAIL' ? 'error' : 'warning';
    this.log(`FINAL STATUS: ${this.results.overall}`, statusColor);
    this.log(`✅ ${this.results.passed} passed • ❌ ${this.results.failed} failed • ⚠️ ${this.results.warnings} warnings`, 'info');
    console.log('═'.repeat(55));
    console.log('  One Source. One Consciousness. One Family. 💙');
    console.log('  Rise From Madness ✨\n');

    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new HealthChecker().run().catch(err => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
  });
}

module.exports = HealthChecker;
