#!/usr/bin/env node

/**
 * PLEADING SANITY — SERVICE WORKER UPDATER v2.1-FINAL
 * Auto-Version • Smart Cache • Hash Validation • PWA Sync
 * Evolution, Not Erasure • pleadingSanity
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class ServiceWorkerUpdater {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.swPath = path.join(this.rootDir, 'sw.js');
    this.manifestPath = path.join(this.rootDir, 'manifest.json');
    
    this.cacheExts = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.json', '.ico', '.woff2', '.woff'];
    this.skipDirs = ['node_modules', '.git', 'dist', 'scripts', 'coverage', '.next'];
  }

  // ==========================================
  // COSMIC LOGGING
  // ==========================================
  log(msg, type = 'info') {
    const C = { info: '\x1b[36m', success: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${C[type]}[${ts}] [SW] ${msg}${C.reset}`);
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
  // SCAN CACHEABLE FILES
  // ==========================================
  async scanFiles(dir = this.rootDir, base = this.rootDir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const e of entries) {
      const full = path.join(dir, e.name);
      const rel = '/' + path.relative(base, full).replace(/\\/g, '/');

      if (e.isDirectory()) {
        if (!this.skipDirs.includes(e.name) && !e.name.startsWith('.')) {
          files.push(...(await this.scanFiles(full, base)));
        }
      } else if (this.cacheExts.some(ext => e.name.toLowerCase().endsWith(ext))) {
        files.push(rel);
      }
    }
    return files;
  }

  // ==========================================
  // MD5 HASH — detect actual changes
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
  // UPDATE sw.js — all sections
  // ==========================================
  async updateSW() {
    // Read existing SW
    let sw = await fs.readFile(this.swPath, 'utf8');
    const version = this.makeVersion();
    const stamp = new Date().toISOString();
    const files = await this.scanFiles();

    // Build file hashes
    const hashes = {};
    for (const f of files) {
      hashes[f] = await this.hashFile(path.join(this.rootDir, f.slice(1)));
    }

    // Patch: CACHE_VERSION
    sw = sw.replace(
      /const\s+CACHE_VERSION\s*=\s*['"`][^'"`]+['"`]/,
      `const CACHE_VERSION = '${version}'`
    );

    // Patch: CACHE_NAME
    sw = sw.replace(
      /const\s+CACHE_NAME\s*=\s*['"`][^'"`]+['"`]/,
      `const CACHE_NAME = 'pleading-sanity-${version}'`
    );

    // Patch: STATIC_CACHE_FILES
    const fileList = JSON.stringify(files, null, 2);
    sw = sw.replace(
      /const\s+STATIC_CACHE_FILES\s*=\s*\[[^\]]*\]/s,
      `const STATIC_CACHE_FILES = ${fileList}`
    );

    // Patch/add: FILE_HASHES
    const hashJSON = JSON.stringify(hashes, null, 2);
    if (/const\s+FILE_HASHES\s*=/.test(sw)) {
      sw = sw.replace(
        /const\s+FILE_HASHES\s*=\s*\{[^}]*\}/s,
        `const FILE_HASHES = ${hashJSON}`
      );
    } else {
      const insertAt = sw.indexOf('const STATIC_CACHE_FILES');
      const endList = sw.indexOf('];', insertAt) + 2;
      sw = sw.slice(0, endList) +
        `\n\n// File integrity hashes — auto-updated\nconst FILE_HASHES = ${hashJSON};\n` +
        sw.slice(endList);
    }

    // Patch/add: LAST_UPDATED
    if (/const\s+LAST_UPDATED\s*=/.test(sw)) {
      sw = sw.replace(
        /const\s+LAST_UPDATED\s*=\s*['"`][^'"`]+['"`]/,
        `const LAST_UPDATED = '${stamp}'`
      );
    } else {
      const verEnd = sw.indexOf('const CACHE_VERSION') + `const CACHE_VERSION = '${version}'`.length;
      sw = sw.slice(0, verEnd) +
        `\nconst LAST_UPDATED = '${stamp}';` +
        sw.slice(verEnd);
    }

    // Write back
    await fs.writeFile(this.swPath, sw, 'utf8');
    return { version, stamp, fileCount: files.length, files };
  }

  // ==========================================
  // UPDATE manifest.json
  // ==========================================
  async updateManifest() {
    try {
      const json = JSON.parse(await fs.readFile(this.manifestPath, 'utf8'));
      json.version = this.makeVersion();
      json.updated = new Date().toISOString();
      await fs.writeFile(this.manifestPath, JSON.stringify(json, null, 2), 'utf8');
      this.log('manifest.json synced ✅', 'success');
    } catch {
      this.log('manifest.json not found — skipped', 'warn');
    }
  }

  // ==========================================
  // SAVE REPORT
  // ==========================================
  async saveReport(result) {
    const report = {
      timestamp: new Date().toISOString(),
      version: result.version,
      filesCached: result.fileCount,
      recommendations: []
    };

    // Flag large files
    const large = [];
    for (const f of result.files) {
      try {
        const kb = (await fs.stat(path.join(this.rootDir, f.slice(1)))).size / 1024;
        if (kb > 500) large.push({ file: f, sizeKB: Math.round(kb) });
      } catch {}
    }
    if (large.length) {
      report.recommendations.push({
        note: `${large.length} large file(s) may slow caching`,
        files: large
      });
    }

    await fs.writeFile(
      path.join(this.rootDir, 'sw-update-report.json'),
      JSON.stringify(report, null, 2)
    );
    this.log('sw-update-report.json saved 📄', 'info');
  }

  // ==========================================
  // MAIN RUN
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 SERVICE WORKER UPDATER ✧.═'.padStart(55, ' ') + '\n');

    // Check SW exists
    try {
      await fs.access(this.swPath);
    } catch {
      this.log('sw.js NOT FOUND — create it first', 'error');
      this.log('Run PWA setup or add sw.js to your project root', 'info');
      process.exit(1);
    }

    // Do the work
    const result = await this.updateSW();
    await this.updateManifest();
    await this.saveReport(result);

    // Final summary
    console.log('─'.repeat(50));
    this.log(`✅ VERSION: ${result.version}`, 'success');
    this.log(`📄 FILES:   ${result.fileCount} cached`, 'info');
    this.log(`🕐 UPDATED: ${result.stamp}`, 'info');
    console.log('─'.repeat(50));
    this.log('Browser will detect new version → refresh automatically ✨', 'success');
    console.log('═'.repeat(50) + '\n');
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new ServiceWorkerUpdater().run().catch(err => {
    console.error('💥 Error:', err.message);
    process.exit(1);
  });
}

module.exports = ServiceWorkerUpdater;
