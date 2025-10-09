#!/usr/bin/env node
// Deployment Readiness Checker for Pleading Sanity Platform
// Run this to verify platform is ready for live deployment

const fs = require('fs');
const path = require('path');

class DeploymentChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  async runAllChecks() {
    console.log('🚀 Checking Pleading Sanity Platform Deployment Readiness...\n');
    
    // Core file checks
    await this.checkCoreFiles();
    await this.checkNavigationConsistency();
    await this.checkSystemIntegration();
    await this.checkContentOptimization();
    await this.checkSecurity();
    
    this.generateReport();
  }

  async checkCoreFiles() {
    console.log('📁 Checking core files...');
    
    const requiredFiles = [
      'index.html',
      'about.html', 
      'sanityhub.html',
      'community-dashboard.html',
      'shop.html',
      'feed.html',
      'games.html',
      'videos.html',
      'movement.html',
      'crisis-response-system.js',
      'partnership-api-system.js', 
      'research-analytics-framework.js',
      'content-media-system.js',
      'platform-orchestrator.js',
      'maintenance-system.js',
      'error-handler.js',
      'styles.css'
    ];

    const missingFiles = [];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length === 0) {
      this.addCheck('✅ All core files present');
    } else {
      this.addError(`❌ Missing files: ${missingFiles.join(', ')}`);
    }
  }

  async checkNavigationConsistency() {
    console.log('🔗 Checking navigation consistency...');
    
    const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
    const linkPattern = /href="([^"]+\.html)"/g;
    const allLinks = new Set();
    const caseIssues = [];
    
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      
      while ((match = linkPattern.exec(content)) !== null) {
        const link = match[1];
        allLinks.add(link);
        
        // Check for case sensitivity issues
        if (link !== link.toLowerCase()) {
          caseIssues.push(`${file}: ${link}`);
        }
        
        // Check if linked file exists
        if (!fs.existsSync(link)) {
          this.addError(`❌ Broken link in ${file}: ${link}`);
        }
      }
    }
    
    if (caseIssues.length === 0) {
      this.addCheck('✅ Navigation links consistent');
    } else {
      this.addWarning(`⚠️ Case sensitivity issues: ${caseIssues.join(', ')}`);
    }
  }

  async checkSystemIntegration() {
    console.log('🎯 Checking system integration...');
    
    const systemFiles = [
      'crisis-response-system.js',
      'partnership-api-system.js',
      'research-analytics-framework.js', 
      'content-media-system.js',
      'platform-orchestrator.js'
    ];
    
    let integrationScore = 0;
    
    for (const file of systemFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for proper class definitions
        if (content.includes('class ') && content.includes('constructor')) {
          integrationScore++;
        }
        
        // Check for global window assignment
        if (content.includes('window.')) {
          integrationScore++;
        }
      }
    }
    
    const integrationPercentage = (integrationScore / (systemFiles.length * 2)) * 100;
    
    if (integrationPercentage >= 80) {
      this.addCheck(`✅ System integration: ${Math.round(integrationPercentage)}%`);
    } else {
      this.addError(`❌ System integration incomplete: ${Math.round(integrationPercentage)}%`);
    }
  }

  async checkContentOptimization() {
    console.log('⚡ Checking content optimization...');
    
    const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
    let optimizationScore = 0;
    let totalChecks = 0;
    
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      totalChecks += 4;
      
      // Check for meta descriptions
      if (content.includes('name="description"')) {
        optimizationScore++;
      }
      
      // Check for viewport meta
      if (content.includes('name="viewport"')) {
        optimizationScore++;
      }
      
      // Check for structured data
      if (content.includes('application/ld+json')) {
        optimizationScore++;
      }
      
      // Check for performance optimizations
      if (content.includes('defer') || content.includes('loading="lazy"')) {
        optimizationScore++;
      }
    }
    
    const optimizationPercentage = (optimizationScore / totalChecks) * 100;
    
    if (optimizationPercentage >= 75) {
      this.addCheck(`✅ Content optimization: ${Math.round(optimizationPercentage)}%`);
    } else {
      this.addWarning(`⚠️ Content optimization could be improved: ${Math.round(optimizationPercentage)}%`);
    }
  }

  async checkSecurity() {
    console.log('🔒 Checking security implementation...');
    
    const securityFeatures = [];
    
    // Check for privacy implementation
    if (fs.existsSync('research-analytics-framework.js')) {
      const content = fs.readFileSync('research-analytics-framework.js', 'utf8');
      if (content.includes('differential') && content.includes('privacy')) {
        securityFeatures.push('Differential Privacy');
      }
      if (content.includes('consent')) {
        securityFeatures.push('Consent Management');
      }
      if (content.includes('anonymize')) {
        securityFeatures.push('Data Anonymization');
      }
    }
    
    // Check for crisis response security
    if (fs.existsSync('crisis-response-system.js')) {
      const content = fs.readFileSync('crisis-response-system.js', 'utf8');
      if (content.includes('emergency') || content.includes('fallback')) {
        securityFeatures.push('Emergency Protocols');
      }
    }
    
    if (securityFeatures.length >= 3) {
      this.addCheck(`✅ Security features: ${securityFeatures.join(', ')}`);
    } else {
      this.addWarning(`⚠️ Limited security features: ${securityFeatures.join(', ')}`);
    }
  }

  addCheck(message) {
    this.checks.push(message);
    console.log(message);
  }

  addError(message) {
    this.errors.push(message);
    console.log(message);
  }

  addWarning(message) {
    this.warnings.push(message);
    console.log(message);
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PLEADING SANITY DEPLOYMENT READINESS REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Passed Checks: ${this.checks.length}`);
    this.checks.forEach(check => console.log(`   ${check}`));
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${this.warnings.length}`);
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`   ${error}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('🚀 PLATFORM IS READY FOR DEPLOYMENT! 🚀');
      console.log('\nNext steps:');
      console.log('1. Read DEPLOYMENT-GUIDE.md for deployment instructions');
      console.log('2. Choose a hosting platform (Netlify recommended)');
      console.log('3. Deploy and test all systems');
      console.log('4. Monitor system health indicators');
    } else {
      console.log('⚠️  DEPLOYMENT BLOCKED - Fix errors before deploying');
      console.log('\nPlease address the errors above before deployment.');
    }
    
    console.log('\n🧠 Pleading Sanity - Rise From Madness 🌌');
    console.log('='.repeat(60));
  }
}

// Run deployment check
const checker = new DeploymentChecker();
checker.runAllChecks().catch(console.error);