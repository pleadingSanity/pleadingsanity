#!/usr/bin/env node

/**
 * PLEADING SANITY — HEALTH CHECK v2.1-FINAL
 * File System • PWA • Security • Env • Live URL
 * Evolution, Not Erasure • pleadingSanity
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
    
    this.results = {
      project: 'Pleading Sanity',
      timestamp: new Date().toISOString(),
      overall: 'PASS',
      passed: 0,
      failed: 0,
      warnings: 0,
      checks: []
    };
  }

  // ==========================================
  // COSMIC LOGGING
  // ==========================================
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',     // cyan
      success: '\x1b[32m',  // green
      warning: '\x1b[33m',  // yellow
      error: '\x1b[31m',    // red
      reset: '\x1b[0m'
    };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${colors[type]}[${ts}] ${message}${colors.reset}`);
  }

  // ==========================================
  // CHECK: FILE EXISTS
  // ==========================================
  async checkFile(filePath, description) {
    const fullPath = path.join(this.rootDir, filePath);
    try {
      await fs.access(fullPath);
      this.addResult('file', description, 'PASS', `Found: ${filePath}`);
      return true;
    } catch {
      this.addResult('file', description, 'FAIL', `MISSING: ${filePath}`);
      return false;
    }
  }

  // ==========================================
  // CHECK: LIVE URL
  // ==========================================
  async checkUrl(url, description, timeoutMs = 5000) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      const req = protocol.get(url, { timeout: timeoutMs }, (res) => {
        const ok = res.statusCode >= 200 && res.statusCode < 400;
        if (ok) {
          this.addResult('network', description, 'PASS', `${url} → ${res.statusCode}`);
          resolve(true);
        } else {
          this.addResult('network', description, 'FAIL', `${url} → ${res.statusCode}`);
          resolve(false);
        }
      });

      req.on('error', (err) => {
        this.addResult('network', description, 'FAIL', `${url} — ${err.message}`);
        resolve(false);
      });

      req.on('timeout', () => {
        this.addResult('network', description, 'FAIL', `${url} — timeout`);
        req.destroy();
        resolve(false);
      });
    });
  }

  // ==========================================
  // CHECK: PWA MANIFEST
  // ==========================================
  async checkManifest() {
    try {
      const manifestPath = path.join(this.rootDir, 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
      
      const required = ['name', 'start_url', 'display', 'icons'];
      const missing = required.filter(f => !manifest[f]);
      
      if (missing.length === 0) {
        this.addResult('pwa', 'PWA Manifest', 'PASS', 'All required fields present ✨');
        return true;
      }
      this.addResult('pwa', 'PWA Manifest', 'FAIL', `Missing: ${missing.join(', ')}`);
      return false;
    } catch (err) {
      this.addResult('pwa', 'PWA Manifest', 'FAIL', err.message);
      return false;
    }
  }

  // ==========================================
  // CHECK: SERVICE WORKER
  // ==========================================
  async checkServiceWorker() {
    return this.checkFile('sw.js', 'Service Worker');
  }

  // ==========================================
  // CHECK: CORE ASSETS — MATCHES YOUR STRUCTURE
  // ==========================================
  async checkAssets() {
    const assets = [
      ['index.html', 'Main HTML'],
      ['css/cosmic-core.css', 'Cosmic Theme CSS'],
      ['js/main.js', 'Main JavaScript'],
      ['manifest.json', 'PWA Manifest'],
      ['assets/favicon.svg', 'Favicon'],
      ['assets/logo.png', 'Brand Logo']
    ];

    const results = await Promise.all(
      assets.map(([file, desc]) => this.checkFile(file, desc))
    );
    return results.every(Boolean);
  }

  // ==========================================
  // CHECK: PAGE FILES
  // ==========================================
  async checkPages() {
    const pages = [
      ['index.html', 'Homepage'],
      ['about.html', 'About / Legacy'],
      ['hub.html', 'Sanity Hub'],
      ['journal.html', 'Survivor Journal'],
      ['frequencies.html', 'Healing Frequencies'],
      ['games.html', 'Brain Training'],
      ['shop.html', 'Streetwear'],
      ['ai-sanctuary.html', 'AI Sanctuary'],
      ['movement.html', 'The Mission']
    ];

    const results = await Promise.all(
      pages.map(([file, desc]) => this.checkFile(file, desc))
    );
    return results.every(Boolean);
  }

  // ==========================================
  // CHECK: DEPLOY CONFIG
  // ==========================================
  async checkDeployConfig() {
    const files = [
      ['netlify.toml', 'Netlify Config'],
      ['package.json', 'Project Manifest'],
      ['.gitignore', 'Git Ignore Rules']
    ];
    
    const results = await Promise.all(
      files.map(([file, desc]) => this.checkFile(file, desc))
    );
    return results.every(Boolean);
  }

  // ==========================================
  // CHECK: ENVIRONMENT VARIABLES
  // ==========================================
  async checkEnvironment() {
    const required = ['NODE_ENV', 'SITE_URL'];
    const optional = ['OPENAI_API_KEY', 'YOUTUBE_API_KEY', 'STRIPE_PUBLIC_KEY'];
    
    let allRequired = true;
    
    for (const v of required) {
      if (process.env[v]) {
        this.addResult('env', `Required: ${v}`, 'PASS', 'Set ✅');
      } else {
        this.addResult('env', `Required: ${v}`, 'FAIL', 'NOT SET ⚠️');
        allRequired = false;
      }
    }

    for (const v of optional) {
      if (process.env[v]) {
        this.addResult('env', `Optional: ${v}`, 'PASS', 'Set ✅');
      } else {
        this.addResult('env', `Optional: ${v}`, 'WARNING', 'Not set — optional');
      }
    }

    return allRequired;
  }

  // ==========================================
  // CHECK: SECURITY — NO SECRETS EXPOSED
  // ==========================================
  async checkSecurity() {
    const safeFiles = [
      ['package-lock.json', 'Dependency Lock'],
      ['.env.example', 'Env Template']
    ];

    await Promise.all(
      safeFiles.map(([file, desc]) => this.checkFile(file, desc))
    );

    // ⚠️ These should NOT exist in repo
    const secrets = ['.env', 'config/keys.js', 'api-keys.json'];
    for (const file of secrets) {
      const fullPath = path.join(this.rootDir, file);
      try {
        await fs.access(fullPath);
        this.addResult('security', `⚠️ ${file}`, 'WARNING', 'Exists — ensure in .gitignore!');
      } catch {
        this.addResult('security', `✅ ${file}`, 'PASS', 'Not present (good)');
      }
    }
  }

  // ==========================================
  // ADD RESULT & UPDATE STATUS
  // ==========================================
  addResult(category, description, status, details) {
    this.results.checks.push({
      category,
      description,
      status,
      details,
      timestamp: new Date().toISOString()
    });

    if (status === 'PASS') this.results.passed++;
    if (status === 'FAIL') {
      this.results.failed++;
      this.results.overall = 'FAIL';
    }
    if (status === 'WARNING') {
      this.results.warnings++;
      if (this.results.overall === 'PASS') this.results.overall = 'WARNING';
    }

    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    const type = status === 'PASS' ? 'success' : status === 'FAIL' ? 'error' : 'warning';
    this.log(`${icon} ${description}: ${details}`, type);
  }

  // ==========================================
  // GENERATE JSON REPORT
  // ==========================================
  async saveReport() {
    const reportPath = path.join(this.rootDir, 'health-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`📄 Report saved → ${reportPath}`, 'info');
  }

  // ==========================================
  // RUN ALL CHECKS
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 PLEADING SANITY HEALTH CHECK ✧.═'.padStart(55, ' ') + '\n');
    this.log('Scanning project integrity…', 'info');
    this.log(`Target: ${this.rootDir}`, 'info');
    console.log('─'.repeat(50));

    // Run every check
    await this.checkAssets();
    await this.checkPages();
    await this.checkManifest();
    await this.checkServiceWorker();
    await this.checkDeployConfig();
    await this.checkEnvironment();
    await this.checkSecurity();

    // Live URL check — only if flag present
    if (process.argv.includes('--check-urls')) {
      console.log('─'.repeat(50));
      this.log('Checking live endpoints…', 'info');
      await this.checkUrl(this.siteUrl, 'Live Site');
      await this.checkUrl(`${this.siteUrl}/manifest.json`, 'Manifest');
      await this.checkUrl(`http://localhost:${this.localPort}/api/health`, 'Local Dev API');
    }

    // Save full report
    await this.saveReport();

    // Final summary
    console.log('─'.repeat(50));
    const statusColor = this.results.overall === 'PASS' ? 'success' :
                        this.results.overall === 'FAIL' ? 'error' : 'warning';
    
    this.log(`FINAL STATUS: ${this.results.overall}`, statusColor);
    this.log(`✅ ${this.results.passed} passed • ❌ ${this.results.failed} failed • ⚠️ ${this.results.warnings} warnings`, 'info');
    console.log('═'.repeat(50) + '\n');

    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new HealthChecker().run().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
}

module.exports = HealthChecker;
