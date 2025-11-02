#!/usr/bin/env node

/**
 * Pleading Sanity - Service Worker Update Script
 * Updates service worker cache version and manages cache invalidation
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ServiceWorkerUpdater {
  constructor() {
    this.swPath = path.join(__dirname, '..', 'sw.js');
    this.manifestPath = path.join(__dirname, '..', 'manifest.json');
    this.assetsDir = path.join(__dirname, '..', 'assets');
    this.cacheableExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.json', '.ico'];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[SW-UPDATE] ${message}${colors.reset}`);
  }

  async generateCacheVersion() {
    // Generate version based on current timestamp and git commit (if available)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      // Try to get git commit hash
      const { execSync } = require('child_process');
      const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      return `v${timestamp}-${gitHash}`;
    } catch (error) {
      // Fallback to timestamp only
      return `v${timestamp}`;
    }
  }

  async getAllCacheableFiles(dir = path.join(__dirname, '..'), baseDir = path.join(__dirname, '..')) {
    const files = [];
    const skipDirs = ['node_modules', '.git', '.next', 'coverage', 'dist', 'scripts'];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        
        if (entry.isDirectory() && !skipDirs.includes(entry.name) && !entry.name.startsWith('.')) {
          const subFiles = await this.getAllCacheableFiles(fullPath, baseDir);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (this.cacheableExtensions.includes(ext)) {
            files.push('/' + relativePath.replace(/\\/g, '/'));
          }
        }
      }
    } catch (error) {
      this.log(`Error reading directory ${dir}: ${error.message}`, 'error');
    }
    
    return files;
  }

  async generateFileHash(filePath) {
    try {
      const content = await fs.readFile(filePath);
      return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    } catch (error) {
      return 'unknown';
    }
  }

  async updateServiceWorker() {
    try {
      // Read current service worker
      const swContent = await fs.readFile(this.swPath, 'utf8');
      
      // Generate new cache version
      const newVersion = await this.generateCacheVersion();
      this.log(`Generated new cache version: ${newVersion}`, 'info');
      
      // Get all cacheable files
      const cacheableFiles = await this.getAllCacheableFiles();
      this.log(`Found ${cacheableFiles.length} cacheable files`, 'info');
      
      // Generate file hashes for cache busting
      const fileHashes = {};
      for (const file of cacheableFiles) {
        const fullPath = path.join(__dirname, '..', file.substring(1));
        fileHashes[file] = await this.generateFileHash(fullPath);
      }
      
      // Update cache version
      let updatedContent = swContent.replace(
        /const CACHE_VERSION = ['"`][^'"`]*['"`];?/,
        `const CACHE_VERSION = '${newVersion}';`
      );
      
      // Update cache name
      updatedContent = updatedContent.replace(
        /const CACHE_NAME = ['"`][^'"`]*['"`];?/,
        `const CACHE_NAME = 'pleading-sanity-${newVersion}';`
      );
      
      // Update static cache files list
      const staticCacheArray = JSON.stringify(cacheableFiles, null, 2);
      updatedContent = updatedContent.replace(
        /const STATIC_CACHE_FILES = \[[^\]]*\];?/s,
        `const STATIC_CACHE_FILES = ${staticCacheArray};`
      );
      
      // Add file hash mapping for cache validation
      const hashMapping = JSON.stringify(fileHashes, null, 2);
      if (updatedContent.includes('FILE_HASHES = {')) {
        updatedContent = updatedContent.replace(
          /const FILE_HASHES = \{[^}]*\};?/s,
          `const FILE_HASHES = ${hashMapping};`
        );
      } else {
        // Add file hashes section if it doesn't exist
        const insertAfterCache = updatedContent.indexOf('const STATIC_CACHE_FILES = ');
        if (insertAfterCache !== -1) {
          const endOfCacheFiles = updatedContent.indexOf('];', insertAfterCache) + 2;
          updatedContent = updatedContent.slice(0, endOfCacheFiles) + 
            `\n\n// File hashes for cache validation\nconst FILE_HASHES = ${hashMapping};\n` +
            updatedContent.slice(endOfCacheFiles);
        }
      }
      
      // Update timestamp
      const timestamp = new Date().toISOString();
      if (updatedContent.includes('LAST_UPDATED = ')) {
        updatedContent = updatedContent.replace(
          /const LAST_UPDATED = ['"`][^'"`]*['"`];?/,
          `const LAST_UPDATED = '${timestamp}';`
        );
      } else {
        // Add timestamp if it doesn't exist
        const insertAfterVersion = updatedContent.indexOf(`const CACHE_VERSION = '${newVersion}';`) + `const CACHE_VERSION = '${newVersion}';`.length;
        updatedContent = updatedContent.slice(0, insertAfterVersion) + 
          `\nconst LAST_UPDATED = '${timestamp}';\n` +
          updatedContent.slice(insertAfterVersion);
      }
      
      // Write updated service worker
      await fs.writeFile(this.swPath, updatedContent, 'utf8');
      this.log('Service worker updated successfully', 'success');
      
      return {
        version: newVersion,
        timestamp: timestamp,
        filesCount: cacheableFiles.length,
        files: cacheableFiles
      };
      
    } catch (error) {
      this.log(`Failed to update service worker: ${error.message}`, 'error');
      throw error;
    }
  }

  async updateManifest() {
    try {
      // Read current manifest
      const manifestContent = await fs.readFile(this.manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      // Update version in manifest (if it exists)
      if (manifest.version) {
        const newVersion = await this.generateCacheVersion();
        manifest.version = newVersion;
        manifest.updated = new Date().toISOString();
        
        // Write updated manifest
        await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        this.log('PWA manifest updated', 'success');
      }
      
      return manifest;
    } catch (error) {
      this.log(`Failed to update manifest: ${error.message}`, 'warning');
      return null;
    }
  }

  async generateCacheReport(updateResult) {
    const report = {
      timestamp: new Date().toISOString(),
      serviceWorker: {
        version: updateResult.version,
        lastUpdated: updateResult.timestamp,
        cacheableFiles: updateResult.filesCount,
        files: updateResult.files
      },
      recommendations: []
    };

    // Add recommendations based on analysis
    if (updateResult.filesCount > 100) {
      report.recommendations.push({
        type: 'performance',
        message: 'Consider implementing selective caching - you have many cacheable files',
        impact: 'medium'
      });
    }

    // Check for large files that might impact cache performance
    const largeFiles = [];
    for (const file of updateResult.files) {
      try {
        const fullPath = path.join(__dirname, '..', file.substring(1));
        const stats = await fs.stat(fullPath);
        if (stats.size > 1024 * 1024) { // Files larger than 1MB
          largeFiles.push({ file, size: stats.size });
        }
      } catch (error) {
        // File might not exist, skip
      }
    }

    if (largeFiles.length > 0) {
      report.recommendations.push({
        type: 'optimization',
        message: `Found ${largeFiles.length} large files that might slow down caching`,
        files: largeFiles,
        impact: 'high'
      });
    }

    const reportPath = path.join(__dirname, '..', 'sw-update-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Service worker update report saved to: ${reportPath}`, 'info');
    return report;
  }

  async run() {
    this.log('Starting Service Worker Update...', 'info');
    this.log('==================================', 'info');

    try {
      // Check if service worker exists
      await fs.access(this.swPath);
      
      // Update service worker
      const updateResult = await this.updateServiceWorker();
      
      // Update manifest
      await this.updateManifest();
      
      // Generate report
      const report = await this.generateCacheReport(updateResult);
      
      // Summary
      this.log('==================================', 'info');
      this.log(`Service Worker Update Complete!`, 'success');
      this.log(`  New version: ${updateResult.version}`, 'info');
      this.log(`  Files to cache: ${updateResult.filesCount}`, 'info');
      this.log(`  Last updated: ${updateResult.timestamp}`, 'info');
      
      if (report.recommendations.length > 0) {
        this.log(`  Recommendations: ${report.recommendations.length} items`, 'warning');
      }

    } catch (error) {
      if (error.code === 'ENOENT' && error.path === this.swPath) {
        this.log('Service worker file not found - skipping update', 'warning');
        this.log('Run the PWA setup first to create the service worker', 'info');
      } else {
        this.log(`Service worker update failed: ${error.message}`, 'error');
        throw error;
      }
    }
  }
}

// Run update if called directly
if (require.main === module) {
  const updater = new ServiceWorkerUpdater();
  updater.run().catch(error => {
    console.error('Service worker update failed:', error);
    process.exit(1);
  });
}

module.exports = ServiceWorkerUpdater;