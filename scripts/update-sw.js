#!/usr/bin/env node

/**
 * PLEADING SANITY — SERVICE WORKER UPDATER v2.2-FINAL
 * Auto-Version • Smart Cache • Integrity Hashes • Next.js Aware • PWA Sync
 * Offline Crisis Ready • Vercel + Netlify • Evolution, Not Erasure
 * pleadingSanity • Shane Cooper Founder
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class ServiceWorkerUpdater {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    
    // Next.js/PWA dual location support
    this.swPaths = [
      path.join(this.rootDir, 'public', 'sw.js'),
      path.join(this.rootDir, 'sw.js')
    ];
    this.manifestPaths = [
      path.join(this.rootDir, 'public', 'manifest.json'),
      path.join(this.rootDir, 'manifest.json')
    ];
    
    // Cacheable file types — includes PWA & font assets
    this.cacheExts = [
      '.html', '.css', '.js', '.mjs',
      '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico',
      '.json', '.woff2', '.woff',
      '.txt' // robots/sitemap for offline search
    ];
    
    // Skip directories — safe & clean
    this.skipDirs = [
      'node_modules', '.git', '.github',
      'dist', 'build', '.next', 'out',
      'scripts', 'coverage', '.netlify', '.vercel',
      'tmp', 'temp'
    ];
    
    // Critical offline files — ALWAYS cached for crisis access
    this.criticalFiles = [
      '/',
      '/index.html',
      '/offline.html',
      '/styles.css',
      '/manifest.json'
    ];
  }

  // ==========================================
  // COSMIC LOGGING
  // ==========================================
  log(msg, type = 'info') {
    const C = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      glow: '\x1b[36;1m',
      reset: '\x1b[0m'
    };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${C[type]}[${ts}] [SW] ${msg}${C.reset}`);
  }

  // ==========================================
  // FIND ACTUAL FILE — supports public/ & root/
  // ==========================================
  async findFile(candidates) {
    for (const p of candidates) {
      try {
        await fs.access(p);
        return p;
      } catch {}
    }
    return null;
  }

  // ==========================================
  // GENERATE VERSION — timestamp + git hash
  // ==========================================
  makeVersion() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    try {
      const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      return `v${stamp}-${hash}`;
    } catch {
      return `v${stamp}`;
    }
  }

  // ==========================================
  // SCAN CACHEABLE FILES — RECURSIVE & SMART
  // ==========================================
  async scanFiles(dir = this.rootDir, base = this.rootDir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip ignored directories
      if (this.skipDirs.some(skip => 
        entry.name === skip || entry.name.startsWith(`${skip}/`)
      )) continue;

      const fullPath = path.join(dir, entry.name);
      const relPath = '/' + path.relative(base, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        files.push(...(await this.scanFiles(fullPath, base)));
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (this.cacheExts.includes(ext)) {
        files.push(relPath);
      }
    }

    // Ensure critical files are ALWAYS included
    for (const critical of this.criticalFiles) {
      if (!files.includes(critical)) files.unshift(critical);
    }

    // Deduplicate
    return [...new Set(files)];
  }

  // ==========================================
  // MD5 HASH — detect actual content changes
  // ==========================================
  async hashFile(filePath) {
    try {
      const buf = await fs.readFile(filePath);
      return crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
    } catch {
      return '------';
    }
  }

  // ==========================================
  // UPDATE SERVICE WORKER — ALL SECTIONS
  // ==========================================
  async updateSW() {
    const swPath = await this.findFile(this.swPaths);
    if (!swPath) {
      throw new Error('sw.js not found in public/ or root/ — create it first');
    }

    let sw = await fs.readFile(swPath, 'utf8');
    const version = this.makeVersion();
    const timestamp = new Date().toISOString();
    const files = await this.scanFiles();

    // Build integrity hashes
    const hashes = {};
    for (const file of files) {
      const diskPath = path.join(this.rootDir, file.slice(1));
      hashes[file] = await this.hashFile(diskPath);
    }

    // ── Patch: CACHE_VERSION ──
    sw = sw.replace(
      /const\s+CACHE_VERSION\s*=\s*['"`][^'"`]+['"`]/,
      `const CACHE_VERSION = '${version}'`
    );

    // ── Patch: CACHE_NAME ──
    sw = sw.replace(
      /const\s+CACHE_NAME\s*=\s*['"`][^'"`]+['"`]/,
      `const CACHE_NAME = 'pleading-sanity-${version}'`
    );

    // ── Patch: STATIC_CACHE_FILES ──
    const fileList = JSON.stringify(files, null, 2);
    sw = sw.replace(
      /const\s+STATIC_CACHE_FILES\s*=\s*\[[^\]]*\]/s,
      `const STATIC_CACHE_FILES = ${fileList}`
    );

    // ── Patch/Add: FILE_HASHES ──
    const hashJSON = JSON.stringify(hashes, null, 2);
    if (/const\s+FILE_HASHES\s*=/.test(sw)) {
      sw = sw.replace(
        /const\s+FILE_HASHES\s*=\s*\{[^}]*\}/s,
        `const FILE_HASHES = ${hashJSON}`
      );
    } else {
      const insertPoint = sw.indexOf('const STATIC_CACHE_FILES');
      const endOfList = sw.indexOf('];', insertPoint) + 2;
      sw = sw.slice(0, endOfList) +
        `\n\n// File integrity hashes — auto-verified on load\nconst FILE_HASHES = ${hashJSON};\n` +
        sw.slice(endOfList);
    }

    // ── Patch/Add: LAST_UPDATED ──
    if (/const\s+LAST_UPDATED\s*=/.test(sw)) {
      sw = sw.replace(
        /const\s+LAST_UPDATED\s*=\s*['"`][^'"`]+['"`]/,
        `const LAST_UPDATED = '${timestamp}'`
      );
    } else {
      const verMatch = sw.match(/const\s+CACHE_VERSION\s*=\s*['"`][^'"`]+['"`]/);
      if (verMatch) {
        const insertPos = verMatch.index + verMatch[0].length;
        sw = sw.slice(0, insertPos) +
          `\nconst LAST_UPDATED = '${timestamp}';` +
          sw.slice(insertPos);
      }
    }

    // ── Patch/Add: CRITICAL_OFFLINE ──
    if (!/CRITICAL_OFFLINE/.test(sw)) {
      const insertAfter = sw.indexOf('FILE_HASHES') > -1 
        ? sw.indexOf('FILE_HASHES') + 300
        : sw.indexOf('STATIC_CACHE_FILES') + 300;
      sw = sw.slice(0, insertAfter) +
        `\n// Critical offline — crisis support always available\nconst CRITICAL_OFFLINE = ${JSON.stringify(this.criticalFiles, null, 2)};\n` +
        sw.slice(insertAfter);
    }

    // Write back
    await fs.writeFile(swPath, sw, 'utf8');
    
    this.log(`Service Worker updated → ${path.relative(this.rootDir, swPath)}`, 'success');
    
    return { version, timestamp, fileCount: files.length, files, swPath };
  }

  // ==========================================
  // UPDATE MANIFEST — SYNC VERSION
  // ==========================================
  async updateManifest(version) {
    const manifestPath = await this.findFile(this.manifestPaths);
    if (!manifestPath) {
      this.log('manifest.json not found — skipping', 'warn');
      return;
    }

    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
      manifest.version = version;
      manifest.updatedAt = new Date().toISOString();
      manifest.short_name = manifest.short_name || 'Pleading Sanity';
      manifest.name = manifest.name || 'Pleading Sanity — Rise From Madness';
      
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      this.log(`Manifest synced → ${path.relative(this.rootDir, manifestPath)}`, 'success');
    } catch (err) {
      this.log(`Manifest update skipped: ${err.message}`, 'warn');
    }
  }

  // ==========================================
  // SAVE REPORT — INSIGHTS + WARNINGS
  // ==========================================
  async saveReport(result) {
    const largeFiles = [];
    const totalSize = { bytes: 0 };

    for (const file of result.files) {
      try {
        const diskPath = path.join(this.rootDir, file.slice(1));
        const stats = await fs.stat(diskPath);
        totalSize.bytes += stats.size;
        
        const kb = stats.size / 1024;
        if (kb > 300) {
          largeFiles.push({
            file,
            sizeKB: Math.round(kb),
            note: kb > 500 ? '⚠️ May slow caching' : 'Consider optimizing'
          });
        }
      } catch {}
    }

    const report = {
      project: 'Pleading Sanity',
      generated: new Date().toISOString(),
      version: result.version,
      serviceWorker: path.relative(this.rootDir, result.swPath),
      filesCached: result.fileCount,
      totalSizeKB: Math.round(totalSize.bytes / 1024),
      totalSizeMB: (totalSize.bytes / 1024 / 1024).toFixed(2),
      criticalOffline: this.criticalFiles,
      largeFiles,
      browserNote: 'New version detected → clients refresh automatically',
      nextStep: 'git add . && git commit -m "SW: update cache" && git push'
    };

    const reportPath = path.join(this.rootDir, 'sw-update-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Report saved → sw-update-report.json`, 'info');
    
    return report;
  }

  // ==========================================
  // MAIN EXECUTION
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 PWA SERVICE WORKER UPDATER ✧.═'.padStart(60, ' ') + '\n');

    // Locate files
    const swPath = await this.findFile(this.swPaths);
    if (!swPath) {
      this.log('❌ sw.js NOT FOUND', 'error');
      this.log('Checked: public/sw.js + sw.js', 'info');
      this.log('Create your service worker first or copy template', 'warn');
      process.exit(1);
    }

    // Run updates
    const result = await this.updateSW();
    await this.updateManifest(result.version);
    const report = await this.saveReport(result);

    // Final summary
    console.log('─'.repeat(55));
    this.log(`✅ VERSION: ${result.version}`, 'glow');
    this.log(`📄 FILES:   ${result.fileCount} cached`, 'info');
    this.log(`📦 SIZE:   ${report.totalSizeMB} MB total`, 'info');
    this.log(`🕐 SOURCE:  ${path.relative(this.rootDir, result.swPath)}`, 'info');
    
    if (report.largeFiles.length) {
      console.log('─'.repeat(55));
      this.log(`⚠️  ${report.largeFiles.length} large file(s) — consider optimizing:`, 'warn');
      report.largeFiles.slice(0, 3).forEach(f => {
        this.log(`   ${f.file} → ${f.sizeKB} KB`, 'warn');
      });
      if (report.largeFiles.length > 3) {
        this.log(`   …and ${report.largeFiles.length - 3} more`, 'warn');
      }
    }

    console.log('─'.repeat(55));
    this.log('🌐 Browser will detect & activate new version automatically', 'success');
    this.log('💙 Offline crisis support updated — always accessible', 'glow');
    console.log('═'.repeat(55) + '\n');
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new ServiceWorkerUpdater().run().catch(err => {
    console.error('\n💥 Fatal Error:', err.message);
    console.error('Check file paths & permissions above', '\n');
    process.exit(1);
  });
}

module.exports = ServiceWorkerUpdater;
