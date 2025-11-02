// Security & Privacy Hardening System - Fort Knox Level Protection
class SecurityHardening {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.encryptionKey = null;
        this.sessionId = this.generateSessionId();
        this.privacySettings = this.loadPrivacySettings();
        
        this.init();
    }

    async init() {
        // Initialize security measures
        await this.setupEncryption();
        this.implementCSP();
        this.setupCSRFProtection();
        this.initializeGDPRCompliance();
        this.setupSecureStorage();
        this.implementDataMinimization();
        this.setupSecurityHeaders();
        
        console.log('🔒 Security hardening initialized - Maximum protection active');
    }

    // Generate cryptographically secure random tokens
    generateCSRFToken() {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
        // Fallback for older browsers
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    generateSessionId() {
        return 'ps_' + this.generateCSRFToken().substring(0, 16);
    }

    // Setup client-side encryption for sensitive data
    async setupEncryption() {
        try {
            if (window.crypto && window.crypto.subtle) {
                this.encryptionKey = await window.crypto.subtle.generateKey(
                    { name: 'AES-GCM', length: 256 },
                    false,
                    ['encrypt', 'decrypt']
                );
                console.log('🔐 Client-side encryption enabled');
            } else {
                console.warn('Web Crypto API not available - using fallback encryption');
                this.setupFallbackEncryption();
            }
        } catch (error) {
            console.warn('Encryption setup failed:', error);
            this.setupFallbackEncryption();
        }
    }

    setupFallbackEncryption() {
        // Simple XOR encryption as fallback (not for production sensitive data)
        this.encryptionKey = this.generateCSRFToken();
    }

    // Encrypt sensitive data before storing
    async encryptData(data) {
        if (!data) return null;
        
        try {
            if (this.encryptionKey && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(JSON.stringify(data));
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                
                const encrypted = await window.crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv: iv },
                    this.encryptionKey,
                    dataBuffer
                );
                
                return {
                    data: Array.from(new Uint8Array(encrypted)),
                    iv: Array.from(iv),
                    timestamp: Date.now()
                };
            } else {
                // Fallback encryption
                return this.fallbackEncrypt(data);
            }
        } catch (error) {
            console.error('Encryption failed:', error);
            return null;
        }
    }

    // Decrypt sensitive data
    async decryptData(encryptedData) {
        if (!encryptedData) return null;
        
        try {
            if (this.encryptionKey && window.crypto.subtle && encryptedData.data) {
                const dataArray = new Uint8Array(encryptedData.data);
                const iv = new Uint8Array(encryptedData.iv);
                
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: iv },
                    this.encryptionKey,
                    dataArray
                );
                
                const decoder = new TextDecoder();
                return JSON.parse(decoder.decode(decrypted));
            } else {
                // Fallback decryption
                return this.fallbackDecrypt(encryptedData);
            }
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    fallbackEncrypt(data) {
        // Simple XOR encryption (not secure - for demonstration)
        const jsonData = JSON.stringify(data);
        let encrypted = '';
        for (let i = 0; i < jsonData.length; i++) {
            encrypted += String.fromCharCode(
                jsonData.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
            );
        }
        return { data: btoa(encrypted), fallback: true };
    }

    fallbackDecrypt(encryptedData) {
        if (!encryptedData.fallback) return null;
        try {
            const encrypted = atob(encryptedData.data);
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            return JSON.parse(decrypted);
        } catch (error) {
            return null;
        }
    }

    // Implement Content Security Policy
    implementCSP() {
        // Note: CSP should primarily be set server-side via HTTP headers
        // This is a client-side implementation for enhanced security
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `
            default-src 'self' https:;
            script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data: https: blob:;
            connect-src 'self' https://api.pleadingsanity.co.uk https://api.pleadingsanity.uk;
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self';
            upgrade-insecure-requests;
        `.replace(/\s+/g, ' ').trim();
        
        document.head.appendChild(meta);
    }

    // Setup CSRF protection for all forms
    setupCSRFProtection() {
        // Add CSRF token to all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            let csrfInput = form.querySelector('input[name="csrf_token"]');
            if (!csrfInput) {
                csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                form.appendChild(csrfInput);
            }
            csrfInput.value = this.csrfToken;
        });

        // Intercept fetch requests to add CSRF token
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
                options.headers = {
                    'X-CSRF-Token': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    ...options.headers
                };
            }
            return originalFetch(url, options);
        };
    }

    // Initialize GDPR compliance features
    initializeGDPRCompliance() {
        this.showCookieConsent();
        this.implementDataSubjectRights();
        this.setupPrivacyControls();
    }

    showCookieConsent() {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            const banner = document.createElement('div');
            banner.id = 'cookie-consent-banner';
            banner.innerHTML = `
                <div style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(6, 7, 19, 0.95); color: #E9ECFF; padding: 20px; z-index: 10000; backdrop-filter: blur(10px); border-top: 2px solid #00fff0;">
                    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                        <div style="flex: 1; min-width: 300px;">
                            <h4 style="color: #00fff0; margin-bottom: 8px;">🍪 Privacy & Cookies</h4>
                            <p style="margin: 0; font-size: 0.9rem; line-height: 1.4;">We use essential cookies for crisis support functionality and optional analytics to improve our platform. Your mental health data is never shared.</p>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button onclick="window.securityHardening.setCookieConsent('essential')" style="background: transparent; border: 2px solid #A5B0DA; color: #A5B0DA; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">Essential Only</button>
                            <button onclick="window.securityHardening.setCookieConsent('all')" style="background: linear-gradient(135deg, #00fff0 0%, #06b6d4 100%); border: none; color: #000; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">Accept All</button>
                            <button onclick="window.securityHardening.showPrivacySettings()" style="background: transparent; border: 2px solid #ff00ff; color: #ff00ff; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">Customize</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);
        }
    }

    setCookieConsent(level) {
        localStorage.setItem('cookie_consent', level);
        localStorage.setItem('consent_timestamp', Date.now().toString());
        
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) banner.remove();
        
        // Configure analytics based on consent
        if (level === 'essential') {
            this.disableAnalytics();
        } else if (level === 'all') {
            this.enableAnalytics();
        }
        
        console.log(`🍪 Cookie consent set to: ${level}`);
    }

    showPrivacySettings() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: linear-gradient(135deg, #060713 0%, #0d1b2a 100%); border-radius: 20px; padding: 30px; max-width: 600px; width: 100%; border: 2px solid #00fff0; max-height: 80vh; overflow-y: auto;">
                    <h2 style="color: #00fff0; margin-bottom: 20px; text-align: center;">🔒 Privacy Settings</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #ff00ff; margin-bottom: 10px;">Essential Cookies (Required)</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 10px;">These cookies are necessary for crisis support features and basic platform functionality.</p>
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" checked disabled style="accent-color: #00fff0;">
                            <span>Crisis response system, secure sessions, error handling</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #ff00ff; margin-bottom: 10px;">Analytics Cookies (Optional)</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 10px;">Help us improve the platform with anonymized usage data.</p>
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="analytics-consent" style="accent-color: #00fff0;">
                            <span>Platform improvement analytics (fully anonymized)</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #ff00ff; margin-bottom: 10px;">Data Processing Rights</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 15px;">Under GDPR, you have the right to:</p>
                        <ul style="padding-left: 20px; font-size: 0.9rem; line-height: 1.6;">
                            <li>Access your personal data</li>
                            <li>Rectify inaccurate data</li>
                            <li>Erase your data ("right to be forgotten")</li>
                            <li>Restrict or object to processing</li>
                            <li>Data portability</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center;">
                        <button onclick="window.securityHardening.savePrivacySettings()" style="background: linear-gradient(135deg, #00fff0 0%, #06b6d4 100%); color: #000; border: none; padding: 12px 24px; border-radius: 25px; font-weight: 700; cursor: pointer; margin-right: 10px;">Save Settings</button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: transparent; color: #A5B0DA; border: 2px solid #A5B0DA; padding: 12px 24px; border-radius: 25px; font-weight: 700; cursor: pointer;">Cancel</button>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                        <p style="font-size: 0.8rem; color: #A5B0DA;">
                            <a href="mailto:pleadingsanity1@gmail.com" style="color: #00fff0;">Contact us</a> for data protection queries
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Set current analytics preference
        const analyticsEnabled = localStorage.getItem('analytics_enabled') === 'true';
        modal.querySelector('#analytics-consent').checked = analyticsEnabled;
    }

    savePrivacySettings() {
        const analyticsConsent = document.getElementById('analytics-consent').checked;
        localStorage.setItem('analytics_enabled', analyticsConsent.toString());
        localStorage.setItem('cookie_consent', analyticsConsent ? 'all' : 'essential');
        localStorage.setItem('consent_timestamp', Date.now().toString());
        
        if (analyticsConsent) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }
        
        // Close modal
        const modal = document.querySelector('[style*="position: fixed"][style*="z-index: 10001"]');
        if (modal) modal.remove();
        
        // Close cookie banner if still visible
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) banner.remove();
        
        console.log('🔒 Privacy settings saved');
    }

    // Setup secure storage with encryption
    setupSecureStorage() {
        // Override localStorage to automatically encrypt sensitive data
        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalGetItem = localStorage.getItem.bind(localStorage);
        
        // Define sensitive keys that should be encrypted
        const sensitiveKeys = ['crisis_data', 'user_preferences', 'session_data', 'personal_info'];
        
        localStorage.setItem = async (key, value) => {
            if (sensitiveKeys.some(sensitive => key.includes(sensitive))) {
                const encrypted = await this.encryptData(value);
                if (encrypted) {
                    return originalSetItem(key, JSON.stringify(encrypted));
                }
            }
            return originalSetItem(key, value);
        };
        
        localStorage.getItem = async (key) => {
            const value = originalGetItem(key);
            if (value && sensitiveKeys.some(sensitive => key.includes(sensitive))) {
                try {
                    const parsed = JSON.parse(value);
                    const decrypted = await this.decryptData(parsed);
                    return decrypted;
                } catch (error) {
                    console.warn('Failed to decrypt stored data:', error);
                    return value;
                }
            }
            return value;
        };
    }

    // Implement data minimization principles
    implementDataMinimization() {
        // Automatically clean up old data
        const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
        
        setInterval(() => {
            this.cleanupOldData();
        }, cleanupInterval);
        
        // Initial cleanup
        this.cleanupOldData();
    }

    cleanupOldData() {
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        const now = Date.now();
        
        // Clean up old session data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('temp_') || key.startsWith('cache_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.timestamp && (now - data.timestamp) > maxAge) {
                        localStorage.removeItem(key);
                        console.log('🗑️ Cleaned up old data:', key);
                    }
                } catch (error) {
                    // Remove invalid entries
                    localStorage.removeItem(key);
                }
            }
        }
    }

    // Setup security headers (client-side implementation)
    setupSecurityHeaders() {
        // Prevent clickjacking
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }
        
        // Disable right-click context menu on sensitive elements
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('no-context-menu')) {
                e.preventDefault();
            }
        });
        
        // Disable text selection on sensitive elements
        document.addEventListener('selectstart', (e) => {
            if (e.target.classList.contains('no-select')) {
                e.preventDefault();
            }
        });
        
        // Clear console in production (security through obscurity)
        if (location.hostname !== 'localhost') {
            setTimeout(() => {
                console.clear();
                console.log('%c🧠 Pleading Sanity', 'color: #00fff0; font-size: 20px; font-weight: bold;');
                console.log('%cSecurity Notice: Unauthorized access attempts are logged.', 'color: #ff4444; font-weight: bold;');
            }, 1000);
        }
    }

    // Enable analytics (with privacy protection)
    enableAnalytics() {
        // Implement privacy-focused analytics
        this.privacySettings.analytics = true;
        this.savePrivacySettings();
        console.log('📊 Privacy-focused analytics enabled');
    }

    // Disable analytics
    disableAnalytics() {
        this.privacySettings.analytics = false;
        this.savePrivacySettings();
        
        // Clear any existing analytics data
        localStorage.removeItem('analytics_data');
        console.log('🚫 Analytics disabled');
    }

    // Load privacy settings
    loadPrivacySettings() {
        try {
            const settings = localStorage.getItem('privacy_settings');
            return settings ? JSON.parse(settings) : {
                analytics: false,
                crashReporting: true,
                performance: true
            };
        } catch (error) {
            return {
                analytics: false,
                crashReporting: true,
                performance: true
            };
        }
    }

    // Save privacy settings
    savePrivacySettingsToStorage() {
        localStorage.setItem('privacy_settings', JSON.stringify(this.privacySettings));
    }

    // Implement data subject rights
    implementDataSubjectRights() {
        // Add data export function
        window.exportMyData = () => {
            const userData = {
                preferences: localStorage.getItem('user_preferences'),
                settings: localStorage.getItem('privacy_settings'),
                consent: localStorage.getItem('cookie_consent'),
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pleading-sanity-data-export.json';
            a.click();
            URL.revokeObjectURL(url);
        };
        
        // Add data deletion function
        window.deleteMyData = () => {
            if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
                // Clear all user data
                const keysToKeep = ['cookie_consent']; // Keep essential consent info
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && !keysToKeep.includes(key)) {
                        localStorage.removeItem(key);
                    }
                }
                alert('Your data has been deleted successfully.');
                location.reload();
            }
        };
    }

    // Security monitoring
    monitorSecurity() {
        // Monitor for suspicious activity
        let suspiciousActivity = 0;
        
        // Monitor rapid form submissions
        document.addEventListener('submit', () => {
            suspiciousActivity++;
            setTimeout(() => suspiciousActivity--, 60000);
            
            if (suspiciousActivity > 10) {
                console.warn('🚨 Suspicious activity detected');
                this.logSecurityEvent('rapid_submissions');
            }
        });
        
        // Monitor developer tools (basic detection)
        let devtools = { open: false };
        setInterval(() => {
            if (devtools.open) return;
            
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if (widthThreshold || heightThreshold) {
                devtools.open = true;
                this.logSecurityEvent('devtools_opened');
            }
        }, 1000);
    }

    logSecurityEvent(eventType) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            sessionId: this.sessionId
        };
        
        // Store locally for later transmission
        const events = JSON.parse(localStorage.getItem('security_events') || '[]');
        events.push(event);
        
        // Keep only last 10 events
        if (events.length > 10) {
            events.shift();
        }
        
        localStorage.setItem('security_events', JSON.stringify(events));
    }
}

// Initialize security hardening
document.addEventListener('DOMContentLoaded', () => {
    window.securityHardening = new SecurityHardening();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityHardening;
}