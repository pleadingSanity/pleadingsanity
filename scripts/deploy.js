#!/usr/bin/env node

/**
 * PLEADING SANITY — DEPLOYMENT AUTOMATION v2.1-FINAL
 * God Mode Deploy • Netlify + Git Fallback • Full Validation
 * Evolution, Not Erasure • pleadingSanity / pleadingsanity.co.uk
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DeployManager {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
    this.scriptsDir = __dirname;

    // ==========================================
    // CONFIG LOCKED IN — YOUR SITE, YOUR BRANCH
    // ==========================================
    this.deployConfig = {
      environment: process.env.NODE_ENV || 'production',
      siteName: process.env.NETLIFY_SITE_NAME || 'pleadingsanity',
      siteUrl: process.env.SITE_URL || 'https://pleadingsanity.co.uk',
      buildCommand: 'npm run build',
      testCommand: 'npm run test:ci',
      mainBranch: 'main',
      requireCleanWorkingTree: !process.argv.includes('--force')
    };

    this.startTime = null;
  }

  // ==========================================
  // COSMIC LOGGING — CLEAR, COLOURED, TIMESTAMPED
  // ==========================================
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',     // cyan
      success: '\x1b[32m',  // green
      warning: '\x1b[33m',  // yellow
      error: '\x1b[31m',    // red
      step: '\x1b[35m',     // magenta
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${colors[type]}[${timestamp}] [DEPLOY] ${message}${colors.reset}`);
  }

  // ==========================================
  // SAFE COMMAND RUNNER — CONSISTENT ERROR HANDLING
  // ==========================================
  async runCommand(command, description, options = {}) {
    this.log(`→ ${description}…`, 'step');
    try {
      const output = execSync(command, {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      this.log(`✅ ${description}`, 'success');
      return output;
    } catch (error) {
      this.log(`❌ ${description} failed`, 'error');
      this.log(`   Error: ${error.message.trim()}`, 'error');
      
      if (options.required !== false) {
        throw new Error(`${description} failed: ${error.message}`);
      }
      return null;
    }
  }

  // ==========================================
  // STEP 1 — CHECK EVERYTHING INSTALLED
  // ==========================================
  async checkPrerequisites() {
    this.log('Checking system prerequisites…', 'info');
    
    const checks = [
      { cmd: 'git --version', name: 'Git' },
      { cmd: 'node --version', name: 'Node.js' },
      { cmd: 'npm --version', name: 'NPM' }
    ];

    for (const check of checks) {
      try {
        const ver = execSync(check.cmd, { encoding: 'utf8' }).trim();
        this.log(`✅ ${check.name}: ${ver}`, 'success');
      } catch {
        this.log(`❌ ${check.name} not found — required`, 'error');
        throw new Error(`${check.name} is missing. Install it first.`);
      }
    }

    // Verify git repo
    try {
      execSync('git rev-parse --is-inside-work-tree', { cwd: this.rootDir, stdio: 'pipe' });
      this.log('✅ Git repository confirmed', 'success');
    } catch {
      throw new Error('Not inside a Git repository. Run from your project root.');
    }
  }

  // ==========================================
  // STEP 2 — CHECK NOTHING UNCOMMITTED
  // ==========================================
  async checkGitStatus() {
    this.log('Checking Git status…', 'info');
    
    const status = execSync('git status --porcelain', { 
      cwd: this.rootDir, 
      encoding: 'utf8' 
    }).trim();

    if (status) {
      this.log('⚠️ Uncommitted changes detected:', 'warning');
      console.log(status);
      
      if (this.deployConfig.requireCleanWorkingTree) {
        throw new Error('Commit or stash changes first • Use --force to skip');
      }
      this.log('⚠️ Continuing anyway (--force mode)', 'warning');
    } else {
      this.log('✅ Working directory clean', 'success');
    }

    // Current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    this.log(`📍 Current branch: ${branch}`, 'info');
  }

  // ==========================================
  // STEP 3 — RUN TESTS IF THEY EXIST
  // ==========================================
  async runTests() {
    if (process.argv.includes('--skip-tests')) {
      this.log('⏭️ Tests skipped (--skip-tests)', 'warning');
      return;
    }

    this.log('Running tests…', 'info');
    
    let pkg;
    try {
      pkg = JSON.parse(await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8'));
    } catch {
      this.log('⚠️ No package.json found — skipping tests', 'warning');
      return;
    }

    const scripts = pkg.scripts || {};
    
    if (scripts['test:ci']) {
      await this.runCommand('npm run test:ci', 'CI Test Suite');
    } else if (scripts.test) {
      await this.runCommand('npm test', 'Test Suite');
    } else {
      this.log('ℹ️ No test scripts defined', 'info');
    }
  }

  // ==========================================
  // STEP 4 — OPTIMIZE ASSETS
  // ==========================================
  async optimizeAssets() {
    this.log('Optimizing production assets…', 'info');
    
    const optimizations = [
      { file: 'optimize-images.js', label: 'Image Optimization', required: false },
      { file: 'minify-html.js', label: 'HTML Minification', required: false },
      { file: 'update-sw.js', label: 'Service Worker', required: false }
    ];

    for (const item of optimizations) {
      const fullPath = path.join(this.scriptsDir, item.file);
      try {
        await fs.access(fullPath);
        await this.runCommand(`node "${fullPath}"`, item.label, { required: item.required });
      } catch {
        if (item.required) throw new Error(`${item.label} script missing`);
        this.log(`⏭️ ${item.label} — not present, skipping`, 'info');
      }
    }
  }

  // ==========================================
  // STEP 5 — BUILD THE SITE
  // ==========================================
  async buildProject() {
    this.log('Building for production…', 'info');
    
    await this.runCommand('npm ci', 'Installing Dependencies');
    await this.runCommand(this.deployConfig.buildCommand, 'Build Process');

    // Verify output
    try {
      await fs.access(this.distDir);
      this.log('✅ Build folder verified: /dist', 'success');
    } catch {
      this.log('ℹ️ Build outputs to root directory', 'info');
    }
  }

  // ==========================================
  // STEP 6 — DEPLOY TO NETLIFY
  // ==========================================
  async deployToNetlify() {
    this.log('Deploying to Netlify…', 'info');
    
    const isProd = process.argv.includes('--production');
    const deployCmd = isProd 
      ? 'netlify deploy --prod' 
      : 'netlify deploy';

    try {
      execSync('netlify --version', { stdio: 'pipe' });
      await this.runCommand(deployCmd, isProd ? 'Production Deploy' : 'Draft Deploy');
      return true;
    } catch {
      this.log('⚠️ Netlify CLI not installed — falling back to Git deploy', 'warning');
      return await this.deployViaGit();
    }
  }

  // ==========================================
  // FALLBACK — DEPLOY VIA GIT PUSH
  // ==========================================
  async deployViaGit() {
    this.log('Deploying via Git push…', 'info');
    
    const msg = `Deploy: ${new Date().toISOString()}`;
    
    try {
      await this.runCommand('git add .', 'Staging files', { required: false });
      
      try {
        await this.runCommand(`git commit -m "${msg}"`, 'Creating commit', { required: false });
      } catch {
        this.log('ℹ️ Nothing new to commit', 'info');
      }
      
      await this.runCommand('git push', 'Pushing to GitHub');
      this.log('✅ Git push complete — Netlify auto-deploys from main', 'success');
      return true;
    } catch (err) {
      this.log(`❌ Git deploy failed: ${err.message}`, 'error');
      throw err;
    }
  }

  // ==========================================
  // STEP 7 — HEALTH CHECK
  // ==========================================
  async runHealthCheck() {
    if (process.argv.includes('--skip-health-check')) {
      this.log('⏭️ Health check skipped', 'warning');
      return;
    }

    this.log('Running post-deploy health check…', 'info');
    
    const healthScript = path.join(this.scriptsDir, 'health-check.js');
    try {
      await fs.access(healthScript);
      await this.runCommand(`node "${healthScript}"`, 'Health Check', { required: false });
    } catch {
      this.log(`ℹ️ Check manually: ${this.deployConfig.siteUrl}`, 'info');
    }
  }

  // ==========================================
  // STEP 8 — GENERATE DEPLOYMENT REPORT
  // ==========================================
  async generateReport(success = true, errorMsg = null) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    let commit = 'unknown';
    let version = 'unknown';
    
    try {
      commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      const pkg = JSON.parse(await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8'));
      version = pkg.version || '0.1.0';
    } catch { /* ignore */ }

    const report = {
      project: 'Pleading Sanity',
      timestamp: new Date().toISOString(),
      environment: this.deployConfig.environment,
      siteUrl: this.deployConfig.siteUrl,
      version,
      commit,
      durationSeconds: parseFloat(duration),
      success,
      error: errorMsg
    };

    const reportPath = path.join(this.rootDir, 'deployment-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Report saved: deployment-report.json`, 'info');
    return report;
  }

  // ==========================================
  // MAIN RUN SEQUENCE
  // ==========================================
  async run() {
    this.startTime = Date.now();
    
    console.log('\n' + '═.✧ 🌌 PLEADING SANITY DEPLOYMENT ✧.═'.padStart(60, ' ') + '\n');
    this.log('🚀 Starting deployment sequence', 'info');
    this.log(`Site: ${this.deployConfig.siteUrl}`, 'info');
    this.log(`Env:  ${this.deployConfig.environment}`, 'info');
    console.log('─'.repeat(50));

    try {
      await this.checkPrerequisites();
      await this.checkGitStatus();
      await this.runTests();
      await this.optimizeAssets();
      await this.buildProject();
      await this.deployToNetlify();
      await this.runHealthCheck();
      
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
      await this.generateReport(true);
      
      console.log('\n' + '🎉✨ DEPLOYMENT SUCCESSFUL ✨🎉'.padStart(55, ' ') + '\n');
      this.log(`✅ Site live: ${this.deployConfig.siteUrl}`, 'success');
      this.log(`⏱️  Total time: ${duration}s`, 'info');
      console.log('═'.repeat(50) + '\n');
      
    } catch (err) {
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
      await this.generateReport(false, err.message);
      
      console.log('\n' + '❌ DEPLOYMENT FAILED ❌'.padStart(52, ' ') + '\n');
      this.log(`Reason: ${err.message}`, 'error');
      this.log(`⏱️  Ran for: ${duration}s`, 'info');
      console.log('═'.repeat(50) + '\n');
      process.exit(1);
    }
  }
}

// ==========================================
// ENTRY POINT — RUN WHEN CALLED DIRECTLY
// ==========================================
if (require.main === module) {
  const deployer = new DeployManager();

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    deployer.log('⚠️ Deployment interrupted by user', 'warning');
    process.exit(130);
  });

  deployer.run().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
}

module.exports = DeployManager;
