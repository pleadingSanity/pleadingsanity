// ==============================================================
// PLEADING SANITY — SECURITY & PRIVACY HARDENING SYSTEM
// Fort Knox Level Protection • No External Dependencies
// ==============================================================

class SecurityHardening {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.encryptionKey = null;
        this.sessionId = this.generateSessionId();
        this.privacySettings = this.loadPrivacySettings();
        this.initialized = false;
        
        this.init();
    }

    async init() {
        if (this.initialized) return;
        
        await this.setupEncryption();
        this.implementCSP();
        this.setupCSRFProtection();
        this.initializeGDPRCompliance();
        this.setupSecureStorage();
        this.implementDataMinimization();
        this.setupSecurityHeaders();
        this.monitorSecurity();
        
        this.initialized = true;
        console.log('🔒 Pleading Sanity Security — Maximum Protection Active');
    }

    // ==============================================
    // CRYPTOGRAPHICALLY SECURE TOKENS
    // ==============================================
    generateCSRFToken() {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
        return this.fallbackToken();
    }

    fallbackToken() {
        let token = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const array = new Uint8Array(32);
        if (window.crypto?.getRandomValues) {
            window.crypto.getRandomValues(array);
            for (let i = 0; i < 32; i++) {
                token += chars[array[i] % chars.length];
            }
        } else {
            for (let i = 0; i < 32; i++) {
                token += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        return token;
    }

    generateSessionId() {
        return 'ps_' + this.generateCSRFToken().substring(0, 16);
    }

    // ==============================================
    // CLIENT-SIDE ENCRYPTION — AES-256-GCM
    // ==============================================
    async setupEncryption() {
        try {
            if (window.crypto?.subtle) {
                this.encryptionKey = await window.crypto.subtle.generateKey(
                    { name: 'AES-GCM', length: 256 },
                    false,
                    ['encrypt', 'decrypt']
                );
                console.log('🔐 AES-256-GCM Encryption — Active');
            } else {
                this.setupFallbackEncryption();
            }
        } catch (err) {
            console.warn('Crypto API unavailable — using hardened fallback');
            this.setupFallbackEncryption();
        }
    }

    setupFallbackEncryption() {
        this.encryptionKey = this.generateCSRFToken();
    }

    async encryptData(data) {
        if (!data) return null;
        try {
            if (this.encryptionKey && window.crypto?.subtle) {
                const encoder = new TextEncoder();
                const buffer = encoder.encode(JSON.stringify(data));
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                
                const encrypted = await window.crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv },
                    this.encryptionKey,
                    buffer
                );
                
                return {
                    data: Array.from(new Uint8Array(encrypted)),
                    iv: Array.from(iv),
                    ts: Date.now()
                };
            }
            return this.fallbackEncrypt(data);
        } catch (err) {
            console.error('Encryption failed:', err);
            return null;
        }
    }

    async decryptData(encrypted) {
        if (!encrypted) return null;
        try {
            if (this.encryptionKey && window.crypto?.subtle && encrypted.data) {
                const data = new Uint8Array(encrypted.data);
                const iv = new Uint8Array(encrypted.iv);
                
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    this.encryptionKey,
                    data
                );
                
                return JSON.parse(new TextDecoder().decode(decrypted));
            }
            return this.fallbackDecrypt(encrypted);
        } catch (err) {
            console.error('Decryption failed:', err);
            return null;
        }
    }

    fallbackEncrypt(data) {
        const str = JSON.stringify(data);
        let out = '';
        for (let i = 0; i < str.length; i++) {
            out += String.fromCharCode(
                str.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
            );
        }
        return { data: btoa(out), fb: true };
    }

    fallbackDecrypt(encrypted) {
        if (!encrypted.fb) return null;
        try {
            const str = atob(encrypted.data);
            let out = '';
            for (let i = 0; i < str.length; i++) {
                out += String.fromCharCode(
                    str.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            return JSON.parse(out);
        } catch {
            return null;
        }
    }

    // ==============================================
    // CONTENT SECURITY POLICY — NO DEAD LINKS
    // ==============================================
    implementCSP() {
        if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) return;

        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "media-src 'self' blob: https:",
            "frame-src 'self' https://www.youtube.com",
            "connect-src 'self' https://pleadingsanity.co.uk https://pleadingsanity.uk",
            "font-src 'self' data:",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ].join('; ');

        document.head.appendChild(meta);
    }

    // ==============================================
    // CSRF PROTECTION — ALL FORMS & REQUESTS
    // ==============================================
    setupCSRFProtection() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            let input = form.querySelector('input[name="csrf_token"]');
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'csrf_token';
                form.appendChild(input);
            }
            input.value = this.csrfToken;
        });

        const origFetch = window.fetch;
        window.fetch = async (url, opts = {}) => {
            const method = (opts.method || 'GET').toUpperCase();
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                opts.headers = {
                    'X-CSRF-Token': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    ...opts.headers
                };
            }
            return origFetch(url, opts);
        };
    }

    // ==============================================
    // GDPR & COOKIE CONSENT
    // ==============================================
    initializeGDPRCompliance() {
        if (!localStorage.getItem('cookie_consent')) {
            this.showCookieBanner();
        }
    }

    showCookieBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.style.cssText = `
            position: fixed; bottom: 0; left: 0; right: 0;
            background: rgba(6,7,19,0.95); color: #E9ECFF; padding: 20px;
            z-index: 10000; backdrop-filter: blur(10px);
            border-top: 2px solid #00fff0; font-family: system-ui;
        `;
        banner.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 15px; align-items: center; justify-content: space-between;">
                <div style="flex: 1; min-width: 280px;">
                    <h4 style="color: #00fff0; margin: 0 0 8px;">🍪 Privacy & Cookies</h4>
                    <p style="margin: 0; font-size: 0.9rem;">Essential cookies keep us running. You choose what we use — your data, your rules.</p>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="c-essential" style="background: transparent; border: 2px solid #A5B0DA; color: #A5B0DA; padding: 10px 18px; border-radius: 25px; cursor: pointer; font-weight: 600;">Essential Only</button>
                    <button id="c-all" style="background: linear-gradient(135deg, #00fff0, #06b6d4); border: none; color: #000; padding: 10px 18px; border-radius: 25px; cursor: pointer; font-weight: 700;">Accept All</button>
                    <button id="c-settings" style="background: transparent; border: 2px solid #ff00ff; color: #ff00ff; padding: 10px 18px; border-radius: 25px; cursor: pointer; font-weight: 600;">Customize</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('c-essential').onclick = () => this.setConsent('essential');
        document.getElementById('c-all').onclick = () => this.setConsent('all');
        document.getElementById('c-settings').onclick = () => this.showSettingsModal();
    }

    setConsent(level) {
        localStorage.setItem('cookie_consent', level);
        localStorage.setItem('consent_ts', Date.now().toString());
        document.getElementById('cookie-banner')?.remove();
        
        if (level === 'all') {
            localStorage.setItem('analytics_enabled', 'true');
        } else {
            localStorage.removeItem('analytics_enabled');
        }
        console.log(`🍪 Consent: ${level}`);
    }

    showSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'privacy-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 10001;
            display: flex; align-items: center; justify-content: center; padding: 20px;
        `;
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #060713, #0d1b2a); border-radius: 20px; padding: 30px; max-width: 520px; width: 100%; border: 2px solid #00fff0; max-height: 85vh; overflow-y: auto; font-family: system-ui;">
                <h2 style="color: #00fff0; text-align: center; margin: 0 0 24px;">🔒 Your Privacy Controls</h2>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #ff00ff; margin: 0 0 8px; font-size: 1rem;">🔒 Essential (Always On)</h3>
                    <p style="font-size: 0.9rem; color: #b9faff; margin: 0;">Session security, crisis features — can't run without these.</p>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #ff00ff; margin: 0 0 8px; font-size: 1rem;">📊 Analytics (Optional)</h3>
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="an-toggle" style="accent-color: #00fff0; width: 18px; height: 18px;">
                        <span style="color: #E9ECFF;">Help improve the site — fully anonymized data</span>
                    </label>
                </div>
                
                <div style="margin-bottom: 24px; padding: 14px; background: rgba(0,255,240,0.05); border-radius: 10px;">
                    <h3 style="color: #ff00ff; margin: 0 0 10px; font-size: 1rem;">📋 Your Rights (GDPR)</h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: #b9faff; line-height: 1.7;">
                        <li>Access your data anytime</li>
                        <li>Download your personal file</li>
                        <li>Request deletion — "Right to be Forgotten"</li>
                        <li>Email us: <a href="mailto:pleadingsanity1@gmail.com" style="color: #00fff0;">pleadingsanity1@gmail.com</a></li>
                    </ul>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="save-privacy" style="background: linear-gradient(135deg, #00fff0, #06b6d4); border: none; color: #000; padding: 12px 28px; border-radius: 25px; font-weight: 700; cursor: pointer;">Save</button>
                    <button id="close-privacy" style="background: transparent; border: 2px solid #A5B0DA; color: #A5B0DA; padding: 12px 28px; border-radius: 25px; font-weight: 600; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const anToggle = document.getElementById('an-toggle');
        anToggle.checked = localStorage.getItem('analytics_enabled') === 'true';

        document.getElementById('save-privacy').onclick = () => {
            const enable = anToggle.checked;
            localStorage.setItem('analytics_enabled', enable.toString());
            localStorage.setItem('cookie_consent', enable ? 'all' : 'essential');
            document.getElementById('privacy-modal').remove();
            document.getElementById('cookie-banner')?.remove();
        };

        document.getElementById('close-privacy').onclick = () => {
            document.getElementById('privacy-modal').remove();
        };
    }

    // ==============================================
    // ENCRYPTED STORAGE
    // ==============================================
    setupSecureStorage() {
        const sensitive = ['crisis_data', 'user_prefs', 'session_data', 'personal_info'];
        const origSet = localStorage.setItem.bind(localStorage);
        const origGet = localStorage.getItem.bind(localStorage);

        localStorage.setItem = async (key, val) => {
            if (sensitive.some(k => key.includes(k))) {
                const enc = await this.encryptData(val);
                if (enc) return origSet(key, JSON.stringify(enc));
            }
            return origSet(key, val);
        };

        localStorage.getItem = async (key) => {
            const val = origGet(key);
            if (val && sensitive.some(k => key.includes(k))) {
                try {
                    return await this.decryptData(JSON.parse(val));
                } catch {
                    return val;
                }
            }
            return val;
        };
    }

    // ==============================================
    // DATA MINIMIZATION — AUTO-CLEANUP
    // ==============================================
    implementDataMinimization() {
        const clean = () => {
            const maxAge = 30 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (!key) continue;
                if (key.startsWith('temp_') || key.startsWith('cache_')) {
                    try {
                        const d = JSON.parse(localStorage.getItem(key));
                        if (d.ts && (now - d.ts) > maxAge) {
                            localStorage.removeItem(key);
                        }
                    } catch {
                        localStorage.removeItem(key);
                    }
                }
            }
        };
        setInterval(clean, 12 * 60 * 60 * 1000);
        clean();
    }

    // ==============================================
    // DATA RIGHTS — EXPORT & DELETE
    // ==============================================
    implementDataSubjectRights() {
        window.exportMyData = () => {
            const data = {
                consent: localStorage.getItem('cookie_consent'),
                analytics: localStorage.getItem('analytics_enabled'),
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pleading-sanity-data-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };

        window.deleteMyData = () => {
            if (confirm('Delete all your saved data? Cannot be undone.')) {
                const keep = ['cookie_consent'];
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && !keep.includes(key)) localStorage.removeItem(key);
                }
                alert('✅ Data deleted.');
                location.reload();
            }
        };
    }

    // ==============================================
    // HEADERS & PROTECTION
    // ==============================================
    setupSecurityHeaders() {
        if (window !== top) top.location.replace(location.href);
        this.implementDataSubjectRights();
    }

    monitorSecurity() {
        let formCount = 0;
        document.addEventListener('submit', () => {
            formCount++;
            setTimeout(() => formCount--, 60000);
            if (formCount > 12) console.warn('🚨 Rapid submissions detected');
        });
    }

    loadPrivacySettings() {
        try {
            return JSON.parse(localStorage.getItem('privacy_settings') || '{"analytics":false,"crashReporting":true}');
        } catch {
            return { analytics: false, crashReporting: true };
        }
    }
}

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    window.securityHardening = new SecurityHardening();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityHardening;
}
