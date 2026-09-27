// Privacy-First Analytics & Monitoring System
class AnalyticsMonitoring {
    constructor() {
        this.isEnabled = localStorage.getItem('analytics_enabled') === 'true';
        this.sessionId = this.generateSessionId();
        this.pageViews = [];
        this.userInteractions = [];
        this.performanceMetrics = [];
        this.errorReports = [];
        
        this.init();
    }

    init() {
        if (!this.isEnabled) {
            console.log('📊 Analytics disabled by user preference');
            return;
        }
        
        this.setupPrivacyFirstAnalytics();
        this.monitorPerformance();
        this.trackUserWellbeing();
        this.setupHealthChecks();
        this.initializeErrorTracking();
        
        console.log('📊 Privacy-first analytics initialized');
    }

    generateSessionId() {
        return 'ps_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setupPrivacyFirstAnalytics() {
        // Track page views (no personal data)
        this.trackPageView();
        
        // Track mental health interactions (anonymized)
        this.trackWellnessMetrics();
        
        // Track platform usage patterns (aggregated)
        this.trackUsagePatterns();
        
        // Send analytics periodically (batched)
        setInterval(() => {
            this.sendAnalyticsBatch();
        }, 300000); // Every 5 minutes
        
        // Send before page unload
        window.addEventListener('beforeunload', () => {
            this.sendAnalyticsBatch(true);
        });
    }

    trackPageView() {
        const pageView = {
            id: this.generateEventId(),
            type: 'page_view',
            timestamp: Date.now(),
            page: window.location.pathname,
            referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
            sessionId: this.sessionId,
            // Privacy: No IP, no personal identifiers
            userAgent: this.anonymizeUserAgent(navigator.userAgent),
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: screen.colorDepth,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        };
        
        this.pageViews.push(pageView);
        
        // Track time on page
        this.startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            if (this.startTime) {
                const timeOnPage = Date.now() - this.startTime;
                this.trackInteraction('time_on_page', { duration: timeOnPage });
            }
        });
    }

    trackWellnessMetrics() {
        // Track crisis system usage (anonymized)
        document.addEventListener('crisis-activated', () => {
            this.trackInteraction('crisis_support_accessed', {
                timestamp: Date.now(),
                responseTime: performance.now()
            });
        });
        
        // Track positive interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn')) {
                const buttonText = e.target.textContent.toLowerCase();
                if (buttonText.includes('help') || buttonText.includes('support')) {
                    this.trackInteraction('help_seeking_behavior', {
                        element: 'support_button',
                        context: window.location.pathname
                    });
                }
            }
        });
        
        // Track newsletter signup (wellness engagement)
        document.addEventListener('submit', (e) => {
            if (e.target.querySelector('input[type="email"]')) {
                this.trackInteraction('newsletter_signup', {
                    source: window.location.pathname,
                    timestamp: Date.now()
                });
            }
        });
    }

    trackUsagePatterns() {
        // Track scroll depth (engagement metric)
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
        });
        
        window.addEventListener('beforeunload', () => {
            if (maxScroll > 0) {
                this.trackInteraction('scroll_depth', { maxPercent: maxScroll });
            }
        });
        
        // Track feature usage
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href]')) {
                const href = e.target.getAttribute('href');
                this.trackInteraction('navigation', {
                    from: window.location.pathname,
                    to: href,
                    linkText: e.target.textContent.trim().substring(0, 50)
                });
            }
        });
    }

    trackInteraction(type, data = {}) {
        if (!this.isEnabled) return;
        
        const interaction = {
            id: this.generateEventId(),
            type,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            page: window.location.pathname,
            ...data
        };
        
        this.userInteractions.push(interaction);
        
        // Limit stored interactions
        if (this.userInteractions.length > 100) {
            this.userInteractions.shift();
        }
    }

    monitorPerformance() {
        // Core Web Vitals monitoring
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.recordMetric('lcp', entry.startTime);
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.recordMetric('fid', entry.processingStart - entry.startTime);
                }
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.recordMetric('cls', clsValue);
            }).observe({ entryTypes: ['layout-shift'] });
        }
        
        // Monitor resource loading times
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.recordMetric('load_time', navigation.loadEventEnd - navigation.loadEventStart);
                    this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd);
                    this.recordMetric('first_byte', navigation.responseStart - navigation.requestStart);
                }
                
                // Resource timing
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources.filter(r => r.duration > 1000);
                if (slowResources.length > 0) {
                    this.recordMetric('slow_resources', slowResources.length);
                }
            }, 1000);
        });
    }

    recordMetric(name, value) {
        if (!this.isEnabled) return;
        
        this.performanceMetrics.push({
            id: this.generateEventId(),
            metric: name,
            value: Math.round(value),
            timestamp: Date.now(),
            page: window.location.pathname,
            sessionId: this.sessionId,
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        });
        
        // Limit stored metrics
        if (this.performanceMetrics.length > 50) {
            this.performanceMetrics.shift();
        }
    }

    setupHealthChecks() {
        // Monitor deployment health
        this.checkDeploymentHealth();
        
        // Monitor API availability
        this.monitorAPIHealth();
        
        // Check every 5 minutes
        setInterval(() => {
            this.checkDeploymentHealth();
            this.monitorAPIHealth();
        }, 300000);
    }

    async checkDeploymentHealth() {
        const sites = [
            { name: 'netlify', url: 'https://pleadingsanity.co.uk' },
            { name: 'vercel', url: 'https://pleadingsanity.uk' }
        ];
        
        for (const site of sites) {
            try {
                const startTime = performance.now();
                const response = await fetch(site.url + '/manifest.json', { 
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                const responseTime = performance.now() - startTime;
                
                this.recordMetric(`${site.name}_health`, response.ok ? 1 : 0);
                this.recordMetric(`${site.name}_response_time`, responseTime);
                
                if (!response.ok) {
                    this.trackInteraction('deployment_issue', {
                        site: site.name,
                        status: response.status,
                        url: site.url
                    });
                }
            } catch (error) {
                this.recordMetric(`${site.name}_health`, 0);
                this.trackInteraction('deployment_error', {
                    site: site.name,
                    error: error.message,
                    url: site.url
                });
            }
        }
    }

    async monitorAPIHealth() {
        // Check if APIs are responding
        const apis = [
            '/api/health',
            '/api/videos',
            '/netlify/functions/ytfeed'
        ];
        
        for (const api of apis) {
            try {
                const startTime = performance.now();
                const response = await fetch(api, { 
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                const responseTime = performance.now() - startTime;
                
                this.recordMetric('api_health', response.ok ? 1 : 0);
                this.recordMetric('api_response_time', responseTime);
            } catch (error) {
                this.recordMetric('api_health', 0);
            }
        }
    }

    initializeErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackError('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error ? e.error.stack : null
            });
        });
        
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('unhandled_rejection', {
                reason: e.reason.toString(),
                stack: e.reason.stack || null
            });
        });
        
        // Track fetch failures
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.trackError('fetch_error', {
                        url: args[0],
                        status: response.status,
                        statusText: response.statusText
                    });
                }
                return response;
            } catch (error) {
                this.trackError('network_error', {
                    url: args[0],
                    error: error.message
                });
                throw error;
            }
        };
    }

    trackError(type, details) {
        if (!this.isEnabled) return;
        
        const error = {
            id: this.generateEventId(),
            type,
            timestamp: Date.now(),
            page: window.location.pathname,
            sessionId: this.sessionId,
            userAgent: this.anonymizeUserAgent(navigator.userAgent),
            ...details
        };
        
        this.errorReports.push(error);
        
        // Limit stored errors
        if (this.errorReports.length > 20) {
            this.errorReports.shift();
        }
        
        // Send critical errors immediately
        if (type === 'javascript_error' || type === 'unhandled_rejection') {
            this.sendAnalyticsBatch(true);
        }
    }

    async sendAnalyticsBatch(immediate = false) {
        if (!this.isEnabled || 
            (this.pageViews.length === 0 && this.userInteractions.length === 0 && 
             this.performanceMetrics.length === 0 && this.errorReports.length === 0)) {
            return;
        }
        
        const batch = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            pageViews: [...this.pageViews],
            interactions: [...this.userInteractions],
            performance: [...this.performanceMetrics],
            errors: [...this.errorReports],
            privacy: {
                anonymized: true,
                consentLevel: localStorage.getItem('cookie_consent'),
                dataRetentionDays: 30
            }
        };
        
        try {
            if (immediate && navigator.sendBeacon) {
                // Use sendBeacon for immediate/unload scenarios
                navigator.sendBeacon('/api/analytics/batch', JSON.stringify(batch));
            } else {
                // Regular fetch for normal scenarios
                await fetch('/api/analytics/batch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Privacy-Mode': 'enabled'
                    },
                    body: JSON.stringify(batch)
                });
            }
            
            // Clear sent data
            this.pageViews = [];
            this.userInteractions = [];
            this.performanceMetrics = [];
            this.errorReports = [];
            
        } catch (error) {
            // Store failed batches for retry
            this.storeBatchForRetry(batch);
        }
    }

    storeBatchForRetry(batch) {
        try {
            const stored = JSON.parse(localStorage.getItem('analytics_retry') || '[]');
            stored.push(batch);
            
            // Keep only last 3 failed batches
            if (stored.length > 3) {
                stored.shift();
            }
            
            localStorage.setItem('analytics_retry', JSON.stringify(stored));
        } catch (error) {
            // If storage fails, just log it
            console.warn('Failed to store analytics batch for retry');
        }
    }

    // Utility functions
    generateEventId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    anonymizeUserAgent(ua) {
        // Remove potentially identifying information
        return ua.replace(/\(.*?\)/g, '(anonymized)');
    }

    // Public methods for manual tracking
    trackCustomEvent(eventName, properties = {}) {
        this.trackInteraction(eventName, properties);
    }

    trackGoal(goalName, value = 1) {
        this.trackInteraction('goal_conversion', {
            goal: goalName,
            value: value,
            timestamp: Date.now()
        });
    }

    // Admin functions
    exportAnalytics() {
        if (!this.isEnabled) return null;
        
        return {
            sessionId: this.sessionId,
            pageViews: this.pageViews,
            interactions: this.userInteractions,
            performance: this.performanceMetrics,
            errors: this.errorReports,
            exportTimestamp: Date.now()
        };
    }

    clearAnalytics() {
        this.pageViews = [];
        this.userInteractions = [];
        this.performanceMetrics = [];
        this.errorReports = [];
        localStorage.removeItem('analytics_retry');
        console.log('📊 Analytics data cleared');
    }
}

// Initialize analytics monitoring
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsMonitoring = new AnalyticsMonitoring();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsMonitoring;
}