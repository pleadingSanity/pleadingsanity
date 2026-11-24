/* P.S Space: a new-gen profile studio (themes, cover, profile song, bio, mood,
   top 8, links, public/private). Saved in this browser only (localStorage).
   No uploads, no third-party music, no autoplay, no tracking, no network calls
   except reading the site's own /data/ps-playlists.json. */
(function () {
  'use strict';
  var KEY = 'ps-space-v1';
  var root = document.getElementById('ps-space');
  if (!root) return;

  var THEMES = [
    { id: 'deep-space', name: 'Deep Space', s: ['#0b0f19', '#00fff0', '#f59e0b'] },
    { id: 'chrome', name: 'Chrome', s: ['#0d1014', '#e5e7eb', '#38bdf8'] },
    { id: 'aurora', name: 'Aurora', s: ['#03140f', '#34d399', '#00fff0'] },
    { id: 'ember', name: 'Ember Gold', s: ['#140a04', '#f59e0b', '#f97316'] },
    { id: 'ice', name: 'Ice', s: ['#06121c', '#bae6fd', '#38bdf8'] },
    { id: 'mono', name: 'Midnight Mono', s: ['#050607', '#f8fafc', '#94a3b8'] },
    { id: 'sunrise', name: 'Solar Sunrise', s: ['#170d05', '#fb923c', '#fde047'] },
    { id: 'neon', name: 'Ocean Neon', s: ['#02101a', '#22d3ee', '#a3e635'] }
  ];
  var G = '/assets/images/optimized/generated/';
  var E = '/assets/images/editorial/';
  var COVERS = [
    { id: 'brain-nebula', name: 'Brain Nebula', thumb: G + 'hero-enhanced-800.webp', full: G + 'hero-enhanced-1200.webp' },
    { id: 'midlands-night', name: 'Midlands Night', thumb: G + 'midland-night-800.webp', full: G + 'midland-night-1200.webp' },
    { id: 'aurora-cabin', name: 'Aurora Cabin', thumb: '/assets/images/optimized/sanctuary-cabin-800.webp', full: '/assets/images/optimized/sanctuary-cabin-1200.webp' },
    { id: 'observatory', name: 'Observatory', thumb: E + 'cosmic-observatory-640.webp', full: E + 'cosmic-observatory-1280.webp' },
    { id: 'creator-stage', name: 'Creator Stage', thumb: E + 'creator-stage-640.webp', full: E + 'creator-stage-1280.webp' }
  ];
  var C = '/assets/theme/cards/';
  var SPACES = [
    { id: 'arron', name: 'Arron', href: '/arron.html', img: C + 'cosmic-focus.webp' },
    { id: 'ps-radio', name: 'P.S Radio', href: '/music/', img: '/images/heroes/music-hero.webp' },
    { id: 'insane-radio', name: 'Insane Radio', href: '/insane-radio.html', img: C + 'rhythm-resonance.webp' },
    { id: 'rap-studio', name: 'Rap Studio', href: '/rap.html', img: E + 'creator-stage-640.webp' },
    { id: 'healing-hz', name: 'Healing Hz', href: '/frequencies.html', img: C + 'healing-hz.webp' },
    { id: 'journal', name: 'Journal Vault', href: '/journal-vault.html', img: C + 'sanity-stories.webp' },
    { id: 'feed', name: 'Sanity Feed', href: '/feed.html', img: G + 'hero-enhanced-800.webp' },
    { id: 'stories', name: 'AI Stories', href: '/ai-stories.html', img: C + 'mind-mode.webp' },
    { id: 'mood', name: 'Mood Journey', href: '/mood-journey.html', img: C + 'mood-journey.webp' },
    { id: 'memory-ocean', name: 'Memory Ocean', href: '/memory-ocean.html', img: C + 'memory-ocean.webp' },
    { id: 'cosmic-connect', name: 'Cosmic Connect', href: '/cosmic-connect.html', img: C + 'cosmic-connect.webp' },
    { id: 'stardust', name: 'Stardust Dash', href: '/stardust-dash.html', img: C + 'stardust-dash.webp' }
  ];
  var DEFAULTS = { v: 1, theme: 'deep-space', cover: 'brain-nebula', name: '', mood: '', bio: '', song: '', top8: ['arron', 'ps-radio', 'healing-hz', 'feed'], links: [], visibility: 'private' };
  var tracks = [];
  var audio = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load() {
    var d = {};
    try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { d = {}; }
    var out = {};
    for (var k in DEFAULTS) out[k] = d[k] !== undefined ? d[k] : DEFAULTS[k];
    if (!THEMES.some(function (t) { return t.id === out.theme; })) out.theme = DEFAULTS.theme;
    if (!COVERS.some(function (c) { return c.id === out.cover; })) out.cover = DEFAULTS.cover;
    out.top8 = Array.isArray(out.top8) ? out.top8.slice(0, 8) : [];
    out.links = Array.isArray(out.links) ? out.links.filter(safeUrl).slice(0, 4) : [];
    out.visibility = out.visibility === 'public' ? 'public' : 'private';
    return out;
  }
  function hasSaved() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function safeUrl(u) {
    try { var x = new URL(String(u)); return x.protocol === 'https:' && !/^(localhost|127\.|10\.|192\.168\.)/.test(x.hostname); } catch (e) { return false; }
  }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function trackById(id) { return find(tracks, id); }
  function pickables() {
    return SPACES.map(function (s) { return { id: s.id, name: s.name, href: s.href, img: s.img }; })
      .concat(tracks.map(function (t) { return { id: 'track:' + t.id, name: t.title, href: '/music/', track: t }; }));
  }

  var NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var GLOBE = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>';
  var LINK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';

  function tileHTML(p) {
    var art = p.img ? '<img src="' + esc(p.img) + '" alt="" width="300" height="300" loading="lazy" decoding="async">' : '<i class="sp-tile-art" aria-hidden="true"></i>';
    return '<a class="sp-tile" href="' + esc(p.href) + '">' + art + '<span>' + esc(p.name) + (p.track ? ' <small>(' + esc(p.track.label || 'AI-generated') + ')</small>' : '') + '</span></a>';
  }

  function renderCard(d) {
    var cover = find(COVERS, d.cover) || COVERS[0];
    var t = trackById(d.song);
    var top = d.top8.map(function (id) { return find(pickables(), id); }).filter(Boolean);
    var songHTML = t
      ? '<div class="sp-song"><div class="sp-art">' + NOTE + '</div><div class="sp-song-meta"><strong>' + esc(t.title) + '</strong><span>' + esc(t.artist || 'Pleading Socially') + (t.genre ? ' · ' + esc(t.genre) : '') + '</span><br><span class="sp-ai">' + esc(t.label || 'AI-generated') + '</span></div>' +
        '<button type="button" class="sp-play" data-sp-play aria-label="Play ' + esc(t.title) + '">' + PLAY + '</button></div>'
      : '<p class="sp-empty">' + (tracks.length ? 'Pick a profile song from the P.S library below.' : 'Profile songs unlock when P.S Radio is live on the site.') + '</p>';
    var links = d.links.map(function (u) { var h = ''; try { h = new URL(u).hostname.replace(/^www\./, ''); } catch (e) {} return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer nofollow ugc">' + LINK + esc(h) + '</a></li>'; }).join('');
    return '<article class="sp-card" aria-label="Your P.S Space preview">' +
      '<div class="sp-cover"><img src="' + esc(cover.full) + '" alt="" width="1280" height="720" decoding="async"></div>' +
      '<div class="sp-head"><div class="sp-avatar"><img src="/assets/images/brand/crying-brain-logo-clear-256.webp" alt="" width="112" height="112" decoding="async"></div>' +
      '<div class="sp-id"><h2 class="sp-name">' + esc(d.name || 'Your Space') + '</h2>' +
      '<p class="sp-mood">' + esc(d.mood || 'Set a mood line, how you are really doing.') + '</p>' +
      '<span class="sp-privacy">' + (d.visibility === 'public' ? GLOBE + ' Public when sync is on' : LOCK + ' Private, only you') + '</span></div></div>' +
      '<div class="sp-body"><div class="sp-panel"><h3>About me</h3><p class="sp-bio">' + esc(d.bio || 'Write a few lines about you. What keeps you going, what you make, what you love.') + '</p>' + (links ? '<ul class="sp-links">' + links + '</ul>' : '') + '</div>' +
      '<div class="sp-panel"><h3>Profile song</h3>' + songHTML + '</div>' +
      '<div class="sp-panel" style="grid-column:1/-1"><h3>My Top 8</h3>' + (top.length ? '<div class="sp-top8">' + top.map(tileHTML).join('') + '</div>' : '<p class="sp-empty">Choose up to 8 spaces, creators or tracks below.</p>') + '</div></div>' +
      '</article>';
  }

  function renderForm(d) {
    var themes = THEMES.map(function (t) {
      return '<label class="sp-pick"><input type="radio" name="theme" value="' + t.id + '"' + (d.theme === t.id ? ' checked' : '') + '><i class="sp-swatch" style="--s1:' + t.s[0] + ';--s2:' + t.s[1] + ';--s3:' + t.s[2] + '" aria-hidden="true"></i><span class="sp-cap">' + esc(t.name) + '</span></label>';
    }).join('');
    var covers = COVERS.map(function (c) {
      return '<label class="sp-pick"><input type="radio" name="cover" value="' + c.id + '"' + (d.cover === c.id ? ' checked' : '') + '><img src="' + esc(c.thumb) + '" alt="" width="320" height="180" loading="lazy" decoding="async"><span class="sp-cap">' + esc(c.name) + '</span></label>';
    }).join('');
    var songs = tracks.length ? '<label class="sp-pick sp-song-pick"><input type="radio" name="song" value=""' + (!d.song ? ' checked' : '') + '><i class="sp-swatch" style="--s1:#0b0f19;--s2:#1e293b;--s3:#334155" aria-hidden="true"></i><span class="sp-cap">No song</span></label>' + tracks.map(function (t, i) {
      var th = THEMES[(i % (THEMES.length - 1)) + 1].s;
      return '<label class="sp-pick sp-song-pick"><input type="radio" name="song" value="' + esc(t.id) + '"' + (d.song === t.id ? ' checked' : '') + '><i class="sp-swatch" style="--s1:' + th[0] + ';--s2:' + th[1] + ';--s3:' + th[2] + '" aria-hidden="true"></i><span class="sp-cap">' + esc(t.title) + '<br><small class="sp-ai">' + esc(t.label || 'AI-generated') + '</small></span></label>';
    }).join('') : '<p class="sp-note">The P.S library is not on this version of the site yet. Songs appear here when P.S Radio is live.</p>';
    var top = pickables().map(function (p) {
      var art = p.img ? '<img src="' + esc(p.img) + '" alt="" width="320" height="180" loading="lazy" decoding="async">' : '<i class="sp-swatch" style="--s1:#0b0f19;--s2:#00fff0;--s3:#f59e0b" aria-hidden="true"></i>';
      return '<label class="sp-pick"><input type="checkbox" name="top8" value="' + esc(p.id) + '"' + (d.top8.indexOf(p.id) > -1 ? ' checked' : '') + '>' + art + '<span class="sp-cap">' + esc(p.name) + (p.track ? ' (AI)' : '') + '</span></label>';
    }).join('');
    var links = [0, 1, 2, 3].map(function (i) { return '<label class="sp-field"><span>Link ' + (i + 1) + ' (https only)</span><input type="url" name="link" inputmode="url" placeholder="https://" value="' + esc(d.links[i] || '') + '"></label>'; }).join('');
    return '<details class="sp-editor"' + (hasSaved() ? '' : ' open') + '><summary>Edit my space</summary><form class="sp-form" novalidate>' +
      '<fieldset><legend>Theme</legend><div class="sp-grid" role="radiogroup" aria-label="Theme">' + themes + '</div></fieldset>' +
      '<fieldset><legend>Cover image</legend><div class="sp-grid" role="radiogroup" aria-label="Cover image">' + covers + '</div></fieldset>' +
      '<fieldset><legend>Name, mood and bio</legend><div style="display:grid;gap:.7rem">' +
      '<label class="sp-field"><span>Display name</span><input type="text" name="name" maxlength="40" value="' + esc(d.name) + '" autocomplete="nickname"></label>' +
      '<label class="sp-field"><span>Mood or status line</span><input type="text" name="mood" maxlength="90" value="' + esc(d.mood) + '" placeholder="Rising, one day at a time"></label>' +
      '<label class="sp-field"><span>Bio</span><textarea name="bio" rows="4" maxlength="600">' + esc(d.bio) + '</textarea></label></div></fieldset>' +
      '<fieldset><legend>Profile song</legend><p class="sp-note" style="margin-bottom:.6rem">From the site\'s own P.S library only. AI tracks are labelled. It never autoplays, visitors tap to play.</p><div class="sp-grid" role="radiogroup" aria-label="Profile song">' + songs + '</div></fieldset>' +
      '<fieldset><legend>My Top 8</legend><p class="sp-note" style="margin-bottom:.6rem">Pick up to 8. <span class="sp-count" data-sp-count></span></p><div class="sp-grid">' + top + '</div></fieldset>' +
      '<fieldset><legend>Links</legend><div style="display:grid;gap:.6rem">' + links + '</div></fieldset>' +
      '<fieldset><legend>Privacy</legend><div class="sp-row" role="radiogroup" aria-label="Who can see my space">' +
      '<label class="sp-row" style="min-height:44px"><input type="radio" name="visibility" value="private"' + (d.visibility !== 'public' ? ' checked' : '') + '> Private, only me</label>' +
      '<label class="sp-row" style="min-height:44px"><input type="radio" name="visibility" value="public"' + (d.visibility === 'public' ? ' checked' : '') + '> Public</label></div>' +
      '<p class="sp-note">Your space is saved in this browser only. Public means it can show on your public page once account sync is switched on. Nothing is shared until then.</p></fieldset>' +
      '<div class="sp-row"><button type="submit" class="sp-btn primary">Save my space</button><button type="button" class="sp-btn" data-sp-reset>Reset</button><span role="status" aria-live="polite" class="sp-note" data-sp-status></span></div>' +
      '</form></details>';
  }

  function read(form) {
    var fd = new FormData(form);
    var top = fd.getAll('top8').slice(0, 8);
    return {
      v: 1,
      theme: fd.get('theme') || DEFAULTS.theme,
      cover: fd.get('cover') || DEFAULTS.cover,
      name: String(fd.get('name') || '').trim().slice(0, 40),
      mood: String(fd.get('mood') || '').trim().slice(0, 90),
      bio: String(fd.get('bio') || '').trim().slice(0, 600),
      song: String(fd.get('song') || ''),
      top8: top,
      links: fd.getAll('link').map(function (s) { return String(s).trim(); }).filter(safeUrl).slice(0, 4),
      visibility: fd.get('visibility') === 'public' ? 'public' : 'private'
    };
  }

  function stopSong() { if (audio) { audio.pause(); } }

  function paint(d, keepForm) {
    root.dataset.theme = d.theme;
    var preview = root.querySelector('[data-sp-preview]');
    preview.innerHTML = renderCard(d);
    if (!keepForm) root.querySelector('[data-sp-editor]').innerHTML = renderForm(d);
    wire(d);
  }

  function wire(d) {
    var btn = root.querySelector('[data-sp-play]');
    var t = trackById(d.song);
    if (btn && t) {
      btn.addEventListener('click', function () {
        if (!audio || audio.dataset.id !== t.id) {
          stopSong();
          audio = new Audio();
          audio.preload = 'none';
          audio.src = t.src;
          audio.dataset.id = t.id;
          audio.addEventListener('ended', function () { btn.innerHTML = PLAY; btn.setAttribute('aria-label', 'Play ' + t.title); });
        }
        if (audio.paused) {
          document.querySelectorAll('audio').forEach(function (a) { if (a !== audio) try { a.pause(); } catch (e) {} });
          audio.play().catch(function () {});
          btn.innerHTML = PAUSE; btn.setAttribute('aria-label', 'Pause ' + t.title);
        } else {
          audio.pause(); btn.innerHTML = PLAY; btn.setAttribute('aria-label', 'Play ' + t.title);
        }
      });
    }
    var form = root.querySelector('.sp-form');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';
    var count = form.querySelector('[data-sp-count]');
    function limit() {
      var boxes = form.querySelectorAll('input[name=top8]');
      var n = form.querySelectorAll('input[name=top8]:checked').length;
      boxes.forEach(function (b) { b.disabled = !b.checked && n >= 8; });
      if (count) count.textContent = n + ' of 8 chosen';
    }
    limit();
    form.addEventListener('change', function (e) {
      if (e.target.name === 'top8') limit();
      var live = read(form);
      if (live.song !== d.song) stopSong();
      d = live; root.dataset.theme = live.theme;
      root.querySelector('[data-sp-preview]').innerHTML = renderCard(live);
      wire(live);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = read(form);
      var ok = save(data);
      form.querySelector('[data-sp-status]').textContent = ok ? 'Saved on this device.' : 'Could not save. Private browsing may block storage.';
    });
    form.querySelector('[data-sp-reset]').addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (err) {}
      stopSong(); paint(load());
      root.querySelector('[data-sp-status]') && (root.querySelector('[data-sp-status]').textContent = 'Reset to the default space.');
    });
  }

  function start() {
    root.innerHTML = '<div data-sp-preview></div><div data-sp-editor></div>';
    paint(load());
    fetch('/data/ps-playlists.json', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !Array.isArray(j.playlists)) return;
      j.playlists.forEach(function (pl) {
        (pl.tracks || []).forEach(function (t) {
          if (t && t.approved === true && typeof t.src === 'string' && t.src.indexOf('/assets/audio/') === 0) {
            tracks.push({ id: String(t.id), title: String(t.title || 'Untitled'), artist: t.artist, genre: t.genre, src: t.src, label: pl.kind === 'ai' ? (t.label || 'AI-generated') : (t.label || pl.label || '') });
          }
        });
      });
      if (tracks.length) paint(load());
    }).catch(function () {});
  }
  start();
  window.addEventListener('pagehide', stopSong);
})();
