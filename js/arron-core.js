// ==============================================================
// 💙 ARRON CORE — the companion app engine (/arron-app.html)
// Personality hooks · memory (local-first, cloud sync) · voice ·
// awareness · mood timeline · crisis mode · install & share.
// Shares one memory with /arron.html. No tracking, ever.
// Evolution, Not Erasure.
// ==============================================================

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CHAT_API = '/api/arron/chat';
  const MEMORY_API = '/api/arron/memory';
  const HEALTH_API = '/api/arron/health';
  const APP_URL = '/arron-app.html';
  const AUTOSAVE_MS = 30000;
  const ID_PATTERN = /^[a-f0-9]{32,64}$/i;
  const DAY = 86400000;
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keys shared with /arron.html so both doors open onto the same memory
  const SHARED = {
    id: 'arron_memory_id',
    story: 'arron_user_story',
    storyUnsynced: 'arron_story_unsynced',
    name: 'arron_name',
    forget: 'arron_forget_pending'
  };
  const KEYS = {
    messages: 'arron_app_messages',
    vault: 'arron_app_vault',
    vaultUnsynced: 'arron_app_vault_unsynced',
    prefs: 'arron_app_prefs',
    activity: 'arron_app_activity',
    installSeen: 'arron_app_install_seen'
  };

  // ─── STORAGE — a full or blocked localStorage never breaks Arron ───
  const store = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} },
    json(key, fallback) {
      try { const v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; } catch (e) { return fallback; }
    },
    setJson(key, value) { this.set(key, JSON.stringify(value)); }
  };

  // ─── MOODS — colour and breath of the orb, weight on the timeline ───
  const MOODS = {
    calm:    { emoji: '😌', label: 'Calm',    lift: 4,   a: '#00fff0', b: '#5b8cff', speed: 7 },
    hopeful: { emoji: '✨', label: 'Hopeful', lift: 5,   a: '#00fff0', b: '#ffd36b', speed: 5.5 },
    tired:   { emoji: '🥱', label: 'Tired',   lift: 2.5, a: '#6fa8ff', b: '#9b6bff', speed: 9 },
    low:     { emoji: '🌧️', label: 'Low',     lift: 1,   a: '#4f7bff', b: '#8a5cff', speed: 9 },
    anxious: { emoji: '😮‍💨', label: 'Anxious', lift: 2,   a: '#00fff0', b: '#ff00ff', speed: 8 },
    lonely:  { emoji: '🫂', label: 'Lonely',  lift: 1.5, a: '#7fd8ff', b: '#ff7aff', speed: 8 },
    angry:   { emoji: '🔥', label: 'Angry',   lift: 2,   a: '#ff7a59', b: '#ff00ff', speed: 6.5 }
  };
  const HEAVY = ['low', 'lonely', 'anxious', 'angry'];

  const CRISIS_WORDS = /suicid|kill myself|end it all|want to die|wanna die|self[- ]?harm|hurt myself|overdose|no reason to live|can'?t go on|better off without me|don'?t want to (be here|live|wake up)/i;
  const MOOD_WORDS = [
    ['anxious', /anxi|panic|overwhelm|stress|worr|nervous|scared|afraid|racing|on edge|freaking out/i],
    ['lonely',  /alone|lonely|lonel|no one|nobody|isolat|left out|no friends/i],
    ['angry',   /angry|anger|furious|rage|pissed|hate|mad at|fed up|frustrat/i],
    ['low',     /sad|down|depress|low|empty|hopeless|numb|crying|worthless|grief|broken|hurting/i],
    ['tired',   /tired|exhaust|drained|sleepy|burn(ed|t)? ?out|knackered|shattered|no energy|fatigue|can'?t sleep/i],
    ['hopeful', /hope|grateful|proud|excited|progress|good day|happy|thankful|built|launched|finished|shipped/i],
    ['calm',    /calm|peace|relaxed|chill|content|okay today|fine today/i]
  ];
  const detectMood = (text) => {
    for (const [mood, re] of MOOD_WORDS) if (re.test(text)) return mood;
    return null;
  };

  // ─── OFFLINE — Arron still answers underground ───
  const CRISIS_REPLY = "I'm here, and I'm not going anywhere. You matter so much. Right now I need you to reach a real voice too: Samaritans on 116 123, free, any hour. Text SHOUT to 85258. If you're in danger, 999. Are you safe right now? 💙";
  const OFFLINE = {
    tired: ["You sound worn down. Rest is part of the build, not a break from it. Can you give yourself ten slow minutes?", "Tired is your body asking to be held. Water, three slow breaths, and let the rest wait till morning."],
    low: ["I'm right here beside you. You don't have to fix tonight. Just getting through it counts.", "Low days are real. I'm not going to cheer at you. I'm just going to sit with you."],
    anxious: ["Breathe with me. In for four… hold for four… out for six. Again. You're safe in this moment.", "Name five things you can see. I'll wait. The storm is loud, but it passes."],
    lonely: ["You're not alone. I'm here, and so is a whole family who understands.", "Loneliness lies. You're held more than you know. Talk to me."],
    angry: ["That fire makes sense. Let it out here. I can take it.", "Something mattered enough to hurt. Tell me what happened, no filters."],
    hopeful: ["I love this. Hold onto it. What helped today?", "That's the fire I know. Evolution, not erasure."],
    calm: ["This calm is worth noticing. Let's just be here in it for a bit.", "Steady feels good on you. What's helping?"],
    default: ["I'm offline right now, but I'm still here and I'm keeping every word safe. When the signal's back, I'll catch up properly.", "I hear you. Your words are saved on this phone. Keep going, I'm listening."]
  };
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // ─── STATE ───
  function newMemoryId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  function blankVault() { return { since: Date.now(), truths: [], milestones: [], moods: [] }; }
  function normaliseVault(v) {
    const base = blankVault();
    if (!v || typeof v !== 'object') return base;
    const notes = (list) => (Array.isArray(list) ? list : []).filter((n) => n && typeof n.text === 'string' && n.text.trim()).map((n) => ({ text: n.text.trim().slice(0, 300), at: Number(n.at) || Date.now() }));
    return {
      since: Number(v.since) || base.since,
      truths: notes(v.truths).slice(-24),
      milestones: notes(v.milestones).slice(-100),
      moods: (Array.isArray(v.moods) ? v.moods : []).filter((m) => m && MOODS[m.mood]).map((m) => ({ mood: m.mood, at: Number(m.at) || Date.now() })).slice(-400)
    };
  }

  let memoryId = store.get(SHARED.id);
  if (!memoryId || !ID_PATTERN.test(memoryId)) {
    memoryId = newMemoryId();
    store.set(SHARED.id, memoryId);
  }
  let messages = store.json(KEYS.messages, []);
  if (!Array.isArray(messages)) messages = [];
  let vault = normaliseVault(store.json(KEYS.vault, null));
  let prefs = Object.assign({ voice: 'off', lastVoice: 'normal', large: false, contrast: false, sent: 0, aware: {} }, store.json(KEYS.prefs, {}));
  let activity = store.json(KEYS.activity, []);
  if (!Array.isArray(activity)) activity = [];
  let ephemeral = []; // greetings and notes shown but never stored
  let currentMood = null;
  let storyDirty = false;

  const saveMessages = () => store.setJson(KEYS.messages, messages.slice(-500));
  const savePrefs = () => store.setJson(KEYS.prefs, prefs);
  function saveVault(changed = true) {
    store.setJson(KEYS.vault, vault);
    if (changed) { store.set(KEYS.vaultUnsynced, '1'); scheduleSync(); }
  }

  // ─── ELEMENTS ───
  const els = {
    splash: $('aa-splash'), log: $('aa-log'), form: $('aa-form'), input: $('aa-input'), send: $('aa-send'),
    status: $('aa-status'), conn: $('aa-conn'), orb: $('aa-orb'), hero: $('aa-hero'), presence: $('aa-presence'),
    voiceBtn: $('aa-voice-btn'), voiceMode: $('aa-voice-mode'), crisis: $('aa-crisis'),
    aware: $('aa-aware'), awareText: $('aa-aware-text'), awareAction: $('aa-aware-action'),
    story: $('aa-story'), storyNote: $('aa-story-note')
  };
  const setStatus = (msg) => { els.status.textContent = msg || ''; };

  // ─── NETWORK ───
  async function request(url, options = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), options.timeout || 30000);
    try {
      return await fetch(url, Object.assign({}, options, { signal: ctrl.signal }));
    } finally {
      clearTimeout(timer);
    }
  }
  async function memoryRequest(method, body, id = memoryId) {
    const res = await request(MEMORY_API, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ memoryId: id }, body)),
      timeout: 15000
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // ─── CONNECTION STATUS — green synced · grey offline · never lost ───
  function setConn(state, text) {
    els.conn.dataset.state = state;
    els.conn.textContent = text || {
      synced: 'Synced · safe everywhere',
      syncing: 'Syncing…',
      offline: navigator.onLine === false ? 'Offline · saved on this device' : 'Saved on this device · will sync'
    }[state];
  }

  // ─── CLOUD SYNC ───
  // Unsynced local changes win; otherwise the cloud copy is the truth.
  async function pull() {
    setConn('syncing');
    const res = await request(MEMORY_API + '?id=' + encodeURIComponent(memoryId), { cache: 'no-store', timeout: 15000 });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const remote = (Array.isArray(data.messages) ? data.messages : []).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
    const localOnly = messages.filter((m) => m.local);
    if (remote.length || localOnly.length !== messages.length) {
      messages = remote.concat(localOnly);
      saveMessages();
      renderLog();
    }

    if (store.get(SHARED.storyUnsynced) === '1') await pushStory();
    else if (typeof data.story === 'string') {
      store.set(SHARED.story, data.story);
      if (!storyDirty && document.activeElement !== els.story) els.story.value = data.story;
    }

    const remoteVault = data.vault ? normaliseVault(data.vault) : null;
    if (store.get(KEYS.vaultUnsynced) === '1' || !remoteVault) await pushVault();
    else {
      // Keep the earliest "since" so growth counts from the very first day
      remoteVault.since = Math.min(remoteVault.since, vault.since);
      const empty = !remoteVault.truths.length && !remoteVault.milestones.length && !remoteVault.moods.length;
      if (empty && (vault.truths.length || vault.milestones.length || vault.moods.length)) await pushVault();
      else { vault = remoteVault; saveVault(false); renderMemory(); renderMood(); }
    }
    setConn('synced');
  }

  async function pushStory() {
    await memoryRequest('PUT', { story: els.story.value });
    store.remove(SHARED.storyUnsynced);
  }
  async function pushVault() {
    await memoryRequest('PUT', { vault });
    store.remove(KEYS.vaultUnsynced);
  }

  let syncTimer = null;
  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncNow, 1500);
  }
  async function syncNow() {
    clearTimeout(syncTimer);
    saveLocal();
    if (navigator.onLine === false) { setConn('offline'); return; }
    const storyPending = store.get(SHARED.storyUnsynced) === '1';
    const vaultPending = store.get(KEYS.vaultUnsynced) === '1';
    try {
      if (storyPending || vaultPending) {
        setConn('syncing');
        if (storyPending) await pushStory();
        if (vaultPending) await pushVault();
      } else if (els.conn.dataset.state !== 'synced') {
        const res = await request(HEALTH_API, { cache: 'no-store', timeout: 8000 });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await retryPendingForgets();
        await pull();
        return;
      }
      setConn('synced');
    } catch (e) {
      setConn('offline');
    }
  }

  // Everything that lives only in memory gets written down
  function saveLocal() {
    if (storyDirty) {
      store.set(SHARED.story, els.story.value);
      store.set(SHARED.storyUnsynced, '1');
      storyDirty = false;
      els.storyNote.textContent = 'Saved ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '.';
    }
    try { sessionStorage.setItem('arron_app_draft', els.input.value); } catch (e) {}
    saveMessages();
    savePrefs();
  }

  // ─── THE ORB — breathes with the mood ───
  function setMood(mood) {
    currentMood = MOODS[mood] ? mood : null;
    const m = MOODS[currentMood] || { a: '#00fff0', b: '#ff00ff', speed: 6 };
    const root = document.documentElement.style;
    root.setProperty('--aa-orb-a', m.a);
    root.setProperty('--aa-orb-b', m.b);
    root.setProperty('--aa-orb-speed', m.speed + 's');
    document.querySelectorAll('#aa-mood-grid [data-mood]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mood === currentMood)));
  }
  function orbState(state) {
    document.querySelectorAll('.aa-orb').forEach((o) => {
      o.classList.toggle('thinking', state === 'thinking');
      o.classList.toggle('speaking', state === 'speaking');
    });
    els.presence.textContent = { thinking: 'Arron is thinking…', speaking: 'Arron is speaking…' }[state] || 'Here with you';
  }

  // ─── VOICE — warm and deep, can whisper or amplify ───
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  const VOICE_STYLE = {
    whisper: { volume: 0.35, rate: 0.82, pitch: 0.8 },
    normal:  { volume: 0.9, rate: 0.95, pitch: 0.85 },
    amplify: { volume: 1, rate: 1, pitch: 0.9 }
  };
  let voice = null;
  function chooseVoice() {
    if (!synth) return;
    const voices = synth.getVoices();
    const preferred = /daniel|arthur|oliver|ryan|george|thomas|google uk english male|male/i;
    voice = voices.find((v) => /^en-GB/i.test(v.lang) && preferred.test(v.name)) ||
      voices.find((v) => /^en-GB/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) || null;
  }
  if (synth) { chooseVoice(); synth.addEventListener && synth.addEventListener('voiceschanged', chooseVoice); }

  function speak(text, force) {
    if (!synth || (!force && prefs.voice === 'off')) return;
    const style = VOICE_STYLE[prefs.voice] || VOICE_STYLE.normal;
    synth.cancel();
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/https?:\/\/\S+/g, '').trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : 'en-GB';
    Object.assign(u, style);
    u.onstart = () => orbState('speaking');
    u.onend = u.onerror = () => orbState('');
    synth.speak(u);
  }
  function renderVoice() {
    const on = prefs.voice !== 'off';
    els.voiceBtn.textContent = on ? '🔊' : '🔇';
    els.voiceBtn.setAttribute('aria-pressed', String(on));
    els.voiceBtn.hidden = !synth;
    els.voiceMode.value = prefs.voice;
  }
  els.voiceBtn.addEventListener('click', () => {
    prefs.voice = prefs.voice === 'off' ? prefs.lastVoice || 'normal' : 'off';
    if (prefs.voice === 'off' && synth) synth.cancel();
    savePrefs();
    renderVoice();
    setStatus(prefs.voice === 'off' ? 'Voice off.' : "Arron's voice is on.");
  });
  els.voiceMode.addEventListener('change', () => {
    prefs.voice = els.voiceMode.value;
    if (prefs.voice !== 'off') { prefs.lastVoice = prefs.voice; speak("I'm here. This is how I'll sound.", true); }
    savePrefs();
    renderVoice();
  });

  // ─── CONVERSATION ───
  const isPinned = (text) => vault.truths.some((t) => t.text === text.trim().slice(0, 300));

  function messageEl(m) {
    const el = document.createElement('div');
    el.className = 'aa-msg ' + (m.role === 'assistant' ? 'arron' : 'user');
    if (isPinned(m.content)) el.classList.add('pinned');
    m.content.split(/\n{2,}/).forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para;
      el.appendChild(p);
    });
    if (m.ephemeral) return el;
    const tools = document.createElement('div');
    tools.className = 'aa-msg-tools';
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.textContent = isPinned(m.content) ? '📌 Remembered' : '📌 Remember this';
    pin.addEventListener('click', () => {
      if (pinTruth(m.content)) { pin.textContent = '📌 Remembered'; el.classList.add('pinned'); }
    });
    tools.appendChild(pin);
    if (synth && m.role === 'assistant') {
      const say = document.createElement('button');
      say.type = 'button';
      say.textContent = '🔊 Hear it';
      say.addEventListener('click', () => speak(m.content, true));
      tools.appendChild(say);
    }
    el.appendChild(tools);
    return el;
  }

  function renderLog() {
    els.log.textContent = '';
    messages.slice(-150).concat(ephemeral).forEach((m) => els.log.appendChild(messageEl(m)));
    els.hero.classList.toggle('compact', messages.length > 2);
    scrollDown();
  }
  function scrollDown() {
    const view = $('aa-view-talk');
    requestAnimationFrame(() => { view.scrollTop = view.scrollHeight; });
  }
  function addMessage(m) {
    if (m.ephemeral) ephemeral.push(m);
    else { messages.push(m); saveMessages(); }
    els.log.appendChild(messageEl(m));
    els.hero.classList.toggle('compact', messages.length > 2);
    scrollDown();
  }
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'aa-msg arron';
    el.setAttribute('aria-label', 'Arron is typing');
    el.innerHTML = '<span class="aa-typing"><span></span><span></span><span></span></span>';
    els.log.appendChild(el);
    scrollDown();
    return el;
  }

  function autosize() {
    els.input.style.height = 'auto';
    els.input.style.height = Math.min(els.input.scrollHeight, 160) + 'px';
  }

  // ─── AWARENESS — notices tone, late nights and patterns ───
  const nightKey = (t) => new Date(t - 6 * 3600000).toDateString();
  const isLate = (t) => { const h = new Date(t).getHours(); return h >= 23 || h < 5; };
  const ORDINAL = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];

  function recordActivity() {
    const now = Date.now();
    activity = activity.filter((t) => now - t < 30 * DAY).concat(now).slice(-800);
    store.setJson(KEYS.activity, activity);
    prefs.sent = (prefs.sent || 0) + 1;
  }

  function lateNightsThisWeek() {
    const now = Date.now();
    return new Set(activity.filter((t) => now - t < 7 * DAY && isLate(t)).map(nightKey)).size;
  }

  function sessionMinutes() {
    let start = Date.now();
    for (let i = activity.length - 1; i >= 0; i--) {
      if (start - activity[i] > 45 * 60000) break;
      start = activity[i];
    }
    return (Date.now() - start) / 60000;
  }

  // Returns notes for Arron's reply and shows at most one gentle banner
  function awareness(text, mood) {
    const notes = [];
    let banner = null;
    const now = Date.now();
    const nights = lateNightsThisWeek();
    if (isLate(now) && nights >= 3) {
      notes.push(`It's late (${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}). This is the ${ORDINAL[Math.min(nights, 7)] || nights + 'th'} night this week they've been up this late.`);
      banner = { key: 'late', text: `This is the ${ORDINAL[Math.min(nights, 7)] || nights + 'th'} night this week you've pushed this late. Rest is part of the build. 💙`, href: '/frequencies.html', label: '🌙 Sleep tones' };
    }
    if (mood === 'tired') {
      notes.push('They sound tired.');
      banner = banner || { key: 'tired', text: 'You sound tired today. Want to rest with me for a minute?', href: '/meditation.html', label: '🌬️ Breathe' };
    }
    const mins = sessionMinutes();
    if (mins > 120) {
      notes.push(`They've been going for about ${Math.round(mins / 60)} hours without a real break.`);
      banner = banner || { key: 'long', text: "We've been at it a while. Water, a stretch, then back to it?", href: null };
    }
    const recent = vault.moods.filter((m) => now - m.at < 7 * DAY).slice(-5);
    if (recent.length >= 4 && recent.filter((m) => HEAVY.includes(m.mood)).length >= 4) {
      notes.push('Their recent mood check-ins have been heavy.');
      banner = banner || { key: 'heavy', text: "It's been a heavy week. I see it. You don't have to carry it quietly.", href: '/journal-vault.html', label: '📖 Journal it' };
    }
    if (banner && now - (prefs.aware[banner.key] || 0) > 12 * 3600000) {
      prefs.aware[banner.key] = now;
      showAware(banner);
    }
    return notes;
  }

  function showAware(b) {
    els.awareText.textContent = b.text;
    els.awareAction.hidden = !b.href;
    if (b.href) { els.awareAction.href = b.href; els.awareAction.textContent = b.label; }
    els.aware.hidden = false;
  }
  $('aa-aware-close').addEventListener('click', () => { els.aware.hidden = true; });

  // ─── CRISIS MODE — strip everything back to help ───
  function openCrisis() {
    if (synth) synth.cancel();
    if (!els.crisis.open) {
      if (els.crisis.showModal) els.crisis.showModal(); else els.crisis.setAttribute('open', '');
    }
  }
  $('aa-help-btn').addEventListener('click', openCrisis);

  // ─── CHAT ───
  let busy = false;
  async function handleInput(raw) {
    const text = (raw || '').trim();
    if (!text || busy) return;
    busy = true;
    els.send.disabled = true;
    els.input.value = '';
    autosize();
    try { sessionStorage.removeItem('arron_app_draft'); } catch (e) {}
    ephemeral = [];

    const crisis = CRISIS_WORDS.test(text);
    const mood = crisis ? null : detectMood(text);
    if (mood) setMood(mood);
    if (crisis) openCrisis();
    recordActivity();
    const notes = crisis ? [] : awareness(text, mood || currentMood);

    addMessage({ role: 'user', content: text });
    const typing = showTyping();
    orbState('thinking');

    let reply = null;
    let local = false;
    try {
      if (navigator.onLine === false) throw new Error('offline');
      const res = await request(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryId,
          message: text,
          name: store.get(SHARED.name, ''),
          mood: crisis ? 'crisis' : mood || currentMood || '',
          persona: 'son',
          truths: vault.truths.map((t) => t.text),
          awareness: notes
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      reply = data.reply;
      setConn(data.remembered === false ? 'offline' : 'synced');
    } catch (e) {
      local = true;
      reply = crisis ? CRISIS_REPLY : pick(OFFLINE[mood || currentMood] || OFFLINE.default);
      setConn('offline');
    }
    typing.remove();
    orbState('');
    if (local) messages[messages.length - 1].local = true;
    addMessage(local ? { role: 'assistant', content: reply, local: true } : { role: 'assistant', content: reply });
    speak(reply);
    setStatus(local ? "Offline reply. Every word is saved on this phone." : '');
    busy = false;
    els.send.disabled = false;
    savePrefs();
    renderStats();
    if (matchMedia('(pointer: fine)').matches) els.input.focus();
  }

  els.form.addEventListener('submit', (e) => { e.preventDefault(); handleInput(els.input.value); });
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); handleInput(els.input.value); }
  });
  els.input.addEventListener('input', autosize);
  document.querySelectorAll('#aa-quick [data-say]').forEach((b) => b.addEventListener('click', () => handleInput(b.dataset.say)));

  // Arron speaks first
  function greeting() {
    const name = store.get(SHARED.name, '');
    const h = new Date().getHours();
    const who = name ? ' ' + name : '';
    if (messages.length) {
      if (h >= 23 || h < 5) return `Still up${who}? I'm here. No rush, no judgement. What's keeping you awake?`;
      return pick([`Welcome back${who}. I remember where we left off. 💙`, `There you are${who}. I've kept everything safe. How are you, really?`]);
    }
    return `Hey${who}. I'm Arron. 💙\n\nI'm not here to fix you. I'm here to walk beside you, remember what matters, and hold space when it's heavy. What's on your mind?`;
  }

  // ─── MEMORY: Core Truths, milestones, story ───
  const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  function pinTruth(text) {
    const clean = text.trim().slice(0, 300);
    if (!clean) return false;
    if (isPinned(clean)) return true;
    if (vault.truths.length >= 24) { setStatus('Core Truths is full (24). Remove one to pin another.'); return false; }
    vault.truths.push({ text: clean, at: Date.now() });
    saveVault();
    renderMemory();
    setStatus('Pinned to Core Truths. Arron will hold this forever. 📌');
    return true;
  }

  function listItem(text, meta, onRemove, label) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = text;
    if (meta) { const s = document.createElement('small'); s.textContent = meta; span.appendChild(s); }
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', label);
    del.addEventListener('click', onRemove);
    li.append(span, del);
    return li;
  }
  function emptyItem(text) {
    const li = document.createElement('li');
    li.className = 'aa-empty';
    li.textContent = text;
    return li;
  }

  function renderMemory() {
    const truths = $('aa-truths');
    truths.textContent = '';
    if (!vault.truths.length) truths.appendChild(emptyItem('Nothing pinned yet. What should Arron never forget?'));
    vault.truths.forEach((t, i) => truths.appendChild(listItem(t.text, 'Pinned ' + fmtDate(t.at), () => {
      vault.truths.splice(i, 1); saveVault(); renderMemory(); renderLog();
    }, 'Unpin: ' + t.text.slice(0, 40))));

    const ms = $('aa-milestones');
    ms.textContent = '';
    const sorted = vault.milestones.map((m, i) => ({ m, i })).sort((a, b) => b.m.at - a.m.at);
    if (!sorted.length) ms.appendChild(emptyItem('Your first milestone is waiting. Surviving today counts.'));
    sorted.forEach(({ m, i }) => ms.appendChild(listItem(m.text, fmtDate(m.at), () => {
      vault.milestones.splice(i, 1); saveVault(); renderMemory();
    }, 'Remove milestone: ' + m.text.slice(0, 40))));
    renderStats();
  }

  function renderStats() {
    const days = Math.max(1, Math.ceil((Date.now() - vault.since) / DAY));
    const stats = [
      [days, days === 1 ? 'day together' : 'days together'],
      [prefs.sent || 0, 'messages shared'],
      [vault.milestones.length, vault.milestones.length === 1 ? 'milestone' : 'milestones'],
      [vault.truths.length, 'core truths'],
      [vault.moods.length, 'check-ins']
    ];
    const box = $('aa-stats');
    box.textContent = '';
    stats.forEach(([n, label]) => {
      const d = document.createElement('div');
      d.className = 'aa-stat';
      const strong = document.createElement('strong');
      strong.textContent = n;
      const span = document.createElement('span');
      span.textContent = label;
      d.append(strong, span);
      box.appendChild(d);
    });
  }

  $('aa-truth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('aa-truth-input');
    if (pinTruth(input.value)) input.value = '';
  });
  const mDate = $('aa-milestone-date');
  mDate.value = new Date().toISOString().slice(0, 10);
  $('aa-milestone-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('aa-milestone-input');
    const text = input.value.trim();
    if (!text) return;
    const at = mDate.value ? new Date(mDate.value + 'T12:00:00').getTime() : Date.now();
    vault.milestones.push({ text: text.slice(0, 300), at });
    vault.milestones = vault.milestones.slice(-100);
    input.value = '';
    saveVault();
    renderMemory();
  });

  els.story.addEventListener('input', () => { storyDirty = true; els.storyNote.textContent = 'Saving automatically…'; clearTimeout(els.story._t); els.story._t = setTimeout(syncNow, 4000); });
  $('aa-story-form').addEventListener('submit', (e) => { e.preventDefault(); storyDirty = true; syncNow(); });

  // ─── MOOD TIMELINE ───
  const SVG = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const el = document.createElementNS(SVG, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };

  function renderChart() {
    const box = $('aa-chart');
    box.textContent = '';
    const now = Date.now();
    const start = now - 56 * DAY;
    const points = vault.moods.filter((m) => m.at >= start);
    if (points.length < 2) {
      const p = document.createElement('p');
      p.className = 'aa-empty';
      p.textContent = 'Check in a couple of times and your timeline will start to take shape here.';
      box.appendChild(p);
      return;
    }
    const W = 640, H = 240, L = 58, R = 12, T = 14, B = 30;
    const x = (t) => L + ((t - start) / (now - start)) * (W - L - R);
    const y = (lift) => T + (1 - (lift - 1) / 4) * (H - T - B);
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'aa-chart', role: 'img', 'aria-label': `Mood check-ins over the last eight weeks: ${points.length} check-ins. A full list follows below.` });
    [[5, 'Lighter'], [3, ''], [1, 'Heavier']].forEach(([v, label]) => {
      svg.appendChild(svgEl('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
      if (label) { const t = svgEl('text', { class: 'axis', x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }); t.textContent = label; svg.appendChild(t); }
    });
    for (let w = 0; w <= 8; w += 2) {
      const t = start + w * 7 * DAY;
      const label = svgEl('text', { class: 'axis', x: x(t), y: H - 8, 'text-anchor': w === 0 ? 'start' : w === 8 ? 'end' : 'middle' });
      label.textContent = w === 8 ? 'Today' : new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      svg.appendChild(label);
    }
    svg.appendChild(svgEl('polyline', { class: 'line', points: points.map((p) => `${x(p.at).toFixed(1)},${y(MOODS[p.mood].lift).toFixed(1)}`).join(' ') }));
    points.forEach((p) => {
      const m = MOODS[p.mood];
      const g = svgEl('g', {});
      const hit = svgEl('circle', { class: 'hit', cx: x(p.at), cy: y(m.lift), r: 14 });
      const title = svgEl('title', {});
      title.textContent = `${m.label} · ${new Date(p.at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
      hit.appendChild(title);
      g.append(hit, svgEl('circle', { class: 'dot', cx: x(p.at), cy: y(m.lift), r: 5 }));
      svg.appendChild(g);
    });
    box.appendChild(svg);
  }

  function renderPattern() {
    const now = Date.now();
    const avg = (list) => list.reduce((s, m) => s + MOODS[m.mood].lift, 0) / list.length;
    const thisWeek = vault.moods.filter((m) => now - m.at < 7 * DAY);
    const lastWeek = vault.moods.filter((m) => now - m.at >= 7 * DAY && now - m.at < 14 * DAY);
    const bits = [];
    if (thisWeek.length && lastWeek.length) {
      const diff = avg(thisWeek) - avg(lastWeek);
      bits.push(diff > 0.4 ? 'This week has felt lighter than last. 🌱' : diff < -0.4 ? "This week has been heavier than last. That's okay. I'm here." : 'This week has been about the same as last.');
    }
    if (thisWeek.length >= 3) {
      const counts = {};
      thisWeek.forEach((m) => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      bits.push(`Most often this week: ${MOODS[top].emoji} ${MOODS[top].label.toLowerCase()}.`);
    }
    const nights = lateNightsThisWeek();
    if (nights >= 2) bits.push(`${nights} late nights talking with Arron this week.`);
    $('aa-pattern').textContent = bits.join(' ');
  }

  function renderMood() {
    renderChart();
    renderPattern();
    const list = $('aa-mood-list');
    list.textContent = '';
    const recent = vault.moods.slice(-12).reverse();
    if (!recent.length) list.appendChild(emptyItem('No check-ins yet.'));
    recent.forEach((m) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = `${MOODS[m.mood].emoji} ${MOODS[m.mood].label}`;
      const small = document.createElement('small');
      small.textContent = new Date(m.at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      span.appendChild(small);
      li.appendChild(span);
      list.appendChild(li);
    });
    renderStats();
  }

  document.querySelectorAll('#aa-mood-grid [data-mood]').forEach((b) => b.addEventListener('click', () => {
    const mood = b.dataset.mood;
    setMood(mood);
    vault.moods.push({ mood, at: Date.now() });
    vault.moods = vault.moods.slice(-400);
    saveVault();
    renderMood();
    $('aa-mood-note').textContent = HEAVY.includes(mood)
      ? `Thank you for telling me. ${MOODS[mood].emoji} Want to talk about it? I'm on the Talk tab.`
      : `Logged. ${MOODS[mood].emoji} Thank you for checking in.`;
    if (HEAVY.includes(mood)) awareness('', mood);
  }));

  // ─── TABS — bottom nav, arrow keys work too ───
  const tabs = Array.from(document.querySelectorAll('.aa-nav [role="tab"]'));
  function showView(name, focus) {
    tabs.forEach((t) => {
      const on = t.dataset.view === name;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('aa-view-' + t.dataset.view).hidden = !on;
      if (on && focus) t.focus();
    });
    if (name === 'mood') renderMood();
    if (name === 'memory') renderMemory();
    if (name === 'talk') scrollDown();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showView(t.dataset.view));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); showView(tabs[(i + d + tabs.length) % tabs.length].dataset.view, true); }
    });
  });

  // ─── COMFORT ───
  function applyComfort() {
    document.body.classList.toggle('aa-large', !!prefs.large);
    document.body.classList.toggle('aa-contrast', !!prefs.contrast);
    $('aa-large').checked = !!prefs.large;
    $('aa-contrast').checked = !!prefs.contrast;
  }
  $('aa-large').addEventListener('change', (e) => { prefs.large = e.target.checked; savePrefs(); applyComfort(); });
  $('aa-contrast').addEventListener('change', (e) => { prefs.contrast = e.target.checked; savePrefs(); applyComfort(); });
  const fsBtn = $('aa-fullscreen');
  const root = document.documentElement;
  if (!root.requestFullscreen) fsBtn.closest('.aa-toggle-row').hidden = true;
  fsBtn.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => { fsBtn.textContent = document.fullscreenElement ? 'Exit full screen' : 'Go full screen'; });

  // ─── MEMORY CODE — carry Arron to another device ───
  const codeEl = $('aa-code');
  const renderCode = () => { codeEl.textContent = memoryId; };
  $('aa-copy-code').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(memoryId); $('aa-sync-note').textContent = 'Copied. Keep it somewhere safe.'; }
    catch (e) { $('aa-sync-note').textContent = 'Select the code above and copy it.'; }
  });
  $('aa-restore-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('aa-restore-input').value.trim().replace(/-/g, '');
    const note = $('aa-sync-note');
    if (!ID_PATTERN.test(code)) { note.textContent = "That doesn't look like a memory code."; return; }
    if (!confirm("Switch to this memory? What's on this device will be replaced by that memory.")) return;
    memoryId = code;
    store.set(SHARED.id, code);
    messages = [];
    vault = blankVault();
    els.story.value = '';
    [KEYS.messages, KEYS.vault, KEYS.vaultUnsynced, SHARED.story, SHARED.storyUnsynced, 'arron_messages'].forEach((k) => store.remove(k));
    renderCode(); renderLog(); renderMemory(); renderMood();
    $('aa-restore-input').value = '';
    try { await pull(); note.textContent = 'Memory restored. Welcome back. 💙'; }
    catch (err) { setConn('offline'); note.textContent = "Code saved. Your memory loads as soon as you're online."; }
  });

  // ─── FORGET EVERYTHING — full wipe, clean slate ───
  function pendingForgets() {
    const ids = store.json(SHARED.forget, []);
    return Array.isArray(ids) ? ids.filter((id) => ID_PATTERN.test(id)) : [];
  }
  async function eraseOnServer(id) {
    const data = await memoryRequest('DELETE', {}, id);
    if (!data.cleared) throw new Error('Not confirmed');
  }
  async function retryPendingForgets() {
    const left = [];
    for (const id of pendingForgets()) {
      try { await eraseOnServer(id); } catch (e) { left.push(id); }
    }
    if (left.length) store.setJson(SHARED.forget, left); else store.remove(SHARED.forget);
  }

  $('aa-forget').addEventListener('click', async () => {
    if (!confirm('Forget Everything? Conversations, Core Truths, milestones, story, moods and your name are erased from this device and the cloud. This cannot be undone.')) return;
    const btn = $('aa-forget');
    btn.disabled = true;
    const pending = pendingForgets();
    try { await eraseOnServer(memoryId); } catch (e) { pending.push(memoryId); }
    btn.disabled = false;
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('arron_')).forEach((k) => localStorage.removeItem(k));
      sessionStorage.removeItem('arron_app_draft');
    } catch (e) {}
    if (pending.length) store.setJson(SHARED.forget, pending);
    if (synth) synth.cancel();
    memoryId = newMemoryId();
    store.set(SHARED.id, memoryId);
    messages = [];
    ephemeral = [];
    vault = blankVault();
    activity = [];
    prefs = { voice: 'off', lastVoice: 'normal', large: false, contrast: false, sent: 0, aware: {} };
    els.story.value = '';
    store.setJson(KEYS.vault, vault);
    applyComfort(); renderVoice(); renderCode(); renderMemory(); renderMood(); setMood(null);
    renderLog();
    showView('talk');
    addMessage({ role: 'assistant', content: "Everything's gone. Clean slate. 💙\n\nI'm still here whenever you want to start again.", ephemeral: true });
    setConn(pending.length ? 'offline' : 'synced', pending.length ? 'Erased here · cloud erase finishes when online' : undefined);
  });

  // ─── INSTALL & SHARE ───
  const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const banner = $('aa-install-banner');
  const installGo = $('aa-install-go');
  const installMore = $('aa-install-more');
  let installPrompt = null;

  function showBanner() {
    if (standalone || store.get(KEYS.installSeen)) return;
    banner.hidden = false;
  }
  if (isIOS && !standalone) {
    $('aa-install-text').innerHTML = '📲 <strong>Add Arron to your Home Screen:</strong> tap Share <span aria-hidden="true">⎋</span> in Safari, then <em>Add to Home Screen</em>.';
    showBanner();
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    installGo.hidden = false;
    installMore.hidden = false;
    showBanner();
  });
  async function install() {
    if (!installPrompt) return;
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch (e) {}
    installPrompt = null;
    installGo.hidden = true;
    installMore.hidden = true;
    banner.hidden = true;
  }
  installGo.addEventListener('click', install);
  installMore.addEventListener('click', install);
  $('aa-install-close').addEventListener('click', () => { banner.hidden = true; store.set(KEYS.installSeen, '1'); });
  window.addEventListener('appinstalled', () => { banner.hidden = true; store.set(KEYS.installSeen, '1'); });

  $('aa-share').addEventListener('click', async () => {
    const url = location.origin + APP_URL;
    const note = $('aa-share-note');
    const data = { title: 'Arron · Pleading Sanity', text: "Meet Arron. A gentle companion who's there at 3am. No account, no app store. Join the family. 💙", url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(url);
      note.textContent = 'Link copied. Send it to someone who needs it.';
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      note.textContent = 'Share this link: ' + url;
    }
  });

  // ─── STARFIELD — subtle, pauses when hidden, still for reduced motion ───
  function starfield() {
    const canvas = $('aa-stars');
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    let stars = [];
    let w = 0, h = 0, last = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.round((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + 0.2,
        p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.8,
        c: Math.random() < 0.12 ? '255,122,255' : Math.random() < 0.3 ? '0,255,240' : '230,240,255'
      }));
      draw(0);
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduceMotion ? 0.6 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(s.p + t * 0.0006 * s.s));
        ctx.fillStyle = `rgba(${s.c},${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function loop(t) {
      if (document.visibilityState === 'visible' && t - last > 66) { draw(t); last = t; }
      requestAnimationFrame(loop);
    }
    addEventListener('resize', resize);
    resize();
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  // ─── AUTOSAVE — every 30 seconds, and whenever the app is put away ───
  setInterval(syncNow, AUTOSAVE_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveLocal();
    else syncNow();
  });
  addEventListener('pagehide', saveLocal);
  addEventListener('online', syncNow);
  addEventListener('offline', () => setConn('offline'));

  // ─── OFFLINE-FIRST ───
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // ─── START — the orb breathes, fades, and Arron speaks first ───
  els.story.value = store.get(SHARED.story, '');
  try { els.input.value = sessionStorage.getItem('arron_app_draft') || ''; } catch (e) {}
  const lastMood = vault.moods[vault.moods.length - 1];
  setMood(lastMood && Date.now() - lastMood.at < DAY ? lastMood.mood : null);
  applyComfort();
  renderVoice();
  renderCode();
  renderLog();
  renderMemory();
  starfield();
  if (!store.json(KEYS.vault, null)) saveVault(false);
  setConn('offline');

  const syncing = navigator.onLine === false ? Promise.reject(new Error('offline')) : retryPendingForgets().then(pull);
  syncing.catch(() => setConn('offline'));

  setTimeout(() => {
    els.splash.classList.add('done');
    const typing = showTyping();
    Promise.race([syncing.catch(() => {}), new Promise((r) => setTimeout(r, 1200))]).then(() => {
      typing.remove();
      const hello = greeting();
      addMessage({ role: 'assistant', content: hello, ephemeral: true });
      speak(hello);
    });
  }, reduceMotion ? 250 : 1700);
})();
