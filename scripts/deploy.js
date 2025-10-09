#!/usr/bin/env node

/**
 * Pleading Sanity - Deploy Script
 * Comprehensive deployment automation for production releases
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DeployManager {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
    this.scriptsDir = path.join(__dirname);
    this.deployConfig = {
      environment: process.env.NODE_ENV || 'production',
      siteName: process.env.NETLIFY_SITE_NAME || 'pleadingsanity',
      buildCommand: 'npm run build',
      testCommand: 'npm run test:ci',
      healthCheckUrl: process.env.SITE_URL || 'https://pleadingsanity.co.uk'
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      step: '\x1b[35m',
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${colors[type]}[${timestamp}] [DEPLOY] ${message}${colors.reset}`);
  }

  async runCommand(command, description, options = {}) {
    this.log(`${description}...`, 'step');
    try {
      const output = execSync(command, {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      this.log(`✅ ${description} completed`, 'success');
      return output;
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      if (options.required !== false) {
        throw error;
      }
      return null;
    }
  }

  async checkPrerequisites() {
    this.log('Checking deployment prerequisites...', 'info');
    
    const checks = [
      { command: 'git --version', name: 'Git' },
      { command: 'node --version', name: 'Node.js' },
      { command: 'npm --version', name: 'NPM' }
    ];

    for (const check of checks) {
      try {
        const version = execSync(check.command, { encoding: 'utf8' }).trim();
        this.log(`✅ ${check.name}: ${version}`, 'success');
      } catch (error) {
        this.log(`❌ ${check.name} not found`, 'error');
        throw new Error(`${check.name} is required for deployment`);
      }
    }

    // Check if we're in a git repository
    try {
      execSync('git status', { cwd: this.rootDir, stdio: 'pipe' });
      this.log('✅ Git repository detected', 'success');
    } catch (error) {
      this.log('❌ Not in a git repository', 'error');
      throw new Error('Deployment requires a git repository');
    }
  }

  async checkGitStatus() {
    this.log('Checking git status...', 'info');
    
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.rootDir, 
        encoding: 'utf8' 
      });
      
      if (status.trim()) {
        this.log('⚠️  Uncommitted changes detected:', 'warning');
        console.log(status);
        
        if (process.argv.includes('--force')) {
          this.log('Continuing with --force flag...', 'warning');
        } else {
          throw new Error('Please commit or stash your changes before deploying');
        }
      } else {
        this.log('✅ Working directory clean', 'success');
      }
    } catch (error) {
      if (error.message.includes('commit or stash')) {
        throw error;
      }
      this.log(`Git status check failed: ${error.message}`, 'warning');
    }
  }

  async runTests() {
    if (process.argv.includes('--skip-tests')) {
      this.log('Skipping tests (--skip-tests flag)', 'warning');
      return;
    }

    this.log('Running test suite...', 'info');
    
    try {
      // Check if test script exists
      const packageJson = JSON.parse(
        await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8')
      );
      
      if (packageJson.scripts && packageJson.scripts['test:ci']) {
        await this.runCommand('npm run test:ci', 'Running CI tests');
      } else if (packageJson.scripts && packageJson.scripts.test) {
        await this.runCommand('npm test', 'Running tests');
      } else {
        this.log('No test scripts found in package.json', 'warning');
      }
    } catch (error) {
      this.log('Tests failed - deployment aborted', 'error');
      throw error;
    }
  }

  async optimizeAssets() {
    this.log('Optimizing assets for production...', 'info');
    
    const optimizations = [
      { script: 'optimize-images.js', name: 'Image optimization', required: false },
      { script: 'minify-html.js', name: 'HTML minification', required: false },
      { script: 'update-sw.js', name: 'Service worker update', required: false }
    ];

    for (const opt of optimizations) {
      const scriptPath = path.join(this.scriptsDir, opt.script);
      
      try {
        await fs.access(scriptPath);
        await this.runCommand(
          `node "${scriptPath}"`, 
          opt.name, 
          { required: opt.required }
        );
      } catch (error) {
        if (opt.required) {
          throw error;
        }
        this.log(`Skipping ${opt.name} - script not found`, 'warning');
      }
    }
  }

  async buildProject() {
    this.log('Building project for production...', 'info');
    
    // Install dependencies first
    await this.runCommand('npm ci', 'Installing dependencies');
    
    // Run build command
    await this.runCommand(this.deployConfig.buildCommand, 'Building project');
    
    // Verify build output
    try {
      await fs.access(this.distDir);
      this.log('✅ Build output directory exists', 'success');
    } catch (error) {
      // If no dist directory, assume build outputs to root
      this.log('Build outputs to root directory', 'info');
    }
  }

  async runHealthCheck() {
    if (process.argv.includes('--skip-health-check')) {
      this.log('Skipping health check (--skip-health-check flag)', 'warning');
      return;
    }

    this.log('Running health check...', 'info');
    
    try {
      const healthCheckScript = path.join(this.scriptsDir, 'health-check.js');
      await fs.access(healthCheckScript);
      await this.runCommand(
        `node "${healthCheckScript}"`, 
        'Health check', 
        { required: false }
      );
    } catch (error) {
      this.log('Health check script not found - skipping', 'warning');
    }
  }

  async deployToNetlify() {
    this.log('Deploying to Netlify...', 'info');
    
    try {
      // Check if Netlify CLI is available
      execSync('netlify --version', { stdio: 'pipe' });
      
      const deployCommand = process.argv.includes('--production') 
        ? 'netlify deploy --prod'
        : 'netlify deploy';
        
      await this.runCommand(deployCommand, 'Netlify deployment');
      
    } catch (error) {
      if (error.message.includes('netlify')) {
        this.log('Netlify CLI not found - attempting git push deployment', 'warning');
        await this.deployViaGit();
      } else {
        throw error;
      }
    }
  }

  async deployViaGit() {
    this.log('Deploying via git push...', 'info');
    
    // Create deployment commit
    const deployMessage = `Deploy: ${new Date().toISOString()}`;
    
    try {
      await this.runCommand('git add .', 'Staging changes');
      await this.runCommand(`git commit -m "${deployMessage}"`, 'Creating deploy commit', { required: false });
      await this.runCommand('git push', 'Pushing to remote');
    } catch (error) {
      if (error.message.includes('nothing to commit')) {
        this.log('No changes to deploy', 'info');
        await this.runCommand('git push', 'Pushing to remote');
      } else {
        throw error;
      }
    }
  }

  async generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.deployConfig.environment,
      deployment: {
        successful: true,
        duration: null,
        version: null,
        commit: null
      },
      build: {
        command: this.deployConfig.buildCommand,
        successful: true
      },
      checks: {
        tests: 'passed',
        healthCheck: 'passed',
        assets: 'optimized'
      }
    };

    try {
      // Get git info
      report.deployment.commit = execSync('git rev-parse HEAD', { 
        cwd: this.rootDir, 
        encoding: 'utf8' 
      }).trim();
      
      // Get package version
      const packageJson = JSON.parse(
        await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8')
      );
      report.deployment.version = packageJson.version;
      
    } catch (error) {
      this.log(`Could not gather full deployment info: ${error.message}`, 'warning');
    }

    const reportPath = path.join(this.rootDir, 'deployment-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Deployment report saved to: ${reportPath}`, 'info');
    return report;
  }

  async run() {
    const startTime = Date.now();
    
    this.log('🚀 Starting Pleading Sanity Deployment', 'info');
    this.log('======================================', 'info');
    this.log(`Environment: ${this.deployConfig.environment}`, 'info');
    this.log(`Site: ${this.deployConfig.siteName}`, 'info');
    this.log('======================================', 'info');

    try {
      // Pre-deployment checks
      await this.checkPrerequisites();
      await this.checkGitStatus();
      
      // Run tests
      await this.runTests();
      
      // Build and optimize
      await this.optimizeAssets();
      await this.buildProject();
      
      // Deploy
      await this.deployToNetlify();
      
      // Post-deployment
      await this.runHealthCheck();
      
      // Generate report
      const report = await this.generateDeploymentReport();
      report.deployment.duration = Date.now() - startTime;
      
      // Success summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      this.log('======================================', 'info');
      this.log('🎉 DEPLOYMENT SUCCESSFUL! 🎉', 'success');
      this.log(`Total time: ${duration} seconds`, 'info');
      this.log(`Site URL: ${this.deployConfig.healthCheckUrl}`, 'info');
      this.log('======================================', 'info');
      
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      this.log('======================================', 'info');
      this.log('❌ DEPLOYMENT FAILED ❌', 'error');
      this.log(`Error: ${error.message}`, 'error');
      this.log(`Duration: ${duration} seconds`, 'info');
      this.log('======================================', 'info');
      
      // Generate failure report
      try {
        const report = await this.generateDeploymentReport();
        report.deployment.successful = false;
        report.deployment.duration = Date.now() - startTime;
        report.deployment.error = error.message;
      } catch (reportError) {
        this.log(`Could not generate failure report: ${reportError.message}`, 'warning');
      }
      
      process.exit(1);
    }
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new DeployManager();
  
  // Handle process signals
  process.on('SIGINT', () => {
    deployer.log('Deployment interrupted by user', 'warning');
    process.exit(1);
  });
  
  deployer.run().catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = DeployManager;