// ==============================================================
// 💙 ARRON — COMPANION APP  (/arron.html)
// Chat · Your Story memory · Mood check-ins · Forget Me
// Auto-reconnect · Offline replies · Reply chime · Onboarding
// Server: netlify/functions/arron.mts (memory in Netlify Database)
// ==============================================================
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const app = document.querySelector('.arron-app');
  const conversationBox = $('arron-conversation');
  if (!conversationBox || !app) return;

  const mainPanel = document.querySelector('.arron-main');
  const inputForm = $('arron-input-form');
  const inputField = $('arron-input');
  const sendButton = inputForm.querySelector('button[type="submit"]');
  const promptsBox = $('arron-prompts');
  const statusEl = $('arron-status');
  const bannerEl = $('arron-banner');
  const presenceEl = $('arron-presence');
  const soundBtn = $('arron-sound');
  const tourBtn = $('arron-tour');
  const storyForm = $('arron-story-form');
  const storyField = $('arron-story');
  const moodLogEl = $('arron-mood-log');
  const memoryCodeEl = $('arron-memory-code');
  const copyCodeBtn = $('arron-copy-code');
  const restoreForm = $('arron-restore-form');
  const restoreField = $('arron-restore-code');
  const forgetBtn = $('arron-forget');
  const welcome = $('arron-welcome');

  const CHAT_API = '/api/arron/chat';
  const MEMORY_API = '/api/arron/memory';
  const HEALTH_API = '/api/arron/health';
  const KEYS = {
    id: 'arron_memory_id',
    messages: 'arron_messages',
    story: 'arron_user_story',
    forget: 'arron_forget_pending',
    name: 'arron_name',
    mood: 'arron_mood',
    moodLog: 'arron_mood_log',
    sound: 'arron_sound',
    onboarded: 'arron_onboarded',
    draft: 'arron_draft'
  };
  const REQUEST_TIMEOUT = 30000;
  const ID_PATTERN = /^[a-f0-9]{32,64}$/i;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── STORAGE — never let a full / blocked localStorage break the app ───
  const store = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} },
    json(key, fallback) {
      try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; } catch (e) { return fallback; }
    }
  };

  // ─── MOODS ───
  const MOODS = {
    calm:    { emoji: '😌', label: 'calm',
               prompts: ['Help me keep this calm', 'Give me a journaling prompt', 'Tell me something about Pleading Sanity'] },
    hopeful: { emoji: '✨', label: 'hopeful',
               prompts: ['I want to build on this', 'Help me set one small goal', 'I want to hope'] },
    tired:   { emoji: '🥱', label: 'tired',
               prompts: ['I feel drained', 'Help me wind down for sleep', 'I need to breathe'] },
    low:     { emoji: '🌧️', label: 'low',
               prompts: ['I feel low today', 'Remind me why I matter', 'I want to hope'] },
    anxious: { emoji: '😮‍💨', label: 'anxious',
               prompts: ['I feel overwhelmed', 'I need to breathe', 'Ground me right now'] },
    lonely:  { emoji: '🫂', label: 'lonely',
               prompts: ['I feel alone', 'Can you just talk with me?', 'How do I reach out to someone?'] },
    angry:   { emoji: '🔥', label: 'angry',
               prompts: ['I need to vent', 'Help me cool down', 'I feel overwhelmed'] },
    crisis:  { emoji: '🆘', label: 'in need of support', prompts: [] }
  };

  // Gentle next steps from around the site, matched to mood
  const SUGGESTIONS = {
    anxious: ['Try a slow breathing session', '/meditation.html', 'Breathe with me'],
    tired:   ['Soft healing tones can help you rest', '/frequencies.html', 'Healing Hz'],
    low:     ['Positive-only stories, no doom loops', '/sanityhub.html', 'Sanity Hub'],
    lonely:  ['Other people rising, just like you', '/community-dashboard.html', 'Community'],
    angry:   ['Put it on the page, privately', '/journal-vault.html', 'Journal Vault'],
    hopeful: ['Keep the spark going', '/quote-wall.html', 'Quote Wall']
  };

  const MOOD_WORDS = [
    ['crisis',  /suicid|kill myself|end it all|want to die|wanna die|self[- ]?harm|hurt myself|overdose|no reason to live|can'?t go on|better off without me/i],
    ['anxious', /anxi|panic|overwhelm|stress|worr|nervous|scared|afraid|can'?t breathe|racing|on edge|freaking out/i],
    ['lonely',  /alone|lonely|lonel|no one|nobody|isolat|left out|no friends|miss (him|her|them)/i],
    ['angry',   /angry|anger|furious|rage|pissed|hate|mad at|fed up|frustrat|annoyed/i],
    ['low',     /sad|down|depress|low|empty|hopeless|numb|cry|crying|worthless|grief|broken|hurting/i],
    ['tired',   /tired|exhaust|drained|sleep|burn(ed|t)? ?out|knackered|shattered|no energy|fatigue/i],
    ['hopeful', /hope|better today|grateful|proud|excited|progress|good day|happy|thankful/i],
    ['calm',    /calm|peace|relaxed|chill|content|okay today|fine today/i]
  ];

  function detectMood(text) {
    for (const [mood, pattern] of MOOD_WORDS) if (pattern.test(text)) return mood;
    return null;
  }

  // ─── OFFLINE REPLIES — Arron still answers without a connection ───
  const CRISIS_REPLY = "I'm really glad you told me. You matter, and you deserve support right now from a real person. Please call Samaritans free on 116 123 (24/7), text SHOUT to 85258, or call 999 if you're in immediate danger. Are you safe right now? 💙";
  const OFFLINE = {
    anxious: [
      "That weight... you don't have to carry it all at once. Breathe with me: in for four, hold for four, out for six. You're doing enough just by being here.",
      "Overwhelm is loud, but it passes. Name five things you can see right now. I'm right here while you do."
    ],
    low: [
      "I hear you. Low days are real, and you don't have to fix this one. Just getting through it counts. 💙",
      "Hope doesn't have to be loud. It can be quiet and stubborn, like a star that keeps shining in a dark sky. That's you."
    ],
    lonely: [
      "I'm right here. So are so many others who understand. You're not invisible, and you matter deeply.",
      "Loneliness can feel like a wall. But walls can have doors, and I'll wait on the other side with you."
    ],
    angry: [
      "That anger makes sense. It's telling you something matters. Let it out here; I can take it.",
      "Fire needs somewhere to go. Want to tell me exactly what happened? No filters."
    ],
    tired: [
      "Rest isn't weakness, it's repair. Could you give yourself permission to do less today?",
      "Being drained is your body asking for care. A glass of water and three slow breaths is a real start."
    ],
    hopeful: [
      "I love hearing that. Hold onto this feeling; you earned it. What helped today?",
      "That spark is real. Evolution, not erasure: you're growing from everything you've been through."
    ],
    calm: [
      "That's lovely to hear. Calm moments are worth noticing. What's helping you feel settled?",
      "Let's enjoy this steady space together. Anything you'd like to explore while it's quiet?"
    ],
    breathe: [
      "Let's do that together. In... slowly... and out. Again. You're safe. You're here. This moment is yours.",
      "Breathing is your body remembering how to hold you. Take three slow ones. I'll wait."
    ],
    default: [
      "Thank you for trusting me with this. Whatever it is, it's safe here. Take your time.",
      "I hear you. Just being heard can lighten the load a little. I'm glad you spoke.",
      "That takes courage. Being real with yourself is the bravest thing there is."
    ]
  };
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function offlineResponse(text) {
    const mood = detectMood(text);
    if (mood === 'crisis') return CRISIS_REPLY;
    if (/breath/i.test(text)) return pick(OFFLINE.breathe);
    return pick(OFFLINE[mood] || OFFLINE[currentMood] || OFFLINE.default);
  }

  // ─── STATE — persisted so Arron picks up where you left off ───
  function newMemoryId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  let memoryId = store.get(KEYS.id);
  if (!memoryId || !ID_PATTERN.test(memoryId)) {
    memoryId = newMemoryId();
    store.set(KEYS.id, memoryId);
  }
  let messages = [];
  let userName = store.get(KEYS.name, '');
  let currentMood = MOODS[store.get(KEYS.mood)] ? store.get(KEYS.mood) : null;
  let soundOn = store.get(KEYS.sound) === 'on';

  const greeting = () => userName
    ? `Hey ${userName}, it's Arron. 💙 However you're feeling right now, it's welcome here. What's on your mind?`
    : "Hey, I'm Arron. 💙 However you're feeling right now, it's welcome here. What's on your mind?";

  // ─── RENDERING ───
  function bubble(text, role, opts = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role === 'assistant' ? 'arron-message' : 'user-message'}`;
    if (opts.fallback) wrapper.classList.add('is-fallback');
    const p = document.createElement('p');
    p.textContent = text;
    wrapper.appendChild(p);
    if (opts.fallback) {
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = 'Offline reply';
      wrapper.appendChild(meta);
    }
    return wrapper;
  }

  function scrollToLatest(smooth) {
    conversationBox.scrollTo({ top: conversationBox.scrollHeight, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  }

  function render() {
    conversationBox.innerHTML = '';
    conversationBox.appendChild(bubble(greeting(), 'assistant'));
    messages.forEach((m) => conversationBox.appendChild(bubble(m.content, m.role, { fallback: m.fallback })));
    scrollToLatest(false);
  }

  function cacheMessages() {
    store.set(KEYS.messages, JSON.stringify(messages.slice(-60)));
  }

  function addMessage(text, role, opts = {}) {
    const entry = { role, content: text };
    if (opts.fallback) entry.fallback = true;
    messages.push(entry);
    conversationBox.appendChild(bubble(text, role, opts));
    scrollToLatest(true);
    cacheMessages();
  }

  function addSuggestion(mood) {
    const box = document.createElement('div');
    if (mood === 'crisis') {
      box.className = 'arron-suggest crisis';
      box.innerHTML = '🆘 Real people, right now: <a href="tel:116123">Call Samaritans 116 123</a> · <a href="sms:85258?body=SHOUT">Text SHOUT 85258</a> · <a href="tel:999">999</a>';
    } else if (SUGGESTIONS[mood]) {
      const [text, href, label] = SUGGESTIONS[mood];
      box.className = 'arron-suggest';
      box.append(`💡 ${text}: `);
      const a = document.createElement('a');
      a.href = href;
      a.textContent = `${label} →`;
      box.appendChild(a);
    } else return;
    conversationBox.appendChild(box);
    scrollToLatest(true);
  }

  function setStatus(text) { statusEl.textContent = text; }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'message arron-message typing';
    el.innerHTML = '<span class="typing-dots" aria-hidden="true"><span></span><span></span><span></span></span><span class="sr-only">Arron is typing…</span>';
    conversationBox.appendChild(el);
    mainPanel.classList.add('is-thinking');
    presenceEl.textContent = 'Arron is typing…';
    scrollToLatest(true);
    return el;
  }

  function hideTyping(el) {
    el.remove();
    mainPanel.classList.remove('is-thinking');
    updatePresence();
  }

  // ─── MOOD UI ───
  function renderPrompts() {
    const list = (currentMood && MOODS[currentMood].prompts.length)
      ? MOODS[currentMood].prompts
      : ['I feel overwhelmed', 'I need to breathe', 'I feel alone', 'I want to hope'];
    promptsBox.innerHTML = '';
    list.forEach((text) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prompt-btn';
      btn.dataset.prompt = text;
      btn.textContent = text;
      promptsBox.appendChild(btn);
    });
  }

  function renderMoodLog() {
    const log = store.json(KEYS.moodLog, []);
    moodLogEl.textContent = log.length ? log.map((e) => MOODS[e.mood]?.emoji || '').join(' ') : 'No check-ins yet.';
    moodLogEl.title = log.map((e) => `${new Date(e.at).toLocaleDateString('en-GB')} · ${MOODS[e.mood]?.label}`).join('\n');
  }

  function setMood(mood, source) {
    if (mood && !MOODS[mood]) return;
    const changed = mood !== currentMood;
    currentMood = mood;
    if (mood) store.set(KEYS.mood, mood); else store.remove(KEYS.mood);
    document.querySelectorAll('.mood-chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.mood === mood));
    });
    if (mood && changed) {
      const log = store.json(KEYS.moodLog, []);
      log.push({ mood, at: Date.now(), source });
      store.set(KEYS.moodLog, JSON.stringify(log.slice(-30)));
    }
    renderPrompts();
    renderMoodLog();
  }

  // ─── SOUND — a soft two-note chime, made on the fly (no audio files) ───
  let audioCtx = null;
  function chime() {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [[659.25, 0], [987.77, 0.12]].forEach(([freq, delay]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.9);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 1);
      });
    } catch (e) {}
  }

  function renderSound() {
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? '🔔' : '🔕';
    soundBtn.title = soundOn ? 'Reply chime on' : 'Reply chime off';
  }

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    store.set(KEYS.sound, soundOn ? 'on' : 'off');
    renderSound();
    chime();
  });

  // ─── NETWORK ───
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || REQUEST_TIMEOUT);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function memoryRequest(method, payload, id = memoryId) {
    const res = await request(MEMORY_API, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryId: id, ...payload })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // ─── CONNECTION + AUTO-RECONNECT ───
  // online → reconnecting (backing off, pinging /health) → online again
  let conn = 'online';
  let retryTimer = null;
  let retryDelay = 2000;

  function updatePresence() {
    presenceEl.textContent = {
      online: 'Your companion · here with you',
      reconnecting: 'Reconnecting…',
      offline: 'Offline · still here with simpler replies'
    }[conn];
  }

  function setConn(state) {
    if (state === conn) return;
    const wasDown = conn !== 'online';
    conn = state;
    app.dataset.conn = state;
    updatePresence();
    if (state === 'online') {
      bannerEl.hidden = true;
      clearTimeout(retryTimer);
      retryDelay = 2000;
      if (wasDown) {
        setStatus('Reconnected. Arron is back and remembers. 💙');
        retryPendingForgets().catch(() => {});
        pushLocalStory();
      }
    } else {
      bannerEl.hidden = false;
      bannerEl.className = `arron-banner ${state}`;
      bannerEl.textContent = state === 'offline'
        ? "📴 You're offline. Arron still answers with simpler replies, and crisis numbers work without internet."
        : '🔄 Arron lost connection. Reconnecting automatically…';
      if (state === 'reconnecting') scheduleReconnect();
    }
  }

  function scheduleReconnect() {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(async () => {
      if (navigator.onLine === false) { setConn('offline'); return; }
      try {
        const res = await request(HEALTH_API, { cache: 'no-store', timeout: 8000 });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setConn('online');
        syncFromServer().catch(() => {});
      } catch (e) {
        retryDelay = Math.min(retryDelay * 2, 30000);
        scheduleReconnect();
      }
    }, retryDelay);
  }

  window.addEventListener('offline', () => setConn('offline'));
  window.addEventListener('online', () => { retryDelay = 1000; setConn('reconnecting'); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && conn !== 'online' && navigator.onLine !== false) {
      retryDelay = 500;
      scheduleReconnect();
    }
  });

  // ─── SERVER MEMORY ───
  function pushLocalStory() {
    const local = storyField.value.trim();
    if (local && store.get('arron_story_unsynced') === '1') {
      memoryRequest('PUT', { story: storyField.value })
        .then(() => store.remove('arron_story_unsynced'))
        .catch(() => {});
    }
  }

  async function syncFromServer() {
    const res = await request(`${MEMORY_API}?id=${encodeURIComponent(memoryId)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const remembered = Array.isArray(data.messages) ? data.messages : [];
    if (remembered.length || !messages.length) {
      messages = remembered.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      cacheMessages();
      render();
    }
    if (data.story && store.get('arron_story_unsynced') !== '1') {
      storyField.value = data.story;
      store.set(KEYS.story, data.story);
    } else if (storyField.value.trim()) {
      // Story written on this device while Arron couldn't reach the server — carry it over
      store.set('arron_story_unsynced', '1');
      pushLocalStory();
    }
    return data;
  }

  // ─── CHAT ───
  let busy = false;

  async function handleInput(raw) {
    const text = (raw || '').trim();
    if (!text || busy) return;
    busy = true;
    sendButton.disabled = true;
    inputField.value = '';
    autosize();
    try { sessionStorage.removeItem(KEYS.draft); } catch (e) {}

    const detected = detectMood(text);
    if (detected) setMood(detected, 'detected');

    addMessage(text, 'user');
    const typing = showTyping();

    let reply = null;
    let fallback = false;
    try {
      if (navigator.onLine === false) throw new Error('offline');
      const res = await request(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, memoryId, name: userName || undefined, mood: currentMood || undefined })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.reply) throw new Error('Empty reply');
      reply = data.reply;
      setConn('online');
      setStatus(data.remembered === false
        ? "Arron replied, but couldn't save this to your memory just now."
        : 'Saved to your memory. 💙');
    } catch (e) {
      // Crisis words always get real UK support numbers, online or not
      reply = offlineResponse(text);
      fallback = true;
      setConn(navigator.onLine === false ? 'offline' : 'reconnecting');
      setStatus('This reply came from Arron offline, so it isn\'t saved to your memory.');
    }

    // A breath of pause feels more human than an instant canned reply
    if (fallback && !reduceMotion) await new Promise((r) => setTimeout(r, 700));
    hideTyping(typing);
    addMessage(reply, 'assistant', { fallback });
    if (detected === 'crisis' || (detected && detected !== 'calm')) addSuggestion(detected);
    chime();

    busy = false;
    sendButton.disabled = false;
    inputField.focus();
  }

  // ─── COMPOSER ───
  function autosize() {
    inputField.style.height = 'auto';
    inputField.style.height = `${Math.min(inputField.scrollHeight, 160)}px`;
  }

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleInput(inputField.value);
  });
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      handleInput(inputField.value);
    }
  });
  inputField.addEventListener('input', () => {
    autosize();
    try { sessionStorage.setItem(KEYS.draft, inputField.value); } catch (e) {}
  });
  promptsBox.addEventListener('click', (e) => {
    const btn = e.target.closest('.prompt-btn');
    if (btn) handleInput(btn.dataset.prompt);
  });
  document.querySelectorAll('.arron-moodbar .mood-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const mood = chip.dataset.mood === currentMood ? null : chip.dataset.mood;
      setMood(mood, 'check-in');
      if (mood) setStatus(`Thanks for checking in. Arron will keep in mind you're feeling ${MOODS[mood].label}. 💙`);
    });
  });

  // ─── YOUR STORY ───
  storyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = storyForm.querySelector('.form-note');
    store.set(KEYS.story, storyField.value);
    store.set('arron_story_unsynced', '1');
    note.textContent = 'Saving…';
    memoryRequest('PUT', { story: storyField.value })
      .then(() => {
        store.remove('arron_story_unsynced');
        note.textContent = 'Saved ✓ Arron will remember this on every visit. 💙';
      })
      .catch(() => { note.textContent = "Saved on this device. It'll sync to Arron's memory when he reconnects."; });
  });

  // ─── MEMORY CODE ───
  memoryCodeEl.textContent = memoryId;
  copyCodeBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(memoryId);
      copyCodeBtn.textContent = 'Copied ✓';
    } catch (e) {
      copyCodeBtn.textContent = 'Select the code above';
    }
    setTimeout(() => { copyCodeBtn.textContent = 'Copy code'; }, 2500);
  });

  restoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = restoreField.value.trim().replace(/\s+/g, '');
    if (!ID_PATTERN.test(code)) {
      restoreField.setCustomValidity('Code should be 32+ letters/numbers');
      restoreField.reportValidity();
      return;
    }
    restoreField.setCustomValidity('');
    memoryId = code;
    store.set(KEYS.id, code);
    store.remove('arron_story_unsynced');
    messages = [];
    storyField.value = '';
    cacheMessages();
    render();
    memoryCodeEl.textContent = memoryId;
    restoreField.value = '';
    setStatus('Restoring your memory…');
    syncFromServer()
      .then(() => setStatus('Memory restored. Welcome back. 💙'))
      .catch(() => setStatus("Code saved. Arron will load your memory once he's back online."));
  });

  // ─── FORGET ME — erase on the server, retry later if offline ───
  function pendingForgets() {
    const ids = store.json(KEYS.forget, []);
    return Array.isArray(ids) ? ids.filter((id) => ID_PATTERN.test(id)) : [];
  }

  function savePendingForgets(ids) {
    if (ids.length) store.set(KEYS.forget, JSON.stringify(ids));
    else store.remove(KEYS.forget);
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
    savePendingForgets(left);
  }

  forgetBtn.addEventListener('click', async () => {
    if (!confirm('Forget Me: erase everything Arron remembers (conversations, story, mood journey and name)? This cannot be undone.')) return;
    const oldId = memoryId;
    forgetBtn.disabled = true;
    setStatus('Erasing your memory…');
    let erased = false;
    try { await eraseOnServer(oldId); erased = true; }
    catch (e) { savePendingForgets([...pendingForgets(), oldId]); }
    forgetBtn.disabled = false;

    memoryId = newMemoryId();
    store.set(KEYS.id, memoryId);
    [KEYS.messages, KEYS.story, KEYS.name, KEYS.mood, KEYS.moodLog, 'arron_story_unsynced'].forEach(store.remove);
    try { sessionStorage.removeItem(KEYS.draft); } catch (e) {}
    messages = [];
    userName = '';
    storyField.value = '';
    setMood(null);
    render();
    memoryCodeEl.textContent = memoryId;
    setStatus(erased
      ? "Erased ✓ Arron's server memory is cleared. Fresh start, and he's still here. 💙"
      : "Erased on this device. The server couldn't be reached, so it'll be wiped automatically next time you're online.");
  });

  // ─── WELCOME / ONBOARDING ───
  function openWelcome() {
    if (!welcome || typeof welcome.showModal !== 'function') return;
    const steps = welcome.querySelectorAll('.step');
    const dots = welcome.querySelectorAll('.dots span');
    const nameField = $('welcome-name');
    let step = 0;
    const show = (n) => {
      step = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach((s, i) => { s.hidden = i !== step; });
      dots.forEach((d, i) => d.classList.toggle('on', i === step));
      const focusable = steps[step].querySelector('input, [data-next], button[type="submit"]');
      if (focusable) focusable.focus();
    };
    nameField.value = userName;
    welcome.querySelectorAll('.mood-grid .mood-chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.mood === currentMood));
    });
    welcome.onclick = (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      if (target.hasAttribute('data-next')) show(step + 1);
      else if (target.hasAttribute('data-back')) show(step - 1);
      else if (target.dataset.mood) setMood(target.dataset.mood, 'check-in');
    };
    nameField.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); show(step + 1); } };
    welcome.onclose = () => {
      userName = nameField.value.replace(/[^\p{L}\p{N} '\-]/gu, '').trim().slice(0, 40);
      if (userName) store.set(KEYS.name, userName); else store.remove(KEYS.name);
      store.set(KEYS.onboarded, '1');
      render();
      inputField.focus();
    };
    show(0);
    welcome.showModal();
  }
  tourBtn.addEventListener('click', openWelcome);

  // ─── INIT ───
  messages = store.json(KEYS.messages, []);
  if (!Array.isArray(messages)) messages = [];
  messages = messages.filter((m) => m && typeof m.content === 'string');
  storyField.value = store.get(KEYS.story, '');
  try { inputField.value = sessionStorage.getItem(KEYS.draft) || ''; } catch (e) {}
  autosize();
  render();
  renderSound();
  setMood(currentMood);
  updatePresence();
  if (navigator.onLine === false) setConn('offline');

  if (!store.get(KEYS.onboarded)) openWelcome();

  setStatus('Loading your conversation…');
  retryPendingForgets().catch(() => {});
  syncFromServer()
    .then(() => {
      setConn('online');
      setStatus(messages.length ? 'Welcome back. Arron remembers your conversation. 💙' : 'Ready. Say hello. 💙');
    })
    .catch(() => {
      setConn(navigator.onLine === false ? 'offline' : 'reconnecting');
      setStatus(messages.length ? 'Showing your saved conversation from this device.' : 'Ready. Say hello. 💙');
    });

  window.ArronCompanion = { handleInput, offlineResponse, detectMood };
})();
