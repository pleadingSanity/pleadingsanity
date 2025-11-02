#!/usr/bin/env node

/**
 * Pleading Sanity - Health Check Script
 * Performs comprehensive health checks on the application
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class HealthChecker {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://pleadingsanity.co.uk';
    this.localPort = process.env.PORT || 3000;
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'PASS',
      checks: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
  }

  async checkFileExists(filePath, description) {
    try {
      await fs.promises.access(filePath);
      this.addResult('file-check', description, 'PASS', `File exists: ${filePath}`);
      return true;
    } catch (error) {
      this.addResult('file-check', description, 'FAIL', `File missing: ${filePath}`);
      return false;
    }
  }

  async checkUrl(url, description) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      protocol.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          this.addResult('url-check', description, 'PASS', `${url} returned ${res.statusCode}`);
          resolve(true);
        } else {
          this.addResult('url-check', description, 'FAIL', `${url} returned ${res.statusCode}`);
          resolve(false);
        }
      }).on('error', (error) => {
        this.addResult('url-check', description, 'FAIL', `${url} failed: ${error.message}`);
        resolve(false);
      }).setTimeout(5000, () => {
        this.addResult('url-check', description, 'FAIL', `${url} timeout`);
        resolve(false);
      });
    });
  }

  async checkManifest() {
    try {
      const manifestPath = path.join(__dirname, '..', 'manifest.json');
      const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
      
      const requiredFields = ['name', 'start_url', 'display', 'icons'];
      const missing = requiredFields.filter(field => !manifest[field]);
      
      if (missing.length === 0) {
        this.addResult('pwa-check', 'PWA Manifest', 'PASS', 'All required fields present');
        return true;
      } else {
        this.addResult('pwa-check', 'PWA Manifest', 'FAIL', `Missing fields: ${missing.join(', ')}`);
        return false;
      }
    } catch (error) {
      this.addResult('pwa-check', 'PWA Manifest', 'FAIL', error.message);
      return false;
    }
  }

  async checkServiceWorker() {
    const swPath = path.join(__dirname, '..', 'sw.js');
    return await this.checkFileExists(swPath, 'Service Worker');
  }

  async checkAssets() {
    const assets = [
      ['styles.css', 'Main CSS'],
      ['animations.css', 'Animations CSS'],
      ['accessibility.css', 'Accessibility CSS'],
      ['script.js', 'Main JavaScript'],
      ['error-handler.js', 'Error Handler'],
      ['assets/favicon.svg', 'Favicon SVG']
    ];

    const results = await Promise.all(
      assets.map(([file, desc]) => 
        this.checkFileExists(path.join(__dirname, '..', file), desc)
      )
    );

    return results.every(result => result);
  }

  async checkPages() {
    const pages = [
      ['index.html', 'Homepage'],
      ['about.html', 'About Page'],
      ['shop.html', 'Shop Page'],
      ['sanityhub.html', 'Sanity Hub'],
      ['feed.html', 'Feed Page'],
      ['games.html', 'Games Page'],
      ['videos.html', 'Videos Page'],
      ['movement.html', 'Movement Page'],
      ['journal-vault-viewer.html', 'Journal Vault Viewer']
    ];

    const results = await Promise.all(
      pages.map(([file, desc]) => 
        this.checkFileExists(path.join(__dirname, '..', file), desc)
      )
    );

    return results.every(result => result);
  }

  async checkNetlifyConfig() {
    const netlifyPath = path.join(__dirname, '..', 'netlify.toml');
    return await this.checkFileExists(netlifyPath, 'Netlify Configuration');
  }

  async checkEnvironmentVars() {
    const requiredEnvVars = [
      'NODE_ENV',
      'SITE_URL'
    ];

    const optionalEnvVars = [
      'YOUTUBE_API_KEY',
      'OPENAI_API_KEY',
      'MAILCHIMP_URL'
    ];

    let allRequired = true;
    let someOptional = false;

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addResult('env-check', `Required: ${envVar}`, 'PASS', 'Set');
      } else {
        this.addResult('env-check', `Required: ${envVar}`, 'FAIL', 'Not set');
        allRequired = false;
      }
    }

    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        this.addResult('env-check', `Optional: ${envVar}`, 'PASS', 'Set');
        someOptional = true;
      } else {
        this.addResult('env-check', `Optional: ${envVar}`, 'WARNING', 'Not set');
      }
    }

    return allRequired;
  }

  async checkSecurity() {
    const securityChecks = [
      ['package-lock.json', 'Package Lock File'],
      ['.gitignore', 'Git Ignore File'],
      ['.env.example', 'Environment Example']
    ];

    const results = await Promise.all(
      securityChecks.map(([file, desc]) => 
        this.checkFileExists(path.join(__dirname, '..', file), desc)
      )
    );

    // Check for sensitive files that shouldn't exist
    const sensitiveFiles = ['.env', 'config/keys.js'];
    for (const file of sensitiveFiles) {
      const filePath = path.join(__dirname, '..', file);
      try {
        await fs.promises.access(filePath);
        this.addResult('security-check', `Sensitive File: ${file}`, 'WARNING', 'File exists - ensure it\'s in .gitignore');
      } catch (error) {
        this.addResult('security-check', `Sensitive File: ${file}`, 'PASS', 'File not found (good)');
      }
    }

    return results.every(result => result);
  }

  addResult(category, description, status, details) {
    this.results.checks.push({
      category,
      description,
      status,
      details,
      timestamp: new Date().toISOString()
    });

    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    const logType = status === 'PASS' ? 'success' : status === 'FAIL' ? 'error' : 'warning';
    
    this.log(`${icon} ${description}: ${details}`, logType);

    if (status === 'FAIL') {
      this.results.overall = 'FAIL';
    } else if (status === 'WARNING' && this.results.overall === 'PASS') {
      this.results.overall = 'WARNING';
    }
  }

  async generateReport() {
    const reportPath = path.join(__dirname, '..', 'health-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`Health report saved to: ${reportPath}`, 'info');
  }

  async run() {
    this.log('Starting Pleading Sanity Health Check...', 'info');
    this.log('=====================================', 'info');

    // Run all checks
    await this.checkAssets();
    await this.checkPages();
    await this.checkManifest();
    await this.checkServiceWorker();
    await this.checkNetlifyConfig();
    await this.checkEnvironmentVars();
    await this.checkSecurity();

    // Optional: Check live URLs if site is deployed
    if (process.argv.includes('--check-urls')) {
      await this.checkUrl(this.siteUrl, 'Main Site');
      await this.checkUrl(`${this.siteUrl}/manifest.json`, 'PWA Manifest URL');
    }

    // Generate report
    await this.generateReport();

    // Summary
    this.log('=====================================', 'info');
    const passCount = this.results.checks.filter(c => c.status === 'PASS').length;
    const failCount = this.results.checks.filter(c => c.status === 'FAIL').length;
    const warnCount = this.results.checks.filter(c => c.status === 'WARNING').length;

    this.log(`Health Check Complete: ${this.results.overall}`, 
      this.results.overall === 'PASS' ? 'success' : 
      this.results.overall === 'FAIL' ? 'error' : 'warning');
    
    this.log(`Results: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`, 'info');

    // Exit with appropriate code
    process.exit(failCount > 0 ? 1 : 0);
  }
}

// Run health check if called directly
if (require.main === module) {
  const healthChecker = new HealthChecker();
  healthChecker.run().catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}

module.exports = HealthChecker;