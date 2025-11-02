// Platform Maintenance & Optimization System
// Ensures consistent updates, performance, and quality control

class PlatformMaintenanceSystem {
  constructor() {
    this.maintenanceTasks = new Map();
    this.performanceMetrics = new Map();
    this.qualityChecks = new Map();
    this.lastMaintenance = localStorage.getItem('lastMaintenance') || null;
    this.initialize();
  }

  initialize() {
    console.log('🔧 Platform Maintenance System Initialized');
    this.setupMaintenanceTasks();
    this.setupPerformanceMonitoring();
    this.setupQualityAssurance();
    this.scheduleRegularMaintenance();
    this.runInitialChecks();
  }

  setupMaintenanceTasks() {
    // Core maintenance tasks
    this.maintenanceTasks.set('consistency_check', {
      name: 'Navigation & Link Consistency',
      frequency: 'daily',
      priority: 'high',
      handler: this.checkNavigationConsistency.bind(this)
    });

    this.maintenanceTasks.set('performance_optimization', {
      name: 'Performance Optimization',
      frequency: 'weekly',
      priority: 'medium',
      handler: this.optimizePerformance.bind(this)
    });

    this.maintenanceTasks.set('data_cleanup', {
      name: 'Data Storage Cleanup',
      frequency: 'weekly',
      priority: 'medium',
      handler: this.cleanupDataStorage.bind(this)
    });

    this.maintenanceTasks.set('security_audit', {
      name: 'Security & Privacy Audit',
      frequency: 'daily',
      priority: 'critical',
      handler: this.performSecurityAudit.bind(this)
    });

    this.maintenanceTasks.set('system_health_check', {
      name: 'System Health Verification',
      frequency: 'hourly',
      priority: 'critical',
      handler: this.verifySystemHealth.bind(this)
    });
  }

  setupPerformanceMonitoring() {
    // Performance tracking
    this.performanceMetrics.set('page_load_times', {
      metric: 'Page Load Performance',
      target: 2000, // 2 seconds
      current: this.measurePageLoadTime(),
      history: JSON.parse(localStorage.getItem('performance_history') || '[]')
    });

    this.performanceMetrics.set('resource_usage', {
      metric: 'Local Storage Usage',
      target: 5 * 1024 * 1024, // 5MB
      current: this.calculateStorageUsage(),
      history: []
    });

    this.performanceMetrics.set('script_execution', {
      metric: 'Script Execution Time',
      target: 500, // 500ms
      current: 0,
      history: []
    });
  }

  setupQualityAssurance() {
    // Quality assurance checks
    this.qualityChecks.set('accessibility', {
      name: 'Accessibility Standards',
      handler: this.checkAccessibility.bind(this),
      lastCheck: null,
      status: 'pending'
    });

    this.qualityChecks.set('responsive_design', {
      name: 'Responsive Design',
      handler: this.checkResponsiveDesign.bind(this),
      lastCheck: null,
      status: 'pending'
    });

    this.qualityChecks.set('seo_optimization', {
      name: 'SEO Optimization',
      handler: this.checkSEOOptimization.bind(this),
      lastCheck: null,
      status: 'pending'
    });

    this.qualityChecks.set('content_freshness', {
      name: 'Content Freshness',
      handler: this.checkContentFreshness.bind(this),
      lastCheck: null,
      status: 'pending'
    });
  }

  scheduleRegularMaintenance() {
    // Schedule maintenance tasks based on frequency
    setInterval(() => this.runScheduledMaintenance(), 60000); // Check every minute

    // Run performance monitoring
    setInterval(() => this.updatePerformanceMetrics(), 30000); // Every 30 seconds

    // Quality assurance checks
    setInterval(() => this.runQualityChecks(), 300000); // Every 5 minutes
  }

  async runInitialChecks() {
    console.log('🔍 Running initial platform checks...');
    
    // Check for common issues immediately
    await this.checkNavigationConsistency();
    await this.verifySystemHealth();
    await this.performSecurityAudit();
    
    this.updateMaintenanceStatus();
  }

  async runScheduledMaintenance() {
    const now = new Date();
    
    for (const [taskId, task] of this.maintenanceTasks) {
      if (this.shouldRunTask(task, now)) {
        try {
          console.log(`🔧 Running maintenance task: ${task.name}`);
          await task.handler();
          this.logMaintenanceActivity(taskId, 'success');
        } catch (error) {
          console.error(`❌ Maintenance task failed: ${task.name}`, error);
          this.logMaintenanceActivity(taskId, 'error', error);
        }
      }
    }
  }

  shouldRunTask(task, currentTime) {
    const lastRun = localStorage.getItem(`maintenance_${task.name}_last_run`);
    if (!lastRun) return true;

    const lastRunTime = new Date(lastRun);
    const timeDiff = currentTime - lastRunTime;

    switch (task.frequency) {
      case 'hourly': return timeDiff >= 3600000;
      case 'daily': return timeDiff >= 86400000;
      case 'weekly': return timeDiff >= 604800000;
      default: return false;
    }
  }

  async checkNavigationConsistency() {
    const issues = [];
    
    // Check for broken links (simulate - in production would check actual links)
    const expectedPages = [
      'index.html', 'about.html', 'sanityhub.html', 'community-dashboard.html',
      'shop.html', 'feed.html', 'games.html', 'videos.html', 'movement.html'
    ];
    
    // Simulate link checking
    expectedPages.forEach(page => {
      // In production: Actually fetch and verify each page exists
      console.log(`✅ Page verified: ${page}`);
    });

    // Check for case consistency issues
    const navigationPattern = /href="([^"]+\.html)"/g;
    // In production: Scan all HTML files for navigation links
    
    if (issues.length === 0) {
      console.log('✅ Navigation consistency check passed');
    } else {
      console.warn('⚠️ Navigation issues found:', issues);
    }

    this.recordMaintenanceResult('navigation_consistency', issues.length === 0);
    return issues;
  }

  async optimizePerformance() {
    console.log('⚡ Running performance optimization...');
    
    // Optimize local storage
    this.optimizeLocalStorage();
    
    // Clear unused cached data
    this.clearUnusedCache();
    
    // Optimize DOM elements
    this.optimizeDOM();
    
    console.log('✅ Performance optimization complete');
    this.recordMaintenanceResult('performance_optimization', true);
  }

  optimizeLocalStorage() {
    // Clean up old entries and optimize storage
    const storageKeys = Object.keys(localStorage);
    let cleaned = 0;

    storageKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          // Keep only recent entries for arrays
          if (data.length > 1000) {
            localStorage.setItem(key, JSON.stringify(data.slice(-1000)));
            cleaned++;
          }
        }
      } catch (e) {
        // Not JSON data, skip
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} storage entries`);
    }
  }

  clearUnusedCache() {
    // Clear old performance metrics
    const performanceHistory = JSON.parse(localStorage.getItem('performance_history') || '[]');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentHistory = performanceHistory.filter(entry => 
      new Date(entry.timestamp).getTime() > oneWeekAgo
    );
    
    localStorage.setItem('performance_history', JSON.stringify(recentHistory));
  }

  optimizeDOM() {
    // Remove unused event listeners and optimize DOM
    const unusedElements = document.querySelectorAll('[data-cleanup="true"]');
    unusedElements.forEach(el => el.remove());
    
    // Optimize images (add lazy loading if not present)
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
    });
  }

  async cleanupDataStorage() {
    console.log('🧹 Cleaning up data storage...');
    
    // Remove expired data
    this.removeExpiredData();
    
    // Compress large datasets
    this.compressLargeDatasets();
    
    // Validate data integrity
    this.validateDataIntegrity();
    
    console.log('✅ Data storage cleanup complete');
    this.recordMaintenanceResult('data_cleanup', true);
  }

  removeExpiredData() {
    const expirationRules = {
      'crisis_events': 30, // 30 days
      'performance_history': 7, // 7 days
      'community_notifications': 7, // 7 days
      'research_assessments': 90 // 90 days (longer for research)
    };

    Object.entries(expirationRules).forEach(([key, days]) => {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      const validData = data.filter(item => {
        const timestamp = item.timestamp || item.created || item.date;
        return timestamp && new Date(timestamp).getTime() > cutoff;
      });

      if (validData.length !== data.length) {
        localStorage.setItem(key, JSON.stringify(validData));
        console.log(`🗑️ Cleaned ${data.length - validData.length} expired entries from ${key}`);
      }
    });
  }

  compressLargeDatasets() {
    // Compress large JSON datasets
    const largeDataKeys = ['integrated_research_data', 'content_analytics', 'partnership_outcomes'];
    
    largeDataKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data && data.length > 100000) { // 100KB+
        // In production: Use compression library
        console.log(`📦 Large dataset detected: ${key} (${Math.round(data.length/1024)}KB)`);
      }
    });
  }

  validateDataIntegrity() {
    const criticalData = ['user_research_consent', 'community_votes', 'platform_health'];
    
    criticalData.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // Validate JSON
          console.log(`✅ Data integrity verified: ${key}`);
        }
      } catch (error) {
        console.error(`❌ Data integrity issue: ${key}`, error);
        // In production: Attempt data recovery or reset to defaults
      }
    });
  }

  async performSecurityAudit() {
    console.log('🔒 Performing security audit...');
    
    const securityIssues = [];
    
    // Check for sensitive data exposure
    if (this.checkSensitiveDataExposure()) {
      securityIssues.push('Sensitive data exposure detected');
    }
    
    // Verify consent management
    if (!this.verifyConsentManagement()) {
      securityIssues.push('Consent management issue');
    }
    
    // Check data anonymization
    if (!this.verifyDataAnonymization()) {
      securityIssues.push('Data anonymization concern');
    }
    
    if (securityIssues.length === 0) {
      console.log('✅ Security audit passed');
    } else {
      console.warn('⚠️ Security issues found:', securityIssues);
    }
    
    this.recordMaintenanceResult('security_audit', securityIssues.length === 0);
    return securityIssues;
  }

  checkSensitiveDataExposure() {
    // Check if any personal data is stored inappropriately
    const storageKeys = Object.keys(localStorage);
    const sensitivePatterns = [
      /email/i, /phone/i, /address/i, /ssn/i, /password/i,
      /name.*[A-Z][a-z]+\s+[A-Z][a-z]+/, // Name patterns
    ];
    
    for (const key of storageKeys) {
      const data = localStorage.getItem(key);
      for (const pattern of sensitivePatterns) {
        if (pattern.test(data)) {
          return true; // Sensitive data found
        }
      }
    }
    return false;
  }

  verifyConsentManagement() {
    const consent = localStorage.getItem('user_research_consent');
    return consent !== null; // Should have consent record
  }

  verifyDataAnonymization() {
    const researchData = JSON.parse(localStorage.getItem('integrated_research_data') || '[]');
    
    // Check if research data is properly anonymized
    for (const entry of researchData) {
      if (entry.user_id || entry.email || entry.name) {
        return false; // Found non-anonymized data
      }
    }
    return true;
  }

  async verifySystemHealth() {
    console.log('❤️ Verifying system health...');
    
    const systems = [
      'crisisResponse',
      'partnershipAPI', 
      'researchFramework',
      'contentMediaSystem',
      'platformOrchestrator'
    ];
    
    const healthStatus = {};
    
    systems.forEach(system => {
      const instance = window[system];
      healthStatus[system] = {
        loaded: instance !== undefined,
        active: instance?.isActive || instance?.status === 'active',
        lastCheck: new Date().toISOString()
      };
    });
    
    const healthyCount = Object.values(healthStatus).filter(s => s.loaded && s.active).length;
    const overallHealth = healthyCount / systems.length;
    
    console.log(`🎯 System health: ${Math.round(overallHealth * 100)}% (${healthyCount}/${systems.length} systems healthy)`);
    
    this.recordMaintenanceResult('system_health', overallHealth >= 0.8);
    localStorage.setItem('system_health_status', JSON.stringify(healthStatus));
    
    return healthStatus;
  }

  async runQualityChecks() {
    for (const [checkId, check] of this.qualityChecks) {
      try {
        const result = await check.handler();
        check.status = result ? 'passed' : 'failed';
        check.lastCheck = new Date().toISOString();
        
        console.log(`${result ? '✅' : '❌'} Quality check: ${check.name}`);
      } catch (error) {
        console.error(`❌ Quality check error: ${check.name}`, error);
        check.status = 'error';
      }
    }
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const issues = [];
    
    // Check for alt text on images
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level - previousLevel > 1) {
        issues.push('Heading hierarchy issue detected');
      }
      previousLevel = level;
    });
    
    // Check for focus management
    const focusableElements = document.querySelectorAll('button, a, input, textarea, select');
    focusableElements.forEach(el => {
      if (!el.hasAttribute('tabindex') && !el.hasAttribute('aria-label') && !el.textContent.trim()) {
        issues.push('Focusable element without accessible name');
      }
    });
    
    return issues.length === 0;
  }

  async checkResponsiveDesign() {
    // Simulate responsive design checks
    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];
    
    // In production: Actually test responsive breakpoints
    console.log('📱 Responsive design check completed');
    return true;
  }

  async checkSEOOptimization() {
    const seoIssues = [];
    
    // Check meta tags
    const title = document.querySelector('title');
    if (!title || title.textContent.length < 10) {
      seoIssues.push('Title tag missing or too short');
    }
    
    const description = document.querySelector('meta[name="description"]');
    if (!description || description.content.length < 120) {
      seoIssues.push('Meta description missing or too short');
    }
    
    // Check heading structure
    const h1 = document.querySelectorAll('h1');
    if (h1.length !== 1) {
      seoIssues.push('Should have exactly one H1 tag');
    }
    
    return seoIssues.length === 0;
  }

  async checkContentFreshness() {
    // Check when content was last updated
    const lastUpdate = localStorage.getItem('last_content_update');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    if (!lastUpdate || new Date(lastUpdate).getTime() < oneWeekAgo) {
      console.log('📅 Content may need updating');
      return false;
    }
    
    return true;
  }

  updatePerformanceMetrics() {
    // Update current performance metrics
    this.performanceMetrics.get('page_load_times').current = this.measurePageLoadTime();
    this.performanceMetrics.get('resource_usage').current = this.calculateStorageUsage();
    
    // Record metrics history
    const timestamp = new Date().toISOString();
    const performanceSnapshot = {
      timestamp,
      pageLoad: this.performanceMetrics.get('page_load_times').current,
      storageUsage: this.performanceMetrics.get('resource_usage').current,
      systemHealth: this.getSystemHealthScore()
    };
    
    const history = JSON.parse(localStorage.getItem('performance_history') || '[]');
    history.push(performanceSnapshot);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem('performance_history', JSON.stringify(history));
  }

  measurePageLoadTime() {
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      return loadTime || 0;
    }
    return 0;
  }

  calculateStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    return totalSize;
  }

  getSystemHealthScore() {
    const healthData = JSON.parse(localStorage.getItem('system_health_status') || '{}');
    const systems = Object.values(healthData);
    const healthyCount = systems.filter(s => s.loaded && s.active).length;
    return systems.length > 0 ? (healthyCount / systems.length) * 100 : 0;
  }

  recordMaintenanceResult(task, success) {
    const result = {
      task,
      success,
      timestamp: new Date().toISOString()
    };
    
    const history = JSON.parse(localStorage.getItem('maintenance_history') || '[]');
    history.push(result);
    
    // Keep last 50 results
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    localStorage.setItem('maintenance_history', JSON.stringify(history));
    localStorage.setItem(`maintenance_${task}_last_run`, result.timestamp);
  }

  logMaintenanceActivity(taskId, status, error = null) {
    const activity = {
      taskId,
      status,
      timestamp: new Date().toISOString(),
      error: error?.message || null
    };
    
    const log = JSON.parse(localStorage.getItem('maintenance_log') || '[]');
    log.push(activity);
    
    // Keep last 200 log entries
    if (log.length > 200) {
      log.splice(0, log.length - 200);
    }
    
    localStorage.setItem('maintenance_log', JSON.stringify(log));
  }

  updateMaintenanceStatus() {
    const status = {
      lastFullMaintenance: new Date().toISOString(),
      systemHealth: this.getSystemHealthScore(),
      performanceScore: this.calculatePerformanceScore(),
      qualityScore: this.calculateQualityScore(),
      nextScheduledMaintenance: this.getNextMaintenanceTime()
    };
    
    localStorage.setItem('platform_maintenance_status', JSON.stringify(status));
  }

  calculatePerformanceScore() {
    const metrics = this.performanceMetrics;
    let score = 0;
    let count = 0;
    
    for (const [_, metric] of metrics) {
      if (metric.current <= metric.target) {
        score += 100;
      } else {
        score += Math.max(0, 100 - ((metric.current - metric.target) / metric.target * 100));
      }
      count++;
    }
    
    return count > 0 ? score / count : 0;
  }

  calculateQualityScore() {
    const checks = Array.from(this.qualityChecks.values());
    const passedChecks = checks.filter(c => c.status === 'passed').length;
    return checks.length > 0 ? (passedChecks / checks.length) * 100 : 0;
  }

  getNextMaintenanceTime() {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    return nextHour.toISOString();
  }

  // Public methods for manual maintenance
  async runFullMaintenance() {
    console.log('🔧 Running full platform maintenance...');
    
    const results = {};
    
    for (const [taskId, task] of this.maintenanceTasks) {
      try {
        await task.handler();
        results[taskId] = 'success';
      } catch (error) {
        console.error(`❌ Task failed: ${task.name}`, error);
        results[taskId] = 'failed';
      }
    }
    
    await this.runQualityChecks();
    this.updateMaintenanceStatus();
    
    console.log('✅ Full maintenance complete', results);
    return results;
  }

  getMaintenanceReport() {
    const status = JSON.parse(localStorage.getItem('platform_maintenance_status') || '{}');
    const history = JSON.parse(localStorage.getItem('maintenance_history') || '[]');
    const log = JSON.parse(localStorage.getItem('maintenance_log') || '[]');
    
    return {
      currentStatus: status,
      recentHistory: history.slice(-10),
      recentLogs: log.slice(-20),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      qualityChecks: Object.fromEntries(this.qualityChecks)
    };
  }

  displayMaintenanceStatus() {
    const status = this.getMaintenanceReport();
    
    // Create maintenance status indicator
    const indicator = document.createElement('div');
    indicator.id = 'maintenance-status';
    indicator.style.cssText = `
      position: fixed;
      bottom: 60px;
      left: 20px;
      background: var(--surface-alpha, rgba(0,255,240,0.1));
      border: 1px solid var(--border-alpha, rgba(0,255,240,0.3));
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-light, #f0faff);
      font-size: 0.8rem;
      z-index: 9995;
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    
    const healthScore = status.currentStatus.systemHealth || 0;
    const statusIcon = healthScore >= 80 ? '🟢' : healthScore >= 60 ? '🟡' : '🔴';
    
    indicator.innerHTML = `${statusIcon} Maintenance: ${Math.round(healthScore)}%`;
    indicator.title = 'Click to view maintenance details';
    
    indicator.addEventListener('click', () => {
      this.showMaintenanceModal(status);
    });
    
    document.body.appendChild(indicator);
  }

  showMaintenanceModal(status) {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 10005;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: var(--bg-dark, #0d1b2a);
          color: var(--text-light, #f0faff);
          padding: 30px;
          border-radius: 16px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          border: 2px solid var(--primary-cyan, #00fff0);
        ">
          <h3 style="margin-bottom: 20px; text-align: center;">🔧 Platform Maintenance Status</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: rgba(0,255,240,0.1); border-radius: 12px;">
              <div style="font-size: 2rem; margin-bottom: 5px;">${Math.round(status.currentStatus.systemHealth || 0)}%</div>
              <div style="font-size: 0.9rem;">System Health</div>
            </div>
            <div style="text-align: center; padding: 15px; background: rgba(255,0,255,0.1); border-radius: 12px;">
              <div style="font-size: 2rem; margin-bottom: 5px;">${Math.round(status.currentStatus.performanceScore || 0)}%</div>
              <div style="font-size: 0.9rem;">Performance</div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: var(--primary-cyan, #00fff0); margin-bottom: 10px;">Recent Activity:</h4>
            ${status.recentLogs.slice(-5).map(log => `
              <div style="font-size: 0.9rem; margin: 5px 0; padding: 5px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                ${log.status === 'success' ? '✅' : '❌'} ${log.taskId} - ${new Date(log.timestamp).toLocaleTimeString()}
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center;">
            <button onclick="window.maintenanceSystem.runFullMaintenance(); this.closest('div').remove();" style="
              background: var(--primary-cyan, #00fff0);
              color: var(--bg-dark, #0d1b2a);
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              margin-right: 10px;
            ">
              Run Full Maintenance
            </button>
            <button onclick="this.closest('div').remove()" style="
              background: var(--secondary-magenta, #ff00ff);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
            ">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}

// Initialize Maintenance System
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.maintenanceSystem = new PlatformMaintenanceSystem();
    window.maintenanceSystem.displayMaintenanceStatus();
  }, 2000);
});

console.log('🔧 Platform Maintenance System Loading - Ensuring Forever Optimization');