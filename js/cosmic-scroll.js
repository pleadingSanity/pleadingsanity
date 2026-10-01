// ==============================================================
// 🌌 COSMIC SCROLL — full-screen, swipe-up "For You" stream
// Any element with [data-cosmic-scroll] becomes a TikTok-style
// snap feed: community posts, survivor videos, affirmations and
// breathing moments, loading forever as you swipe.
//   data-sources="posts,videos"   which live sources to mix in
//   data-label="For You"          accessible name for the stream
// Kind by design: a breathing card every few swipes and a gentle
// "breathe with me" pause card every ten. No tracking, ever.
// ==============================================================

import { api, esc, avatarText, loadMe, toast } from '/js/auth.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAX_CARDS = 36; // older cards are recycled so long sessions stay light
const PREFETCH_AT = 4; // start loading when this many cards are left
const BREAK_EVERY = 10;
const SAVED_KEY = 'ps-saved';
// Small snapshots of saved cards so the profile page can list them.
const SAVED_ITEMS = 'ps-saved-items';
const LOCAL_LIKES = 'ps-local-likes';

const AFFIRMATIONS = [
  ['You survived 100% of your worst days.', 'That record is unbeaten.'],
  ['Healing isn\'t linear.', 'It\'s a spiral that keeps rising.'],
  ['Evolution, Not Erasure.', 'Your scars are proof you kept going.'],
  ['Rest is not quitting.', 'Even stars need the night.'],
  ['You are not too much.', 'You are exactly enough, turned up loud.'],
  ['Small wins count.', 'Drank water? Legend. Got up? Hero.'],
  ['Your brain is not broken.', 'It\'s been working overtime to protect you.'],
  ['One Source. One Family.', 'Nobody rises alone here.'],
  ['Madness into meaning.', 'Pain into power. You\'re already doing it.'],
  ['Be gentle with yourself today.', 'You\'re speaking to someone you love.'],
  ['Feelings are visitors.', 'Let them come, let them go. You\'re the house.'],
  ['The dark taught you to see stars.', 'Keep looking up.'],
  ['Progress, not perfection.', 'Wobbly steps still move you forward.'],
  ['You\'re allowed to take up space.', 'The universe made room for you.'],
];

const TIPS = [
  ['🧊 Grounding trick', 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.'],
  ['💧 Tiny reset', 'Drink a glass of water, roll your shoulders, unclench your jaw. Yes, that jaw.'],
  ['📖 Write it out', 'Two lines in the Journal Vault can shrink a storm to a drizzle.', '/journal-vault.html', 'Open Journal'],
  ['🎵 Sound bath', '528Hz and a deep breath. Headphones on, world off.', '/frequencies.html', 'Play Hz'],
  ['🧠 Brain snack', 'Two minutes of a calm game resets a racing head.', '/games.html', 'Play a game'],
  ['💙 Talk it through', 'Arron is here at 3am, no judgement, no account needed.', '/arron.html', 'Talk to Arron'],
];

const GRADIENTS = [
  ['#1a0b3d', '#0d1b2a'], ['#001f2e', '#1a0033'], ['#0d1b2a', '#2a0033'],
  ['#00262b', '#0d0b2a'], ['#1d0030', '#001a24'], ['#0a1030', '#2b0026'],
];

const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const writeJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const shuffle = (list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── SOURCES — each returns a page of items, or [] when exhausted ───
function postSource() {
  let before = null;
  let done = false;
  return async () => {
    if (done) return [];
    try {
      const params = new URLSearchParams({ public: '1' });
      if (before) params.set('before', before);
      const data = await api('/api/posts?' + params);
      before = data.nextBefore;
      if (!before) done = true;
      return (data.posts || []).filter((p) => !p.contentWarning).map((p) => ({ type: 'post', key: 'p' + p.id, post: p }));
    } catch {
      done = true;
      return [];
    }
  };
}

function videoSource() {
  let token = null;
  let done = false;
  const seen = new Set();
  return async () => {
    if (done) return [];
    try {
      const params = new URLSearchParams();
      if (token) params.set('pageToken', token);
      const res = await fetch('/api/fetchVideos?' + params);
      const data = await res.json();
      token = data.nextPageToken || null;
      if (!token) done = true;
      return (data.items || data.videos || [])
        .filter((v) => v.videoId && !seen.has(v.videoId) && seen.add(v.videoId))
        .map((v) => ({ type: 'video', key: 'v' + v.videoId, video: v }));
    } catch {
      done = true;
      return [];
    }
  };
}

// Endless gentle filler: affirmations and tips, reshuffled every lap.
function calmSource() {
  let lap = 0;
  return () => {
    lap++;
    const items = [
      ...shuffle(AFFIRMATIONS).map(([a, b], i) => ({ type: 'quote', key: `q${lap}-${i}`, title: a, sub: b })),
      ...shuffle(TIPS).map(([a, b, href, cta], i) => ({ type: 'tip', key: `t${lap}-${i}`, title: a, sub: b, href, cta })),
    ];
    return Promise.resolve(shuffle(items));
  };
}

function snapshot(item = {}) {
  const at = Date.now();
  if (item.type === 'post') return { type: 'post', title: item.post.title || item.post.body.slice(0, 90), href: `/feed.html?post=${item.post.id}#community`, at };
  if (item.type === 'video') return { type: 'video', title: item.video.title, href: `https://www.youtube.com/watch?v=${encodeURIComponent(item.video.videoId)}`, at };
  return { type: item.type || 'quote', title: item.title || '', sub: item.sub || '', href: item.href || '', at };
}

// ─── CARDS ───
function actionRail(item) {
  const saved = readJSON(SAVED_KEY, []).includes(item.key);
  const liked = item.type === 'post' ? item.post.liked : readJSON(LOCAL_LIKES, []).includes(item.key);
  const likes = ''; // hearts are private — no counts, no popularity contests
  const comment = item.type === 'post'
    ? `<a class="cs-act" href="/feed.html?post=${item.post.id}#community" aria-label="Comments (${item.post.comments})"><span aria-hidden="true">💬</span><small>${item.post.comments || ''}</small></a>`
    : '';
  return `
    <div class="cs-rail">
      <button type="button" class="cs-act" data-act="like" aria-pressed="${liked}" aria-label="Heart"><span aria-hidden="true">${liked ? '💗' : '🤍'}</span><small data-count>${likes || ''}</small></button>
      ${comment}
      <button type="button" class="cs-act" data-act="save" aria-pressed="${saved}" aria-label="Save"><span aria-hidden="true">${saved ? '⭐' : '☆'}</span></button>
      <button type="button" class="cs-act" data-act="share" aria-label="Share"><span aria-hidden="true">↗️</span></button>
    </div>`;
}

function cardBody(item, index) {
  switch (item.type) {
    case 'post': {
      const p = item.post;
      const name = p.author.displayName;
      const media = p.imageUrl
        ? `<img class="cs-media-img" src="${esc(p.imageUrl)}" alt="" loading="lazy" decoding="async" />`
        : p.videoId ? videoFrame(p.videoId, p.title || 'Community video') : '';
      return `
        ${media}
        <div class="cs-text">
          <p class="cs-kicker">💬 Community voice</p>
          ${p.title ? `<h3>${esc(p.title)}</h3>` : ''}
          <p class="cs-body">${esc(p.body).slice(0, 600)}</p>
          <a class="cs-author" href="/@${encodeURIComponent(p.author.username)}">
            <span class="cs-avatar" aria-hidden="true">${esc(avatarText(p.author.avatar, name))}</span>${esc(name)}
          </a>
        </div>`;
    }
    case 'video': {
      const v = item.video;
      return `
        ${videoFrame(v.videoId, v.title, v.thumbnail)}
        <div class="cs-text">
          <p class="cs-kicker">🎬 ${esc(v.channelTitle || 'Survivor stories')}</p>
          <h3>${esc(v.title)}</h3>
          ${v.description ? `<p class="cs-body">${esc(v.description.slice(0, 200))}</p>` : ''}
        </div>`;
    }
    case 'quote':
      return `<div class="cs-center"><p class="cs-big">${esc(item.title)}</p><p class="cs-sub">${esc(item.sub)}</p></div>`;
    case 'tip':
      return `<div class="cs-center"><p class="cs-kicker">${esc(item.title)}</p><p class="cs-big sm">${esc(item.sub)}</p>
        ${item.href ? `<a class="cs-cta" href="${item.href}">${esc(item.cta)} →</a>` : ''}</div>`;
    case 'breathe':
      return `<div class="cs-center"><div class="cs-breath" aria-hidden="true"></div>
        <p class="cs-big sm">Breathe with the circle</p><p class="cs-sub">In as it grows · out as it shrinks. Three rounds. You've got this.</p></div>`;
    case 'break':
      return `<div class="cs-center"><div class="cs-breath" aria-hidden="true"></div>
        <p class="cs-big">You've been scrolling a while — breathe with me 💙</p>
        <p class="cs-sub">In as the circle grows · out as it shrinks. Then maybe stretch, sip some water, or look out a window. The cosmos will still be here.</p>
        <div class="cs-row"><a class="cs-cta" href="/meditation.html">🧘 Two quiet minutes</a><a class="cs-cta ghost" href="/crisis.html">Need to talk? Get help</a></div></div>`;
    default:
      return `<p>${index}</p>`;
  }
}

function videoFrame(id, title, thumb) {
  const src = thumb || `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  return `
    <button type="button" class="cs-video" data-video="${esc(id)}" aria-label="Play video: ${esc(title)}">
      <img src="${esc(src)}" alt="" loading="lazy" decoding="async" />
      <span class="cs-play" aria-hidden="true">▶</span>
    </button>`;
}

// ─── THE STREAM ───
class CosmicScroll {
  constructor(root) {
    this.root = root;
    const wanted = (root.dataset.sources || 'posts,videos').split(',').map((s) => s.trim());
    this.sources = [];
    if (wanted.includes('posts')) this.sources.push({ next: postSource(), weight: 2 });
    if (wanted.includes('videos')) this.sources.push({ next: videoSource(), weight: 1 });
    this.calm = calmSource();
    this.queue = { live: [], calm: [] };
    this.count = 0;
    this.loading = false;
    this.seen = new Set();

    root.classList.add('cs-root');
    root.innerHTML = `
      <div class="cs-scroller" tabindex="0" role="feed" aria-label="${esc(root.dataset.label || 'For You')}" aria-busy="true"></div>
      <div class="cs-controls">
        <button type="button" class="cs-ctl" data-ctl="up" aria-label="Previous">▲</button>
        <button type="button" class="cs-ctl" data-ctl="down" aria-label="Next">▼</button>
        <button type="button" class="cs-ctl" data-ctl="full" aria-pressed="false" aria-label="Full screen">⛶</button>
      </div>
      <p class="sr-only" aria-live="polite" data-announce></p>`;
    this.scroller = root.querySelector('.cs-scroller');
    this.announce = root.querySelector('[data-announce]');

    this.observer = new IntersectionObserver((entries) => this.onVisible(entries), { root: this.scroller, threshold: 0.6 });
    this.bind();
    this.fill(6);
  }

  bind() {
    this.scroller.addEventListener('keydown', (e) => {
      const map = { ArrowDown: 1, j: 1, PageDown: 1, ' ': 1, ArrowUp: -1, k: -1, PageUp: -1 };
      if (map[e.key] && !e.target.closest('a, input, textarea')) {
        e.preventDefault();
        this.step(map[e.key]);
      }
    });
    this.root.querySelector('.cs-controls').addEventListener('click', (e) => {
      const ctl = e.target.closest('[data-ctl]')?.dataset.ctl;
      if (ctl === 'up') this.step(-1);
      if (ctl === 'down') this.step(1);
      if (ctl === 'full') this.toggleFull();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.root.classList.contains('cs-full')) this.toggleFull(false);
    });
    this.scroller.addEventListener('click', (e) => this.onClick(e));
    // Double-tap anywhere on a card to heart it
    let lastTap = 0;
    this.scroller.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse' || e.target.closest('button, a')) return;
      const now = Date.now();
      if (now - lastTap < 300) {
        const card = e.target.closest('.cs-card');
        if (card) this.like(card, true, e.clientX, e.clientY);
        lastTap = 0;
      } else lastTap = now;
    });
  }

  toggleFull(force) {
    const on = force ?? !this.root.classList.contains('cs-full');
    const current = this.currentCard();
    this.root.classList.toggle('cs-full', on);
    document.documentElement.classList.toggle('cs-lock', on);
    this.root.querySelector('[data-ctl="full"]').setAttribute('aria-pressed', String(on));
    current?.scrollIntoView({ block: 'start' });
    this.scroller.focus({ preventScroll: true });
  }

  currentCard() {
    const top = this.scroller.scrollTop;
    return [...this.scroller.children].find((c) => c.offsetTop + c.offsetHeight / 2 > top);
  }

  step(dir) {
    const current = this.currentCard();
    const target = dir > 0 ? current?.nextElementSibling : current?.previousElementSibling;
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  // Pick the next item: live sources first, calm filler in between.
  async nextItem() {
    this.count++;
    if (this.count % BREAK_EVERY === 0) return { type: 'break', key: 'b' + this.count };
    if (this.count % 7 === 0) return { type: 'breathe', key: 'br' + this.count };
    const useLive = this.count % 3 !== 0;
    if (useLive && !this.queue.live.length && this.sources.length) {
      const pages = await Promise.all(this.sources.map((s) => s.next()));
      // Interleave sources so posts and videos mix naturally
      const mixed = [];
      while (pages.some((p) => p.length)) {
        pages.forEach((p, s) => { for (let w = 0; w < this.sources[s].weight && p.length; w++) mixed.push(p.shift()); });
      }
      this.queue.live.push(...mixed.filter((it) => !this.seen.has(it.key)));
    }
    if (useLive && this.queue.live.length) return this.queue.live.shift();
    if (!this.queue.calm.length) this.queue.calm = await this.calm();
    return this.queue.calm.shift();
  }

  async fill(n) {
    if (this.loading) return;
    this.loading = true;
    this.scroller.setAttribute('aria-busy', 'true');
    for (let i = 0; i < n; i++) {
      const item = await this.nextItem();
      this.seen.add(item.key);
      this.append(item);
    }
    this.recycle();
    this.loading = false;
    this.scroller.setAttribute('aria-busy', 'false');
  }

  append(item) {
    const [a, b] = GRADIENTS[this.count % GRADIENTS.length];
    const card = document.createElement('article');
    card.className = `cs-card cs-${item.type}`;
    card.style.setProperty('--cs-a', a);
    card.style.setProperty('--cs-b', b);
    card.setAttribute('aria-posinset', String(this.count));
    card.setAttribute('aria-setsize', '-1');
    card.dataset.key = item.key;
    if (item.type === 'post') card.dataset.post = item.post.id;
    const title = item.title || item.post?.title || item.video?.title || '';
    card._item = item;
    card._title = title;
    card.innerHTML = `<div class="cs-inner">${cardBody(item, this.count)}</div>${['post', 'video', 'quote', 'tip'].includes(item.type) ? actionRail(item) : ''}`;
    this.scroller.appendChild(card);
    this.observer.observe(card);
  }

  // Keep the DOM small: drop cards far above, keeping the view steady.
  recycle() {
    const extra = this.scroller.children.length - MAX_CARDS;
    if (extra <= 0) return;
    let removed = 0;
    for (let i = 0; i < extra; i++) {
      const first = this.scroller.firstElementChild;
      if (!first || first.offsetTop + first.offsetHeight > this.scroller.scrollTop - first.offsetHeight) break;
      removed += first.offsetHeight;
      this.observer.unobserve(first);
      first.remove();
    }
    if (removed) this.scroller.scrollTop -= removed;
  }

  onVisible(entries) {
    for (const entry of entries) {
      const card = entry.target;
      card.classList.toggle('is-active', entry.isIntersecting);
      if (!entry.isIntersecting) {
        // Stop any playing video as it leaves the screen
        const frame = card.querySelector('iframe');
        if (frame) frame.replaceWith(frame._button);
        continue;
      }
      if (card._title) this.announce.textContent = card._title;
      const left = this.scroller.children.length - [...this.scroller.children].indexOf(card) - 1;
      if (left < PREFETCH_AT) this.fill(6);
    }
  }

  async onClick(e) {
    const video = e.target.closest('[data-video]');
    if (video) {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.dataset.video)}?autoplay=1&playsinline=1&rel=0`;
      frame.title = video.getAttribute('aria-label').replace('Play video: ', '');
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.className = 'cs-video';
      frame._button = video;
      video.replaceWith(frame);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const card = act.closest('.cs-card');
    if (act.dataset.act === 'like') this.like(card, false);
    if (act.dataset.act === 'save') this.save(card, act);
    if (act.dataset.act === 'share') this.share(card);
  }

  async like(card, onlyOn, x, y) {
    const btn = card.querySelector('[data-act="like"]');
    if (!btn) return;
    const on = btn.getAttribute('aria-pressed') === 'true';
    if (onlyOn && on) return this.burst(card, x, y);
    const item = card._item;
    const set = (liked, count) => {
      btn.setAttribute('aria-pressed', String(liked));
      btn.querySelector('[aria-hidden]').textContent = liked ? '💗' : '🤍';
      if (count !== undefined) btn.querySelector('[data-count]').textContent = count || '';
    };
    if (item.type === 'post') {
      if (!(await loadMe())) {
        toast('Sign in to send hearts to survivors 💙');
        return;
      }
      set(!on);
      try {
        const { liked } = await api(`/api/posts/${item.post.id}/like`, { method: 'POST' });
        set(liked);
      } catch (error) {
        set(on);
        toast(error.message);
        return;
      }
    } else {
      const likes = new Set(readJSON(LOCAL_LIKES, []));
      on ? likes.delete(item.key) : likes.add(item.key);
      writeJSON(LOCAL_LIKES, [...likes].slice(-300));
      set(!on);
    }
    if (!on) this.burst(card, x, y);
  }

  burst(card, x, y) {
    if (reduceMotion) return;
    const heart = document.createElement('span');
    heart.className = 'cs-burst';
    heart.textContent = '💗';
    const box = card.getBoundingClientRect();
    heart.style.left = (x ? x - box.left : box.width / 2) + 'px';
    heart.style.top = (y ? y - box.top : box.height / 2) + 'px';
    card.appendChild(heart);
    setTimeout(() => heart.remove(), 900);
  }

  save(card, btn) {
    const key = card.dataset.key;
    const saved = new Set(readJSON(SAVED_KEY, []));
    const on = !saved.has(key);
    on ? saved.add(key) : saved.delete(key);
    writeJSON(SAVED_KEY, [...saved].slice(-300));
    const items = readJSON(SAVED_ITEMS, {});
    if (on) items[key] = snapshot(card._item);
    else delete items[key];
    writeJSON(SAVED_ITEMS, Object.fromEntries(Object.entries(items).filter(([k]) => saved.has(k))));
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('[aria-hidden]').textContent = on ? '⭐' : '☆';
    toast(on ? 'Saved on this device ⭐' : 'Removed from saved');
  }

  async share(card) {
    const item = card._item;
    const url = item.type === 'post'
      ? `${location.origin}/feed.html?post=${item.post.id}#community`
      : item.type === 'video' ? item.video.url || `https://www.youtube.com/watch?v=${item.video.videoId}` : location.origin + '/feed.html';
    const text = item.type === 'quote' ? `${item.title} ${item.sub}` : card._title;
    try {
      if (navigator.share) return await navigator.share({ title: 'Pleading Sanity', text, url });
      await navigator.clipboard.writeText(`${text} ${url}`.trim());
      toast('Link copied — send some light 💙');
    } catch (error) {
      if (error?.name !== 'AbortError') toast(url);
    }
  }
}

document.querySelectorAll('[data-cosmic-scroll]').forEach((el) => new CosmicScroll(el));
