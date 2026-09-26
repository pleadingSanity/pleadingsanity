// ==============================================================
// PLEADING SANITY — CONTENT & MEDIA EMPIRE SYSTEM v1.1-FINAL
// Rise From Madness Global Network • Creator-Led • Survivor-Run
// Evolution Not Erasure • One Source • One Consciousness • One Family
// Built for Shane Cooper — Pleading Sanity Universal Alliance
// ==============================================================

class ContentMediaSystem {
  constructor() {
    this.VERSION = '1.1.0-FINAL';
    this.contentTypes = new Map();
    this.creators = new Map();
    this.distributionChannels = new Map();
    this.monetization = new Map();
    this.communityContent = new Map();
    this.podcastNetwork = new Map();
    this.educationalContent = new Map();
    this.submissions = new Map();
    this.syncInterval = null;
    
    // ─── PERSISTENCE — Encapsulated Storage ───
    this.STORAGE_KEYS = {
      content: 'ps_content_v1',
      creators: 'ps_creators_v1',
      analytics: 'ps_analytics_v1',
      reports: 'ps_reports_v1',
      lastSync: 'ps_last_sync_v1'
    };
    
    this.db = this.loadDB();
    this.init();
  }

  // ==============================================
  // CORE INIT
  // ==============================================
  init() {
    console.log(`🎙️ Pleading Sanity Media System v${this.VERSION} — ONLINE`);
    
    this.setupContentInfrastructure();
    this.initPodcastNetwork();
    this.initEducationalPlatform();
    this.initCreatorProgram();
    this.initDistributionNetwork();
    this.initGovernance();
    this.initAnalytics();
    this.startAutoSync();
    this.registerGlobalAPI();
  }

  // ==============================================
  // STORAGE LAYER — Encapsulated + Migratable ✅
  // ==============================================
  loadDB() {
    return {
      content: this.safeParse(this.STORAGE_KEYS.content, []),
      creators: this.safeParse(this.STORAGE_KEYS.creators, []),
      analytics: this.safeParse(this.STORAGE_KEYS.analytics, []),
      reports: this.safeParse(this.STORAGE_KEYS.reports, [])
    };
  }

  safeParse(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (err) {
      console.warn(`⚠️ Storage parse failed: ${key} — resetting`, err);
      return fallback;
    }
  }

  saveDB() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.content, JSON.stringify(this.db.content));
      localStorage.setItem(this.STORAGE_KEYS.creators, JSON.stringify(this.db.creators));
      localStorage.setItem(this.STORAGE_KEYS.analytics, JSON.stringify(this.db.analytics));
      localStorage.setItem(this.STORAGE_KEYS.reports, JSON.stringify(this.db.reports));
      return true;
    } catch (err) {
      console.error('❌ Storage save failed:', err);
      return false;
    }
  }

  // ==============================================
  // 1. CONTENT INFRASTRUCTURE — ALL FORMATS
  // ==============================================
  setupContentInfrastructure() {
    this.contentTypes.set('podcasts', {
      flagship: 'Rise From Madness',
      format: 'interview_narrative_solo',
      frequency: 'weekly',
      pillars: ['survivor_stories', 'evidence_based', 'practical_tools', 'community_spotlight', 'expert_insights'],
      distribution: ['Spotify', 'Apple', 'Google', 'YouTube', 'Amazon'],
      monetization: 'diversified',
      community_input: true,
      accessibility: ['transcripts', 'captions', 'alt_text']
    });

    this.contentTypes.set('educational', {
      courses: ['Literacy 101', 'Peer Support', 'Crisis Response', 'Family Advocate'],
      certifications: true,
      pricing: 'free & sliding scale',
      accessibility: 'universal design',
      offline_available: true,
      progress_tracking: true
    });

    this.contentTypes.set('community', {
      survivor_stories: true,
      peer_support: true,
      creative_arts: true,
      advocacy: true,
      research_share: true,
      submissions_open: true,
      anonymity_options: ['pseudonym', 'anonymous', 'attributed']
    });

    this.contentTypes.set('multimedia', {
      video: ['YouTube', 'TikTok', 'Instagram Reels'],
      audio: ['Podcast feeds', 'guided meditations', 'Hz healing'],
      written: ['Blogs', 'Journals', 'Manifestos'],
      interactive: ['Games', 'Quizzes', 'Trackers'],
      live: ['Weekly spaces', 'Monthly summits']
    });
  }

  // ==============================================
  // 2. PODCAST NETWORK — FLAGSHIP + 5 SHOWS
  // ==============================================
  initPodcastNetwork() {
    this.podcastNetwork.set('flagship', {
      name: '🎙️ Rise From Madness',
      tagline: 'Real talk. Real recovery. Building lives worth living.',
      hosts: ['Shane Cooper', 'Rotating Community Co-Hosts'],
      schedule: 'Every Wednesday 12:00 PM GMT',
      duration: '45–60 min',
      features: ['Listener questions', 'Guest nominations', 'Topic voting', 'Call-ins'],
      rss_ready: true,
      transcript_available: true
    });

    const networkShows = [
      { id: 'peer_support', name: '🤝 Peer Support Conversations', focus: 'Lived-experience guidance', freq: 'Bi-weekly' },
      { id: 'crisis_stories', name: '🛡️ Crisis Response Stories', focus: 'Surviving & helping others', freq: 'Monthly' },
      { id: 'research_roundup', name: '📊 Research Roundtable', focus: 'Science meets real life', freq: 'Monthly' },
      { id: 'global_voices', name: '🌍 Global Voices', focus: 'Healing across borders', freq: 'Bi-weekly' },
      { id: 'creative_recovery', name: '🎨 Creative Recovery', focus: 'Art, music, writing as medicine', freq: 'Weekly' }
    ];

    networkShows.forEach(show => this.podcastNetwork.set(show.id, show));

    this.podcastNetwork.set('production', {
      studio: 'Remote + mobile field recording',
      editing: 'Community-trained team',
      templates: 'Standardized branding',
      transcription: 'Auto + human review',
      audiograms: 'Auto-generated for social',
      quality_standards: 'Accessibility-first — captions within 48hrs'
    });
  }

  // ==============================================
  // 3. EDUCATION PLATFORM — 4 PATHWAYS
  // ==============================================
  initEducationalPlatform() {
    const courses = [
      {
        id: 'literacy_101',
        title: 'Mental Health Literacy for Everyone',
        desc: 'Understand, reduce stigma, support with confidence',
        duration: '6 weeks self-paced',
        cert: 'Mental Health Advocate',
        price: 'FREE',
        audience: 'All',
        progress_saved: true
      },
      {
        id: 'peer_support',
        title: 'Certified Peer Support Specialist',
        desc: 'Turn lived experience into professional skill',
        duration: '12 weeks cohort',
        cert: 'International Peer Support',
        price: 'Sliding scale + scholarships',
        audience: 'Survivors seeking purpose'
      },
      {
        id: 'crisis_response',
        title: 'Crisis Intervention & De-escalation',
        desc: 'Be the calm when it matters most',
        duration: '8 weeks blended',
        cert: 'Crisis Responder',
        price: 'Community funded',
        audience: 'Volunteers & professionals'
      },
      {
        id: 'family_support',
        title: 'Supporting Loved Ones',
        desc: 'Care for them AND you',
        duration: '4 weeks',
        cert: 'Family Advocate',
        price: 'ALWAYS FREE',
        audience: 'Family & friends'
      }
    ];

    const pathways = [
      { id: 'personal', name: '🌱 Personal Recovery', leads: ['literacy_101'] },
      { id: 'career', name: '💼 Peer Professional', leads: ['literacy_101', 'peer_support', 'crisis_response'] },
      { id: 'family', name: '❤️ Family & Friends', leads: ['family_support'] },
      { id: 'pro', name: '🏥 Professional Dev', leads: ['literacy_101', 'crisis_response'] }
    ];

    this.educationalContent.set('courses', courses);
    this.educationalContent.set('pathways', pathways);
    this.educationalContent.set('instructors', {
      lead: 'Subject matter experts',
      peer: 'Lived-experience teachers',
      guest: 'Trusted voices',
      model: 'Fair pay — no exploitation'
    });
  }

  // ==============================================
  // 4. CREATOR ECONOMY — FAIR SPLIT, PROTECTED
  // ==============================================
  initCreatorProgram() {
    this.creators.set('program', {
      tiers: [
        { name: 'Storyteller', role: 'Share your journey', support: 'Story coaching', earn: 'Licensing + gifts' },
        { name: 'Educator', role: 'Create courses', support: 'Curriculum team', earn: 'Revenue share 70/30' },
        { name: 'Artist', role: 'Music/art/design', support: 'Shop + promotion', earn: 'Sales + commissions' },
        { name: 'Advocate', role: 'Speak & campaign', support: 'Media training', earn: 'Speaker fees + grants' },
        { name: 'Partner', role: 'Grow the movement', support: 'Full team', earn: 'Profit share + leadership' }
      ],
      onboarding: {
        apply: 'Simple form — no gatekeeping',
        review: 'Community panel',
        buddy: 'Veteran creator assigned',
        tools: 'All software + training provided'
      },
      protection: {
        mental_health: 'Mandatory check-ins',
        legal: 'Contracts reviewed',
        anti_harassment: 'Zero-tolerance policy',
        data_rights: 'You own your content',
        withdrawal_rights: 'Remove your work at any time'
      },
      payout: {
        split: '70% Creator • 30% Movement',
        threshold: '£0 — every penny yours',
        schedule: 'Monthly — full transparency',
        bonus: 'Impact awards quarterly',
        public_ledger: true
      }
    });
  }

  // ==============================================
  // 5. DISTRIBUTION — EVERYWHERE, ALL AT ONCE
  // ==============================================
  initDistributionNetwork() {
    this.distributionChannels.set('active', {
      owned: ['Website', 'App', 'Email', 'Podcast RSS'],
      social: {
        YouTube: 'Long-form stories + education',
        TikTok: 'Daily hope + destigmatize',
        Instagram: 'Visuals + community',
        LinkedIn: 'Professional + policy',
        Spotify: 'Podcast exclusive drops'
      },
      partner: ['Apple Podcasts', 'Google Podcasts', 'Patreon', 'Substack'],
      schedule: {
        flagship: 'Wednesday 12pm GMT',
        social: 'Daily 3x',
        stories: 'User-submitted continuously',
        reports: 'Monthly impact public'
      },
      cross_promotion: 'All channels link together — one ecosystem'
    });
  }

  // ==============================================
  // 6. GOVERNANCE — COMMUNITY RULES
  // ==============================================
  initGovernance() {
    this.communityContent.set('rules', {
      standards: 'Kind. Authentic. Trauma-aware.',
      moderation: {
        team: 'Trained survivors',
        ai_role: 'Flag only — HUMANS decide',
        appeal: 'Elected community board',
        logs: 'Public — no secrets',
        response_time: '24hr acknowledgment target'
      },
      quality: {
        accuracy: 'Fact-checked',
        safety: 'Trigger warnings + resources',
        accessibility: 'Captions + transcripts required',
        ownership: 'Creator always owns their words'
      }
    });
  }

  // ==============================================
  // 7. ANALYTICS — TRANSPARENT DASHBOARD
  // ==============================================
  initAnalytics() {
    this.communityContent.set('metrics', {
      track: ['Reach', 'Engagement', 'Impact stories', 'Creator earnings'],
      privacy: 'No individual data sold',
      public_dashboard: true,
      what_matters: 'Lives changed > Viral numbers',
      anonymization: 'Personal identifiers stripped where possible'
    });
  }

  // ==============================================
  // PUBLIC API — CREATE, PUBLISH, REPORT
  // ==============================================
  submitContent(type, creatorId, data = {}) {
    if (!type || !creatorId) {
      console.warn('⚠️ Missing required fields: type or creatorId');
      return null;
    }

    const entry = {
      id: this.generateId(),
      type,
      creatorId,
      data,
      status: 'pending_review',
      submitted: new Date().toISOString(),
      published: null,
      views: 0,
      engagement: 0,
      anonymous: data.anonymous || false,
      tags: data.tags || []
    };

    this.db.content.push(entry);
    this.saveDB();
    console.log(`📥 Content submitted: ${entry.id}`);
    
    // Auto-approve demo mode — replace with real review workflow
    setTimeout(() => this.reviewContent(entry.id, 'approved'), 3000);
    return entry.id;
  }

  reviewContent(id, decision = 'approved') {
    const idx = this.db.content.findIndex(c => c.id === id);
    if (idx === -1) {
      console.warn(`⚠️ Content not found: ${id}`);
      return false;
    }

    this.db.content[idx].status = decision === 'approved' ? 'published' : 'rejected';
    this.db.content[idx].published = decision === 'approved' ? new Date().toISOString() : null;
    this.db.content[idx].reviewedAt = new Date().toISOString();
    this.db.content[idx].reviewNotes = decision === 'approved' ? 'Welcome to the movement 💙' : 'Thank you — we’ll connect soon';
    
    this.saveDB();
    console.log(`✅ Content ${decision}: ${id}`);
    return true;
  }

  recordView(id) {
    const item = this.db.content.find(c => c.id === id);
    if (item) {
      item.views++;
      this.saveDB();
      return item.views;
    }
    return null;
  }

  recordEngagement(id, type = 'like') {
    const item = this.db.content.find(c => c.id === id);
    if (item) {
      item.engagement++;
      this.db.analytics.push({
        contentId: id,
        type,
        timestamp: new Date().toISOString()
      });
      this.saveDB();
      return item.engagement;
    }
    return null;
  }

  getContent(id) {
    return this.db.content.find(c => c.id === id) || null;
  }

  listPublishedContent(limit = 20) {
    return this.db.content
      .filter(c => c.status === 'published')
      .sort((a, b) => new Date(b.published) - new Date(a.published))
      .slice(0, limit);
  }

  getReport() {
    const published = this.db.content.filter(c => c.status === 'published');
    return {
      generated: new Date().toLocaleString(),
      total_content: this.db.content.length,
      published: published.length,
      pending: this.db.content.filter(c => c.status === 'pending_review').length,
      total_views: this.db.content.reduce((s, c) => s + (c.views || 0), 0),
      total_engagement: this.db.content.reduce((s, c) => s + (c.engagement || 0), 0),
      active_creators: new Set(this.db.content.map(c => c.creatorId)).size,
      by_type: Object.fromEntries(
        [...new Set(this.db.content.map(c => c.type))].map(t => [
          t, this.db.content.filter(c => c.type === t).length
        ])
      )
    };
  }

  // ==============================================
  // UTILITIES
  // ==============================================
  generateId() {
    return `ps_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  startAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      localStorage.setItem(this.STORAGE_KEYS.lastSync, new Date().toISOString());
    }, 30000);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  registerGlobalAPI() {
    window.PS_Media_API = {
      submit: (type, creatorId, data) => this.submitContent(type, creatorId, data),
      get: (id) => this.getContent(id),
      list: (limit) => this.listPublishedContent(limit),
      view: (id) => this.recordView(id),
      engage: (id, type) => this.recordEngagement(id, type),
      report: () => this.getReport(),
      version: this.VERSION
    };
  }
}

// ==============================================
// ACTIVATE — RUNS ON EVERY PAGE
// ==============================================
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.PS_Media = new ContentMediaSystem();
    console.log('🌍 Pleading Sanity Media — AMPLIFYING SURVIVOR VOICES');
  });
}

// ==============================================
// EXPORT — Node/Testing Compatible
// ==============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentMediaSystem;
}
