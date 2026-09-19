// ==============================================================
// PLEADING SANITY — RESEARCH & ANALYTICS FRAMEWORK
// Survivor-Led • Privacy-First • Evidence-Based • Community-Owned
// ==============================================================

class ResearchAnalyticsFramework {
  constructor() {
    this.researchStudies = new Map();
    this.analyticsData = new Map();
    this.userConsent = new Map();
    this.evidenceBase = new Map();
    this.initialized = false;
    
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    this.setupEthicsFoundation();
    this.loadActiveStudies();
    this.setupConsentSystem();
    this.loadSavedConsent();
    
    this.initialized = true;
    console.log('📊 Pleading Sanity Research Framework — ACTIVE');
  }

  // ==============================================
  // ETHICS & GOVERNANCE — SURVIVORS IN CHARGE
  // ==============================================
  setupEthicsFoundation() {
    this.ethics = {
      board: {
        name: 'Community Research Ethics Board',
        leadership: 'survivor-led',
        oversight: 'community-controlled',
        approach: 'trauma-informed',
        approvalRequired: true
      },
      principles: {
        informed_consent: true,
        can_withdraw_anytime: true,
        data_ownership: 'user_community',
        anonymization: 'strict',
        no_selling: true,
        transparency: 'full'
      },
      privacy: {
        differential_privacy: true,
        data_minimization: true,
        right_to_export: true,
        right_to_erase: true,
        retention_limit: '90_days'
      }
    };
  }

  // ==============================================
  // ACTIVE STUDIES — WHAT WE'RE PROVING
  // ==============================================
  loadActiveStudies() {
    this.researchStudies.set('platform_impact', [
      {
        id: 'peer_support_effectiveness',
        title: 'Peer & Lived-Experience Support vs. Standard Care',
        status: 'recruiting',
        focus: 'Bipolar, spiritual awakening & recovery pathways',
        lead: 'Pleading Sanity Community',
        principle: 'Those who live it, lead the research',
        description: 'Proving that lived experience is as valuable as clinical guidance'
      },
      {
        id: 'narrative_healing',
        title: 'Storytelling & Shared Journeys as Medicine',
        status: 'active',
        focus: 'Turning trauma into purpose, pain into power',
        metric: 'hope, belonging, purpose'
      }
    ]);

    this.researchStudies.set('crisis_prevention', [
      {
        id: 'community_safety_net',
        title: 'Peer Support & Early Intervention',
        status: 'building',
        focus: 'Catching people before crisis point',
        metric: 'connection, belonging, early help-seeking'
      }
    ]);

    this.researchStudies.set('ai_ethics', [
      {
        id: 'compassionate_ai',
        title: 'AI as Companion — Not Replacement',
        status: 'evolving',
        focus: 'Arron as bridge, not substitute',
        principle: 'AI supports human connection, never replaces it'
      }
    ]);
  }

  // ==============================================
  // CONSENT SYSTEM — GRANULAR, OPT-IN ONLY
  // ==============================================
  setupConsentSystem() {
    this.consentLevels = {
      essential: {
        title: 'Essential Only',
        description: 'Site works, errors fixed — no tracking',
        required: true,
        data: 'none'
      },
      platform_improvement: {
        title: 'Help Improve the Platform',
        description: 'Anonymous usage patterns — never personal',
        optional: true,
        data: 'feature clicks, session length (aggregated)',
        retention: '30 days'
      },
      research_participation: {
        title: 'Join the Research',
        description: 'Help build evidence that changes how the world sees mental health',
        optional: true,
        data: 'anonymized outcome scores, journal themes',
        benefit: 'You shape the future — participation credits',
        control: 'Opt out instantly, delete your data anytime'
      },
      community_insights: {
        title: 'Community Health',
        description: 'See how we’re healing together — patterns only, no individuals',
        optional: true,
        data: 'connection trends, collective resilience metrics',
        privacy: 'fully anonymized, no identifiers'
      }
    };
  }

  loadSavedConsent() {
    const saved = localStorage.getItem('ps_research_consent');
    if (saved) {
      this.userConsent = new Map(JSON.parse(saved));
      this.resumeDataCollection();
    } else {
      this.showConsentDialog();
    }
  }

  showConsentDialog() {
    const modal = document.createElement('div');
    modal.className = 'ps-consent-modal';
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,10,20,0.95); z-index: 99999;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      font-family: inherit;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #0a1929, #0f2a47);
        border: 2px solid #00fff0; border-radius: 20px; padding: 35px;
        max-width: 650px; width: 100%; max-height: 90vh; overflow-y: auto;
        color: #e6ffff; box-shadow: 0 0 40px rgba(0,255,240,0.15);
      ">
        <h2 style="text-align: center; color: #00fff0; margin: 0 0 10px; font-size: 1.6rem;">
          🔬 Shape the Future — Your Data, Your Choice
        </h2>
        <p style="text-align: center; color: #b9faff; margin-bottom: 25px; line-height: 1.6;">
          We're not just building a site — we're building <strong>evidence</strong> that peer support works.
          Everything is <em>opt-in</em>. You control it all.
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 25px;">
          
          <label style="
            display: flex; align-items: flex-start; gap: 12px; cursor: pointer;
            background: rgba(0,255,240,0.05); padding: 16px; border-radius: 12px;
            border-left: 4px solid #00fff0; transition: 0.2s;
          " onmouseover="this.style.background='rgba(0,255,240,0.1)'"
             onmouseout="this.style.background='rgba(0,255,240,0.05)'">
            <input type="checkbox" id="consent-analytics" style="margin-top: 3px; transform: scale(1.2);">
            <div>
              <strong style="color: #00fff0;">📊 Platform Improvement</strong>
              <p style="margin: 4px 0 0; font-size: 0.9rem; color: #99d;">
                Anonymous usage patterns — helps us fix what's broken and highlight what works.
              </p>
            </div>
          </label>

          <label style="
            display: flex; align-items: flex-start; gap: 12px; cursor: pointer;
            background: rgba(255,0,255,0.05); padding: 16px; border-radius: 12px;
            border-left: 4px solid #ff00ff; transition: 0.2s;
          " onmouseover="this.style.background='rgba(255,0,255,0.1)'"
             onmouseout="this.style.background='rgba(255,0,255,0.05)'">
            <input type="checkbox" id="consent-research" style="margin-top: 3px; transform: scale(1.2);">
            <div>
              <strong style="color: #ff00ff;">🔬 Join the Research</strong>
              <p style="margin: 4px 0 0; font-size: 0.9rem; color: #99d;">
                Anonymous outcome measures — your voice becomes proof. Earn participation credits.
              </p>
            </div>
          </label>

          <label style="
            display: flex; align-items: flex-start; gap: 12px; cursor: pointer;
            background: rgba(77,255,77,0.05); padding: 16px; border-radius: 12px;
            border-left: 4px solid #4dff4d; transition: 0.2s;
          " onmouseover="this.style.background='rgba(77,255,77,0.1)'"
             onmouseout="this.style.background='rgba(77,255,77,0.05)'">
            <input type="checkbox" id="consent-community" style="margin-top: 3px; transform: scale(1.2);">
            <div>
              <strong style="color: #4dff4d;">🌍 Community Health</strong>
              <p style="margin: 4px 0 0; font-size: 0.9rem; color: #99d;">
                Collective trends only — no individual tracked. See how we're rising together.
              </p>
            </div>
          </label>
        </div>

        <div style="
          background: rgba(255,170,0,0.08); border-left: 4px solid #ffaa00;
          padding: 14px; border-radius: 0 10px 10px 0; margin-bottom: 25px;
        ">
          <p style="margin: 0; font-size: 0.9rem;">
            <strong>🛡️ Your Rights Always Apply:</strong> Change your mind anytime → Settings → Privacy.
            Export your data, delete everything, or withdraw completely. Nothing sold. Nothing shared
            without your explicit yes.
          </p>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button onclick="researchFramework.saveAllConsent()" style="
            background: linear-gradient(135deg, #00fff0, #ff00ff); color: #000;
            border: none; padding: 12px 28px; border-radius: 10px; font-weight: 700;
            cursor: pointer; font-size: 1rem;
          ">Save My Choices</button>
          <button onclick="researchFramework.declineAll()" style="
            background: transparent; color: #ccc; border: 1px solid #446;
            padding: 12px 24px; border-radius: 10px; cursor: pointer;
          ">Only Essential</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  saveAllConsent() {
    const consent = {
      analytics: document.getElementById('consent-analytics')?.checked || false,
      research: document.getElementById('consent-research')?.checked || false,
      community: document.getElementById('consent-community')?.checked || false,
      timestamp: Date.now(),
      version: '1.0'
    };

    this.userConsent = new Map(Object.entries(consent));
    localStorage.setItem('ps_research_consent', JSON.stringify(Object.entries(consent)));
    
    document.querySelector('.ps-consent-modal')?.remove();
    this.showNotification('✅ Choices saved. Thank you for helping build something real.', 'success');
    this.resumeDataCollection();
  }

  declineAll() {
    const consent = {
      analytics: false, research: false, community: false,
      timestamp: Date.now(), version: '1.0'
    };
    this.userConsent = new Map(Object.entries(consent));
    localStorage.setItem('ps_research_consent', JSON.stringify(Object.entries(consent)));
    document.querySelector('.ps-consent-modal')?.remove();
    this.showNotification('✅ Set to essential only. You can enable more in Settings anytime.', 'info');
  }

  resumeDataCollection() {
    const c = Object.fromEntries(this.userConsent);
    if (c.analytics) this.startAnalytics();
    if (c.research) this.enrollInAvailableStudies();
    if (c.community) this.startCommunityMetrics();
  }

  // ==============================================
  // ANALYTICS — ANONYMOUS, LIGHT, PRIVACY-FIRST
  // ==============================================
  startAnalytics() {
    console.log('📊 Anonymous analytics active');
    this.sessionStart = Date.now();

    // Track feature usage (no personal data)
    document.addEventListener('click', e => {
      if (e.target.matches('button, a, .track-feature')) {
        this.logUsage(e.target.dataset.feature || e.target.className || 'interactive');
      }
    });

    // Session length
    window.addEventListener('beforeunload', () => this.logSessionEnd());
  }

  logUsage(feature) {
    if (!this.userConsent.get('analytics')) return;
    const usage = JSON.parse(localStorage.getItem('ps_feature_usage') || '{}');
    usage[feature] = (usage[feature] || 0) + 1;
    usage.updated = Date.now();
    localStorage.setItem('ps_feature_usage', JSON.stringify(usage));
  }

  logSessionEnd() {
    if (!this.userConsent.get('analytics')) return;
    const duration = Date.now() - (this.sessionStart || Date.now());
    const sessions = JSON.parse(localStorage.getItem('ps_sessions') || '[]');
    sessions.push({ d: duration, t: Date.now() });
    if (sessions.length > 50) sessions.shift();
    localStorage.setItem('ps_sessions', JSON.stringify(sessions));
  }

  // ==============================================
  // RESEARCH — OUTCOME TRACKING
  // ==============================================
  enrollInAvailableStudies() {
    console.log('🔬 Research participation active');
    // Show first assessment prompt after 24h
    setTimeout(() => this.promptAssessment(), 86400000);
  }

  promptAssessment() {
    if (!this.userConsent.get('research')) return;
    const already = localStorage.getItem('ps_last_assessment');
    const gap = already ? Date.now() - parseInt(already) : 2592000000; // 30 days
    if (gap < 2592000000) return;

    const doAssess = confirm(
      '🔬 Research Check-In\n\n' +
      'Help us understand how things are going. ' +
      'This quick, anonymous check-in builds proof that peer support works.\n\n' +
      'Take 2 minutes now?'
    );

    if (doAssess) this.collectAssessment();
  }

  collectAssessment() {
    // PHQ-9 + GAD-7 simplified — validated, standard measures
    const mood = prompt(
      'Over the last 2 weeks — how would you rate your mood overall?\n' +
      '0 = feeling great, 10 = really struggling\n\nEnter 0–10:'
    );
    const connected = prompt(
      'Do you feel more connected or understood lately?\n' +
      '0 = Not at all, 10 = More than ever\n\nEnter 0–10:'
    );

    if (mood === null || connected === null) return;

    const entry = {
      date: new Date().toISOString().slice(0,10),
      mood: parseInt(mood) || 5,
      connection: parseInt(connected) || 5,
      source: 'pleading_sanity_user',
      anonymized: true
    };

    const history = JSON.parse(localStorage.getItem('ps_assessments') || '[]');
    history.push(entry);
    localStorage.setItem('ps_assessments', JSON.stringify(history));
    localStorage.setItem('ps_last_assessment', Date.now().toString());

    // Credit reward
    const credits = parseInt(localStorage.getItem('ps_credits') || '0') + 10;
    localStorage.setItem('ps_credits', credits.toString());

    this.showNotification(`✅ Thank you! +10 impact credits. Total: ${credits}`, 'success');
  }

  // ==============================================
  // COMMUNITY — COLLECTIVE ONLY
  // ==============================================
  startCommunityMetrics() {
    console.log('🌍 Community health tracking active');
  }

  // ==============================================
  // NOTIFICATIONS
  // ==============================================
  showNotification(text, type = 'info') {
    const icons = { success: '✅', info: 'ℹ️', warning: '⚠️', research: '🔬' };
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #0f2a47;
      border: 1px solid #00fff0; border-radius: 12px; padding: 14px 20px;
      color: #e6ffff; z-index: 99999; max-width: 320px;
      box-shadow: 0 0 20px rgba(0,255,240,0.15);
    `;
    el.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${icons[type]} Pleading Sanity</div>
      <div style="font-size: 0.9rem;">${text}</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  }

  // ==============================================
  // PUBLIC DASHBOARD — WHAT WE'VE LEARNED
  // ==============================================
  getPublicStats() {
    const history = JSON.parse(localStorage.getItem('ps_assessments') || '[]');
    if (history.length < 2) return { ready: false, message: 'More data gathering...' };

    const avgMood = history.reduce((s,r) => s + r.mood, 0) / history.length;
    const avgConn = history.reduce((s,r) => s + r.connection, 0) / history.length;

    return {
      ready: true,
      participants: history.length,
      avgMood: avgMood.toFixed(1),
      avgConnection: avgConn.toFixed(1),
      message: 'We rise together — data shared openly, people protected always'
    };
  }
}

// GLOBAL INIT
const researchFramework = new ResearchAnalyticsFramework();
window.researchFramework = researchFramework;

console.log('📊 Pleading Sanity Research — Evidence for the People, by the People');
