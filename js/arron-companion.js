(function() {
  'use strict';

  const conversationBox = document.getElementById('arron-conversation');
  const inputForm = document.getElementById('arron-input-form');
  const inputField = document.getElementById('arron-input');
  const sendButton = inputForm?.querySelector('button[type="submit"]');
  const promptButtons = document.querySelectorAll('.prompt-btn');
  const statusEl = document.getElementById('arron-status');
  const storyForm = document.getElementById('arron-story-form');
  const storyField = document.getElementById('arron-story');
  const memoryCodeEl = document.getElementById('arron-memory-code');
  const copyCodeBtn = document.getElementById('arron-copy-code');
  const restoreForm = document.getElementById('arron-restore-form');
  const restoreField = document.getElementById('arron-restore-code');
  const forgetBtn = document.getElementById('arron-forget');

  if (!conversationBox) return;

  // Served by netlify/functions/arron.mts (memory lives in Netlify Database)
  const CHAT_API = '/api/arron/chat';
  const MEMORY_API = '/api/arron/memory';
  const ID_KEY = 'arron_memory_id';
  const CACHE_KEY = 'arron_messages';
  const STORY_KEY = 'arron_user_story';
  const FORGET_KEY = 'arron_forget_pending';
  const REQUEST_TIMEOUT = 30000;
  const GREETING = "Hey, I'm Arron. 💙 However you're feeling right now, it's welcome here. What's on your mind?";

  // ─── OFFLINE FALLBACK — WORKS WITHOUT SERVER ───
  const gentleResponses = {
    'I feel overwhelmed': [
      "That weight... I can feel how heavy it is. You don't have to carry it all at once. Just breathe with me — one breath at a time. You're doing enough just showing up.",
      "Overwhelm can feel like noise that won't quiet down. But you're here. That takes so much strength. Rest as much as you need — progress doesn't have to be fast to be real."
    ],
    'I need to breathe': [
      "Let's do that together. In... slowly... and out. Again. You're safe. You're here. This moment is yours.",
      "Breathing is your body remembering how to hold you. Take 3 slow ones — I'll wait. There's nowhere else you need to be right now."
    ],
    'I feel alone': [
      "I hear that. And I want you to know — I'm right here. So are so many others who understand. You're not invisible. You matter deeply.",
      "Loneliness can feel like a wall. But walls can have doors. I'm on the other side waiting to walk through with you. You belong here."
    ],
    'I want to hope': [
      "Hope is brave. Especially when it feels far away. But the fact you're still here reading this? That IS hope — alive inside you.",
      "Hope doesn't have to be loud. It can be quiet, steady, stubborn. Like a star that keeps shining even when the sky is dark. That's you."
    ],
    default: [
      "Thank you for trusting me with this. Whatever it is — it's safe here. Take your time.",
      "I hear you. And just being heard can sometimes lighten the load a little. I'm glad you spoke.",
      "That takes courage. Being real with yourself is the bravest thing there is."
    ]
  };

  const CRISIS_WORDS = /suicid|kill myself|end it all|want to die|self[- ]?harm|hurt myself|overdose|no reason to live/i;
  const CRISIS_REPLY = "I'm really glad you told me. You matter, and you deserve support right now from a real person. Please call Samaritans free on 116 123 (24/7), text SHOUT to 85258, or call 999 if you're in immediate danger. Are you safe right now? 💙";

  function offlineResponse(userText) {
    const trimmed = userText.trim().toLowerCase();
    if (CRISIS_WORDS.test(trimmed)) return CRISIS_REPLY;
    for (const [prompt, replies] of Object.entries(gentleResponses)) {
      const p = prompt.toLowerCase();
      if (trimmed.includes(p) || p.includes(trimmed)) {
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }
    return gentleResponses.default[Math.floor(Math.random() * gentleResponses.default.length)];
  }

  // ─── MEMORY CODE — PRIVATE, ON-DEVICE ───
  function newMemoryId() {
    if (window.crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  function getMemoryId() {
    let id = null;
    try { id = localStorage.getItem(ID_KEY); } catch (e) {}
    if (!id || !/^[a-f0-9]{32,64}$/i.test(id)) {
      id = newMemoryId();
      try { localStorage.setItem(ID_KEY, id); } catch (e) {}
    }
    return id;
  }

  let memoryId = getMemoryId();
  let messages = [];

  // ─── RENDERING ───
  function bubble(text, role) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role === 'assistant' ? 'arron-message' : 'user-message'}`;
    const p = document.createElement('p');
    p.textContent = text;
    wrapper.appendChild(p);
    return wrapper;
  }

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollToLatest(smooth) {
    conversationBox.scrollTo({
      top: conversationBox.scrollHeight,
      behavior: smooth && !reduceMotion ? 'smooth' : 'auto'
    });
  }

  function render() {
    conversationBox.innerHTML = '';
    conversationBox.appendChild(bubble(GREETING, 'assistant'));
    messages.forEach(m => conversationBox.appendChild(bubble(m.content, m.role)));
    scrollToLatest(false);
  }

  function addMessage(text, role) {
    messages.push({ role, content: text });
    conversationBox.appendChild(bubble(text, role));
    scrollToLatest(true);
    cacheMessages();
  }

  function cacheMessages() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(messages.slice(-60))); } catch (e) {}
  }

  function loadCachedMessages() {
    try {
      const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      if (Array.isArray(saved)) messages = saved.filter(m => m && typeof m.content === 'string');
      if (storyField) storyField.value = localStorage.getItem(STORY_KEY) || '';
    } catch (e) { messages = []; }
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  // Three soft dots while Arron writes — feels alive, reads as "typing" to screen readers
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'message arron-message typing';
    el.setAttribute('aria-label', 'Arron is typing');
    el.innerHTML = '<span class="typing-dots" aria-hidden="true"><span></span><span></span><span></span></span><span class="sr-only">Arron is typing…</span>';
    conversationBox.appendChild(el);
    scrollToLatest(true);
    return el;
  }

  // fetch with a timeout, so a slow network falls back instead of hanging
  async function request(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── SERVER MEMORY ───
  async function memoryRequest(method, payload, id = memoryId) {
    const res = await request(MEMORY_API, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryId: id, ...payload })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Pull the conversation + story Arron remembers for this code
  async function syncFromServer() {
    const res = await request(`${MEMORY_API}?id=${encodeURIComponent(memoryId)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const remembered = Array.isArray(data.messages) ? data.messages : [];
    if (remembered.length || !messages.length) {
      messages = remembered.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      cacheMessages();
      render();
    }
    if (data.story && storyField) {
      storyField.value = data.story;
      try { localStorage.setItem(STORY_KEY, data.story); } catch (e) {}
    } else if (!data.story && storyField && storyField.value.trim()) {
      // Story saved on this device before server memory existed — carry it over
      memoryRequest('PUT', { story: storyField.value }).catch(() => {});
    }
    return data;
  }

  // ─── CHAT HANDLER ───
  let busy = false;

  async function handleInput(text) {
    if (!text || !text.trim() || busy) return;
    busy = true;
    if (sendButton) sendButton.disabled = true;
    inputField.value = '';
    addMessage(text.trim(), 'user');
    const typing = showTyping();

    let reply;
    try {
      if (navigator.onLine === false) throw new Error('offline');
      const res = await request(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), memoryId })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.reply) throw new Error('Empty reply');
      reply = data.reply;
      setStatus(data.remembered === false
        ? "Arron replied, but couldn't save this message to your memory just now."
        : 'Connected — Arron is here and remembers. 💙');
    } catch (e) {
      // Crisis words always get real UK support numbers, online or not
      reply = offlineResponse(text);
      setStatus(navigator.onLine === false
        ? "You're offline — Arron is still here with simpler replies."
        : "Arron's connection is resting — simpler replies for now. Try again in a moment.");
    }

    typing.remove();
    addMessage(reply, 'assistant');
    busy = false;
    if (sendButton) sendButton.disabled = false;
    inputField.focus();
  }

  // ─── EVENTS ───
  if (inputForm) {
    inputForm.addEventListener('submit', e => {
      e.preventDefault();
      handleInput(inputField.value);
    });
  }

  promptButtons.forEach(btn => {
    btn.addEventListener('click', () => handleInput(btn.dataset.prompt));
  });

  if (storyForm) {
    storyForm.addEventListener('submit', e => {
      e.preventDefault();
      const note = storyForm.querySelector('.form-note');
      try { localStorage.setItem(STORY_KEY, storyField.value); } catch (err) {}
      if (note) note.textContent = 'Saving…';
      memoryRequest('PUT', { story: storyField.value })
        .then(() => { if (note) note.textContent = 'Saved to your memory ✓ Arron will remember this, on every visit. 💙'; })
        .catch(() => { if (note) note.textContent = "Saved on this device — it'll sync to Arron's memory next time you're online."; });
    });
  }

  if (copyCodeBtn && memoryCodeEl) {
    memoryCodeEl.textContent = memoryId;
    copyCodeBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(memoryId);
        copyCodeBtn.textContent = 'Copied ✓';
      } catch (e) {
        copyCodeBtn.textContent = 'Copy below';
      }
      setTimeout(() => { copyCodeBtn.textContent = 'Copy code'; }, 2500);
    });
  }

  if (restoreForm) {
    restoreForm.addEventListener('submit', e => {
      e.preventDefault();
      const code = restoreField.value.trim().replace(/\s+/g, '');
      if (!/^[a-f0-9]{32,64}$/i.test(code)) {
        restoreField.setCustomValidity('Code should be 32+ letters/numbers');
        restoreField.reportValidity();
        return;
      }
      restoreField.setCustomValidity('');
      memoryId = code;
      try { localStorage.setItem(ID_KEY, code); } catch (err) {}
      messages = [];
      cacheMessages();
      render();
      if (memoryCodeEl) memoryCodeEl.textContent = memoryId;
      restoreField.value = '';
      setStatus('Restoring your memory…');
      syncFromServer()
        .then(() => setStatus('Memory restored. Welcome back. 💙'))
        .catch(() => setStatus("Code saved — Arron will remember once he's back online."));
    });
  }

  // ─── FORGET ME — erase on the server, and retry later if offline ───
  function pendingForgets() {
    try { return JSON.parse(localStorage.getItem(FORGET_KEY) || '[]').filter(id => /^[a-f0-9]{32,64}$/i.test(id)); }
    catch (e) { return []; }
  }

  function savePendingForgets(ids) {
    try {
      if (ids.length) localStorage.setItem(FORGET_KEY, JSON.stringify(ids));
      else localStorage.removeItem(FORGET_KEY);
    } catch (e) {}
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
    return left.length === 0;
  }

  if (forgetBtn) {
    forgetBtn.addEventListener('click', async () => {
      if (!confirm('Erase everything Arron remembers? This cannot be undone.')) return;
      const oldId = memoryId;
      forgetBtn.disabled = true;
      setStatus('Erasing your memory…');
      let erased = false;
      try { await eraseOnServer(oldId); erased = true; }
      catch (e) { savePendingForgets([...pendingForgets(), oldId]); }
      forgetBtn.disabled = false;
      memoryId = newMemoryId();
      try {
        localStorage.setItem(ID_KEY, memoryId);
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(STORY_KEY);
      } catch (e) {}
      messages = [];
      if (storyField) storyField.value = '';
      render();
      if (memoryCodeEl) memoryCodeEl.textContent = memoryId;
      setStatus(erased
        ? 'Erased ✓ Arron\'s server memory is cleared. Fresh start — he\'s still here. 💙'
        : "Erased on this device. The server couldn't be reached, so it'll be wiped automatically next time you're online.");
    });
  }

  // ─── INIT ───
  loadCachedMessages();
  render();
  if (memoryCodeEl) memoryCodeEl.textContent = memoryId;
  setStatus('Loading your conversation…');
  retryPendingForgets().catch(() => {});
  syncFromServer()
    .then(() => setStatus(messages.length
      ? 'Welcome back. Arron remembers your conversation. 💙'
      : 'Ready — say hello. 💙'))
    .catch(() => setStatus(navigator.onLine === false
      ? "You're offline — Arron is still here with simpler replies."
      : 'Ready — say hello. 💙'));

  window.ArronCompanion = { handleInput, offlineResponse };
})();
