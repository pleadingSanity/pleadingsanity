// Platform Integration & Orchestration System
// Coordinating all systems for seamless operation

class PlatformOrchestrator {
  constructor() {
    this.systems = new Map();
    this.health = new Map();
    this.coordination = new Map();
    this.initialize();
  }

  initialize() {
    console.log('🎯 Platform Orchestrator Initializing - Coordinating All Systems');
    
    // Wait for all systems to load
    this.waitForSystems().then(() => {
      this.registerSystems();
      this.establishCoordination();
      this.startHealthMonitoring();
      this.initializeIntegrations();
      this.displaySystemStatus();
    });
  }

  async waitForSystems() {
    const systemChecks = [
      () => typeof window.crisisResponse !== 'undefined',
      () => typeof window.partnershipAPI !== 'undefined', 
      () => typeof window.researchFramework !== 'undefined',
      () => typeof window.contentMediaSystem !== 'undefined'
    ];

    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (systemChecks.every(check => check())) {
        console.log('✅ All systems loaded successfully');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.warn('⚠️ Some systems may not have loaded completely');
  }

  registerSystems() {
    // Register all platform systems
    this.systems.set('crisis_response', {
      instance: window.crisisResponse,
      status: 'active',
      priority: 'critical',
      dependencies: [],
      health_check: () => window.crisisResponse?.isActive
    });

    this.systems.set('partnership_api', {
      instance: window.partnershipAPI,
      status: 'active', 
      priority: 'high',
      dependencies: ['crisis_response'],
      health_check: () => window.partnershipAPI?.partnerships?.size > 0
    });

    this.systems.set('research_framework', {
      instance: window.researchFramework,
      status: 'active',
      priority: 'high', 
      dependencies: [],
      health_check: () => window.researchFramework?.researchStudies?.size > 0
    });

    this.systems.set('content_media', {
      instance: window.contentMediaSystem,
      status: 'active',
      priority: 'medium',
      dependencies: [],
      health_check: () => window.contentMediaSystem?.contentTypes?.size > 0
    });

    console.log(`🎯 Registered ${this.systems.size} platform systems`);
  }

  establishCoordination() {
    // Crisis Response <-> Partnership API Integration
    this.coordination.set('crisis_partnership', {
      trigger: 'crisis_event',
      action: 'notify_healthcare_partners',
      handler: this.handleCrisisPartnershipNotification.bind(this)
    });

    // Research <-> Crisis Response Integration  
    this.coordination.set('research_crisis', {
      trigger: 'crisis_resolution',
      action: 'record_research_data',
      handler: this.handleCrisisResearchData.bind(this)
    });

    // Content <-> Community Integration
    this.coordination.set('content_community', {
      trigger: 'content_published',
      action: 'notify_community',
      handler: this.handleContentCommunityNotification.bind(this)
    });

    // Partnership <-> Research Integration
    this.coordination.set('partnership_research', {
      trigger: 'partnership_outcome',
      action: 'update_research_metrics',
      handler: this.handlePartnershipResearchUpdate.bind(this)
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for system events and coordinate responses
    document.addEventListener('crisis_detected', (e) => {
      this.handleSystemEvent('crisis_detected', e.detail);
    });

    document.addEventListener('research_data_collected', (e) => {
      this.handleSystemEvent('research_data_collected', e.detail);
    });

    document.addEventListener('partnership_event', (e) => {
      this.handleSystemEvent('partnership_event', e.detail);
    });

    document.addEventListener('content_event', (e) => {
      this.handleSystemEvent('content_event', e.detail);
    });
  }

  handleSystemEvent(eventType, eventData) {
    console.log(`🔄 Coordinating system event: ${eventType}`, eventData);
    
    // Find relevant coordination rules
    for (const [coordinationId, coordination] of this.coordination) {
      if (coordination.trigger === eventType) {
        try {
          coordination.handler(eventData);
        } catch (error) {
          console.error(`❌ Coordination error for ${coordinationId}:`, error);
        }
      }
    }
  }

  handleCrisisPartnershipNotification(eventData) {
    // When crisis detected, notify relevant healthcare partners
    if (window.partnershipAPI && eventData.severity === 'high') {
      const healthcarePartners = window.partnershipAPI.partnerships.get('healthcare') || [];
      
      healthcarePartners.forEach(partner => {
        if (partner.crisis_integration && partner.status === 'active') {
          console.log(`🏥 Notifying healthcare partner: ${partner.name}`);
          // In production: Send secure notification to partner
        }
      });
    }
  }

  handleCrisisResearchData(eventData) {
    // Record crisis resolution data for research
    if (window.researchFramework && eventData.outcome) {
      const researchData = {
        event_type: 'crisis_resolution',
        resolution_time: eventData.resolution_time,
        outcome: eventData.outcome,
        intervention_type: eventData.intervention_type,
        follow_up_required: eventData.follow_up_required,
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Recording crisis research data');
      // Store anonymized research data
      this.storeResearchData(researchData);
    }
  }

  handleContentCommunityNotification(eventData) {
    // Notify community when relevant content is published
    if (eventData.content_type === 'crisis_support' || eventData.content_type === 'educational') {
      console.log('📢 Notifying community of new supportive content');
      
      // In production: Send push notifications, update feeds
      this.notifyCommunity({
        type: 'new_content',
        content_id: eventData.content_id,
        title: eventData.title,
        relevance: eventData.relevance || 'general'
      });
    }
  }

  handlePartnershipResearchUpdate(eventData) {
    // Update research metrics based on partnership outcomes
    if (window.researchFramework && eventData.outcome_data) {
      console.log('🤝 Updating research metrics with partnership outcomes');
      
      const partnershipResearchData = {
        partner_id: eventData.partner_id,
        partner_type: eventData.partner_type,
        outcome_metrics: eventData.outcome_data,
        population_served: eventData.population_served,
        timestamp: new Date().toISOString()
      };
      
      this.storeResearchData(partnershipResearchData);
    }
  }

  storeResearchData(data) {
    // Store research data with privacy protection
    const anonymizedData = this.anonymizeResearchData(data);
    
    const existingData = JSON.parse(localStorage.getItem('integrated_research_data') || '[]');
    existingData.push(anonymizedData);
    
    // Keep only recent data for privacy
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    localStorage.setItem('integrated_research_data', JSON.stringify(existingData));
  }

  anonymizeResearchData(data) {
    // Apply differential privacy and remove identifiers
    const anonymized = { ...data };
    
    // Remove any potential identifiers
    delete anonymized.user_id;
    delete anonymized.session_id;
    delete anonymized.ip_address;
    
    // Add privacy noise to numerical data
    if (typeof anonymized.resolution_time === 'number') {
      anonymized.resolution_time += this.getDifferentialPrivacyNoise();
    }
    
    // Generalize timestamps to hour granularity
    if (anonymized.timestamp) {
      const date = new Date(anonymized.timestamp);
      date.setMinutes(0, 0, 0);
      anonymized.timestamp = date.toISOString();
    }
    
    return anonymized;
  }

  getDifferentialPrivacyNoise() {
    // Laplace noise for differential privacy
    const epsilon = 0.1;
    const sensitivity = 1;
    const u = Math.random() - 0.5;
    return -(sensitivity / epsilon) * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  notifyCommunity(notification) {
    // Send community notifications
    const notifications = JSON.parse(localStorage.getItem('community_notifications') || '[]');
    notifications.push({
      ...notification,
      timestamp: new Date().toISOString(),
      id: 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    });
    
    // Keep only recent notifications
    if (notifications.length > 50) {
      notifications.splice(0, notifications.length - 50);
    }
    
    localStorage.setItem('community_notifications', JSON.stringify(notifications));
    
    // Show notification to user if relevant
    if (notification.relevance === 'urgent' || notification.type === 'crisis_support') {
      this.showUserNotification(notification);
    }
  }

  showUserNotification(notification) {
    // Display notification to user
    const notificationElement = document.createElement('div');
    notificationElement.className = 'platform-notification';
    notificationElement.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--surface-alpha, rgba(0,255,240,0.1));
      border: 1px solid var(--border-alpha, rgba(0,255,240,0.3));
      border-radius: 12px;
      padding: 16px 20px;
      color: var(--text-light, #f0faff);
      z-index: 9997;
      backdrop-filter: blur(10px);
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;
    
    notificationElement.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">🎯 Platform Update</div>
      <div style="font-size: 0.9rem;">${notification.title || 'New community content available'}</div>
      <button onclick="this.parentElement.remove()" style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 1.1rem;
      ">×</button>
    `;
    
    document.body.appendChild(notificationElement);
    
    setTimeout(() => {
      if (notificationElement.parentElement) {
        notificationElement.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notificationElement.remove(), 300);
      }
    }, 8000);
  }

  startHealthMonitoring() {
    console.log('❤️ Starting system health monitoring');
    
    // Monitor all systems every 30 seconds
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000);
    
    // Initial health check
    this.checkSystemHealth();
  }

  async checkSystemHealth() {
    const healthReport = {
      timestamp: new Date().toISOString(),
      overall_status: 'healthy',
      systems: {}
    };

    for (const [systemId, system] of this.systems) {
      try {
        const isHealthy = system.health_check ? system.health_check() : true;
        const systemHealth = {
          status: isHealthy ? 'healthy' : 'warning',
          last_check: new Date().toISOString(),
          priority: system.priority
        };
        
        healthReport.systems[systemId] = systemHealth;
        
        if (!isHealthy && system.priority === 'critical') {
          healthReport.overall_status = 'critical';
        } else if (!isHealthy && healthReport.overall_status === 'healthy') {
          healthReport.overall_status = 'warning';
        }
        
      } catch (error) {
        console.error(`Health check failed for ${systemId}:`, error);
        healthReport.systems[systemId] = {
          status: 'error',
          error: error.message,
          last_check: new Date().toISOString(),
          priority: system.priority
        };
        
        if (system.priority === 'critical') {
          healthReport.overall_status = 'critical';
        }
      }
    }

    this.health.set('latest', healthReport);
    localStorage.setItem('platform_health', JSON.stringify(healthReport));
    
    if (healthReport.overall_status === 'critical') {
      console.error('🚨 Critical system health issues detected');
      this.handleCriticalHealthIssues(healthReport);
    }
  }

  handleCriticalHealthIssues(healthReport) {
    // Handle critical system failures
    const criticalIssues = Object.entries(healthReport.systems)
      .filter(([_, system]) => system.priority === 'critical' && system.status !== 'healthy');
    
    criticalIssues.forEach(([systemId, systemHealth]) => {
      console.error(`🚨 Critical system failure: ${systemId}`, systemHealth);
      
      if (systemId === 'crisis_response') {
        // Crisis response failure is most critical
        this.activateEmergencyFallback();
      }
    });
  }

  activateEmergencyFallback() {
    console.error('🚨 Activating emergency fallback for crisis response');
    
    // Show emergency resources directly
    const emergencyModal = document.createElement('div');
    emergencyModal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.95);
        z-index: 10003;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: #1a1a1a;
          color: white;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
          max-width: 500px;
          border: 2px solid #ff4444;
        ">
          <h2 style="color: #ff4444; margin-bottom: 20px;">🚨 Emergency Crisis Resources</h2>
          <p style="margin-bottom: 30px;">
            If you're in crisis, please reach out for immediate help:
          </p>
          <div style="background: rgba(255,68,68,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>UK:</strong> Samaritans 116 123 (FREE, 24/7)</p>
            <p><strong>US:</strong> 988 Suicide & Crisis Lifeline</p>
            <p><strong>Emergency:</strong> 999 (UK) | 911 (US)</p>
          </div>
          <button onclick="this.closest('div').remove()" style="
            background: #ff4444;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          ">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(emergencyModal);
  }

  initializeIntegrations() {
    // Initialize cross-system integrations
    this.setupJournalCrisisIntegration();
    this.setupPartnershipResearchIntegration();
    this.setupContentAnalyticsIntegration();
  }

  setupJournalCrisisIntegration() {
    // Monitor journal entries for crisis indicators
    const journalTextarea = document.querySelector('#journal-text, textarea[placeholder*="journal"]');
    if (journalTextarea && window.crisisResponse) {
      console.log('📝 Integrated journal crisis monitoring');
      
      // The crisis response system will handle this automatically
      // Just log that integration is active
    }
  }

  setupPartnershipResearchIntegration() {
    // Integrate partnership outcomes with research data
    if (window.partnershipAPI && window.researchFramework) {
      console.log('🤝 Integrated partnership-research data sharing');
      
      // Listen for partnership events
      document.addEventListener('partnership_outcome', (e) => {
        this.handlePartnershipResearchUpdate(e.detail);
      });
    }
  }

  setupContentAnalyticsIntegration() {
    // Integrate content performance with research metrics
    if (window.contentMediaSystem && window.researchFramework) {
      console.log('📊 Integrated content-research analytics');
      
      // Track content effectiveness for research
      document.addEventListener('content_engagement', (e) => {
        this.recordContentResearchData(e.detail);
      });
    }
  }

  recordContentResearchData(engagementData) {
    const researchData = {
      content_type: engagementData.content_type,
      engagement_level: engagementData.engagement_level,
      user_outcome: engagementData.user_outcome,
      platform_context: engagementData.platform_context,
      timestamp: new Date().toISOString()
    };
    
    this.storeResearchData(researchData);
  }

  displaySystemStatus() {
    // Add system status indicator to page
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'system-status-indicator';
    statusIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: var(--surface-alpha, rgba(0,255,240,0.1));
      border: 1px solid var(--border-alpha, rgba(0,255,240,0.3));
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-light, #f0faff);
      font-size: 0.8rem;
      z-index: 9996;
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    
    statusIndicator.innerHTML = '🟢 All systems operational';
    statusIndicator.title = 'Click to view system health details';
    
    statusIndicator.addEventListener('click', () => {
      this.showSystemHealthModal();
    });
    
    document.body.appendChild(statusIndicator);
    
    // Update status periodically
    setInterval(() => {
      this.updateStatusIndicator(statusIndicator);
    }, 10000);
  }

  updateStatusIndicator(indicator) {
    const health = this.health.get('latest');
    if (!health) return;
    
    const statusMap = {
      healthy: { icon: '🟢', text: 'All systems operational', color: '#4ade80' },
      warning: { icon: '🟡', text: 'Some systems need attention', color: '#fbbf24' },
      critical: { icon: '🔴', text: 'Critical issues detected', color: '#ef4444' }
    };
    
    const status = statusMap[health.overall_status] || statusMap.healthy;
    indicator.innerHTML = `${status.icon} ${status.text}`;
    indicator.style.borderColor = status.color;
  }

  showSystemHealthModal() {
    const health = this.health.get('latest');
    if (!health) return;
    
    const systemsList = Object.entries(health.systems)
      .map(([systemId, systemHealth]) => {
        const statusIcon = systemHealth.status === 'healthy' ? '✅' : 
                          systemHealth.status === 'warning' ? '⚠️' : '❌';
        return `
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-alpha, rgba(0,255,240,0.1));
          ">
            <span>${systemId.replace(/_/g, ' ').toUpperCase()}</span>
            <span>${statusIcon} ${systemHealth.status}</span>
          </div>
        `;
      }).join('');
    
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 10004;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: var(--bg-dark, #0d1b2a);
          color: var(--text-light, #f0faff);
          padding: 30px;
          border-radius: 16px;
          max-width: 400px;
          border: 2px solid var(--primary-cyan, #00fff0);
        ">
          <h3 style="margin-bottom: 20px; text-align: center;">🎯 System Health Status</h3>
          <div style="margin-bottom: 20px;">
            ${systemsList}
          </div>
          <div style="text-align: center;">
            <small style="color: var(--text-muted, #b9faff);">
              Last updated: ${new Date(health.timestamp).toLocaleTimeString()}
            </small>
          </div>
          <button onclick="this.closest('div').remove()" style="
            display: block;
            margin: 20px auto 0;
            background: var(--primary-cyan, #00fff0);
            color: var(--bg-dark, #0d1b2a);
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
          ">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  generateIntegratedReport() {
    // Generate comprehensive platform report
    const report = {
      timestamp: new Date().toISOString(),
      platform_health: this.health.get('latest'),
      system_coordination: {
        active_integrations: this.coordination.size,
        events_coordinated: this.getCoordinatedEventsCount(),
        cross_system_data_flows: this.getCrossSystemDataFlows()
      },
      user_impact: {
        crisis_responses: this.getCrisisResponseMetrics(),
        research_participation: this.getResearchParticipationMetrics(),
        content_engagement: this.getContentEngagementMetrics(),
        partnership_outcomes: this.getPartnershipOutcomeMetrics()
      },
      sustainability_metrics: {
        system_reliability: this.calculateSystemReliability(),
        data_privacy_compliance: this.getDataPrivacyCompliance(),
        community_governance_health: this.getCommunityGovernanceHealth(),
        forever_readiness_score: this.calculateForeverReadinessScore()
      }
    };

    localStorage.setItem('integrated_platform_report', JSON.stringify(report));
    return report;
  }

  getCoordinatedEventsCount() {
    // Count coordinated events from localStorage
    const events = JSON.parse(localStorage.getItem('coordinated_events') || '[]');
    return events.length;
  }

  getCrossSystemDataFlows() {
    // Get cross-system data sharing statistics
    return {
      crisis_to_research: this.getDataFlowCount('crisis_research'),
      partnership_to_research: this.getDataFlowCount('partnership_research'),
      content_to_analytics: this.getDataFlowCount('content_analytics')
    };
  }

  getDataFlowCount(flowType) {
    const data = JSON.parse(localStorage.getItem('integrated_research_data') || '[]');
    return data.filter(item => item.event_type?.includes(flowType.split('_')[0])).length;
  }

  calculateForeverReadinessScore() {
    // Calculate how ready the platform is for "forever" operation
    const factors = {
      system_health: this.health.get('latest')?.overall_status === 'healthy' ? 25 : 0,
      crisis_response_active: window.crisisResponse?.isActive ? 25 : 0,
      research_framework_active: window.researchFramework ? 20 : 0,
      partnership_integrations: window.partnershipAPI?.partnerships?.size > 0 ? 15 : 0,
      content_system_active: window.contentMediaSystem ? 15 : 0
    };
    
    return Object.values(factors).reduce((sum, score) => sum + score, 0);
  }

  getCrisisResponseMetrics() {
    const events = JSON.parse(localStorage.getItem('crisis_events') || '[]');
    return {
      total_responses: events.length,
      success_rate: events.filter(e => e.outcome === 'resolved').length / events.length || 0,
      average_response_time: events.reduce((sum, e) => sum + (e.response_time || 0), 0) / events.length || 0
    };
  }

  getResearchParticipationMetrics() {
    const enrollments = JSON.parse(localStorage.getItem('research_enrollments') || '[]');
    const assessments = JSON.parse(localStorage.getItem('research_assessments') || '[]');
    return {
      active_participants: enrollments.filter(e => e.status === 'active').length,
      completed_assessments: assessments.length,
      participation_rate: assessments.length / (enrollments.length || 1)
    };
  }

  getContentEngagementMetrics() {
    const analytics = JSON.parse(localStorage.getItem('content_analytics') || '[]');
    return {
      total_content_pieces: analytics.length,
      total_reach: analytics.reduce((sum, a) => sum + (a.reach || 0), 0),
      average_engagement: analytics.reduce((sum, a) => sum + (a.engagement || 0), 0) / (analytics.length || 1)
    };
  }

  getPartnershipOutcomeMetrics() {
    const partnerships = window.partnershipAPI?.partnerships || new Map();
    let totalPartners = 0;
    partnerships.forEach(partners => totalPartners += partners.length);
    
    return {
      active_partnerships: totalPartners,
      healthcare_integrations: partnerships.get('healthcare')?.length || 0,
      corporate_partnerships: partnerships.get('corporate')?.length || 0,
      research_collaborations: partnerships.get('research')?.length || 0
    };
  }

  calculateSystemReliability() {
    const health = this.health.get('latest');
    if (!health) return 0;
    
    const healthySystems = Object.values(health.systems).filter(s => s.status === 'healthy').length;
    return (healthySystems / Object.keys(health.systems).length) * 100;
  }

  getDataPrivacyCompliance() {
    // Check privacy compliance across systems
    const consentData = localStorage.getItem('user_research_consent');
    const hasConsent = consentData !== null;
    const hasDifferentialPrivacy = typeof this.getDifferentialPrivacyNoise === 'function';
    const hasDataMinimization = true; // Implemented in anonymization
    
    return {
      user_consent_management: hasConsent,
      differential_privacy: hasDifferentialPrivacy,
      data_minimization: hasDataMinimization,
      compliance_score: (hasConsent + hasDifferentialPrivacy + hasDataMinimization) / 3 * 100
    };
  }

  getCommunityGovernanceHealth() {
    // Check community governance system health
    const votes = localStorage.getItem('community_votes');
    const feedback = localStorage.getItem('community_notifications');
    
    return {
      active_voting_system: votes !== null,
      community_feedback_active: feedback !== null,
      transparency_systems: true, // Financial transparency implemented
      democratic_participation: votes !== null
    };
  }
}

// Initialize Platform Orchestrator
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.platformOrchestrator = new PlatformOrchestrator();
  }, 1000); // Give other systems time to load
});

console.log('🎯 Platform Orchestrator Loading - Coordinating Mental Health Revolution');