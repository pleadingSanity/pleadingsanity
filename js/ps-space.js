/* P.S Space: a new-gen profile studio (themes, cover, profile song, bio, mood,
   Top 8 with AI and human members side by side, links, privacy).
   Signed-in members: saved to their account through /api/me/space and shown
   on their public /@username page. Guests: saved in this browser only.
   Songs are the site's own approved P.S library tracks or the member's own
   YouTube links. Nothing autoplays: library audio is created on a tap with
   preload none, and a YouTube player only loads after a tap (no autoplay flag).
   Only same-origin requests. No tracking. */
(function () {
  'use strict';
  var KEY = 'ps-space-v1';

  var THEMES = [
    { id: 'deep-space', name: 'Deep Space', s: ['#0b0f19', '#00fff0', '#f59e0b'] },
    { id: 'chrome', name: 'Chrome', s: ['#0d1014', '#e5e7eb', '#38bdf8'] },
    { id: 'aurora', name: 'Aurora', s: ['#03140f', '#34d399', '#00fff0'] },
    { id: 'ember', name: 'Ember Gold', s: ['#140a04', '#f59e0b', '#f97316'] },
    { id: 'ice', name: 'Ice', s: ['#06121c', '#bae6fd', '#38bdf8'] },
    { id: 'mono', name: 'Midnight Mono', s: ['#050607', '#f8fafc', '#94a3b8'] },
    { id: 'sunrise', name: 'Solar Sunrise', s: ['#170d05', '#fb923c', '#fde047'] },
    { id: 'neon', name: 'Ocean Neon', s: ['#0b0f19', '#38bdf8', '#00fff0'] }
  ];
  var G = '/assets/images/optimized/generated/';
  var E = '/assets/images/editorial/';
  var H = '/images/heroes/';
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
    { id: 'ps-radio', name: 'P.S Radio', href: '/music/', img: H + 'music-hero.webp' },
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
  // The house AI family, as described on /ai-ecosystem.html.
  var AIS = [
    { id: 'arron', name: 'Arron', role: 'Companion', href: '/arron.html', img: H + 'arron-hero.webp' },
    { id: 'dola', name: 'Dola', role: 'Cosmic Architect', href: '/ai-ecosystem.html#dola', img: H + 'ai-ecosystem-hero.webp' },
    { id: 'nova', name: 'Nova', role: 'AI Studio', href: '/ai-studio.html', img: H + 'ai-studio-hero.webp' },
    { id: 'sol', name: 'Sol', role: 'AI Studio', href: '/ai-studio.html', img: H + 'ai-welcome-hero.webp' }
  ];
  var PRIVACY = { public: 'Public, anyone with the link', members: 'Members, signed-in people only', friends: 'Friends only' };
  var DEFAULTS = { theme: 'deep-space', cover: 'brain-nebula', name: '', mood: '', bio: '', song: null, top8: ['ai:arron', 'space:ps-radio', 'space:healing-hz', 'space:feed'], links: [], privacy: 'private' };

  var tracks = [];
  var audio = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function safeUrl(u) {
    try { var x = new URL(String(u)); return x.protocol === 'https:' && !x.username && !x.password && x.hostname.indexOf('.') > 0 && !privateHost(x.hostname); } catch (e) { return false; }
  }
  // Loopback, private, link-local and unique-local hosts are never linked:
  // 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, 0/8, 100.64/10, ::1, ::, fc00::/7, fe80::/10.
  function privateHost(host) {
    var h = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
    if (h === 'localhost' || /\.(localhost|local|internal)$/.test(h)) return true;
    var m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
      var a = +m[1], b = +m[2];
      return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
    }
    if (h.indexOf(':') > -1) return h === '::1' || h === '::' || /^f[cd][0-9a-f]{0,2}:/.test(h) || /^fe[89ab][0-9a-f]?:/.test(h) || /^::ffff:/.test(h);
    return false;
  }
  function ytId(url) {
    var v = String(url || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    try {
      var u = new URL(v), parts = u.pathname.split('/').filter(Boolean);
      if (u.hostname === 'youtu.be' && /^[A-Za-z0-9_-]{11}$/.test(parts[0] || '')) return parts[0];
      if (/(^|\.)youtube\.com$/.test(u.hostname)) {
        var q = u.searchParams.get('v');
        if (q && /^[A-Za-z0-9_-]{11}$/.test(q)) return q;
        if ((parts[0] === 'shorts' || parts[0] === 'embed') && /^[A-Za-z0-9_-]{11}$/.test(parts[1] || '')) return parts[1];
      }
    } catch (e) {}
    return null;
  }
  // Older saves used bare ids ("ps-radio") and a track id string for the song.
  function normTop(id) { id = String(id || '').toLowerCase(); return id.indexOf(':') > 0 ? id : 'space:' + id; }
  function normSong(s) {
    if (!s) return null;
    if (typeof s === 'string') return { type: 'library', id: s };
    if (s.type === 'library' && s.id) return { type: 'library', id: String(s.id) };
    if (s.type === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(s.id || '')) return { type: 'youtube', id: s.id, title: String(s.title || ''), artist: String(s.artist || '') };
    return null;
  }
  function normalise(d) {
    var out = {};
    for (var k in DEFAULTS) out[k] = d && d[k] !== undefined ? d[k] : DEFAULTS[k];
    if (d && d.visibility && !d.privacy) out.privacy = d.visibility;
    if (!find(THEMES, out.theme)) out.theme = DEFAULTS.theme;
    if (!find(COVERS, out.cover) && out.cover !== 'my-banner') out.cover = DEFAULTS.cover;
    out.top8 = (Array.isArray(out.top8) ? out.top8 : []).map(normTop).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 8);
    out.links = (Array.isArray(out.links) ? out.links : []).filter(safeUrl).slice(0, 4);
    out.song = normSong(out.song);
    return out;
  }

  function loadLocal() { var d = {}; try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { d = {}; } return normalise(d); }
  function hasLocal() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function saveLocal(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }

  var NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var GLOBE = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>';
  var PEOPLE = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.4 3.2-5 6-5s5.2 1.6 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.5c2.5 0 4.3 1.4 5 4.5"/></svg>';
  var LINK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';
  var SPARK = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="currentColor"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z"/></svg>';

  function initial(name) { var c = String(name || '').trim().charAt(0); return /[A-Za-z0-9]/.test(c) ? c.toUpperCase() : 'P'; }
  function avatarHTML(profile) {
    var a = profile && profile.avatar || '';
    if (a.indexOf('photo:') === 0 && /^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(a.slice(6))) {
      return '<img src="/api/images/' + esc(a.slice(6)) + '" alt="" width="112" height="112" decoding="async">';
    }
    if (profile && profile.displayName) return '<span class="sp-initial" aria-hidden="true">' + esc(initial(profile.displayName)) + '</span>';
    return '<img src="/assets/images/brand/crying-brain-logo-clear-256.webp" alt="" width="112" height="112" decoding="async">';
  }

  // Everything a Top 8 can hold. People come from friends (editor) or the server (public page).
  function pickables(people) {
    var out = AIS.map(function (a) { return { id: 'ai:' + a.id, name: a.name, sub: a.role, href: a.href, img: a.img, kind: 'ai' }; });
    (people || []).forEach(function (p) {
      out.push({ id: 'user:' + String(p.username).toLowerCase(), name: p.displayName || p.username, sub: '@' + p.username, href: '/@' + encodeURIComponent(p.username), person: p, kind: 'member' });
    });
    SPACES.forEach(function (s) { out.push({ id: 'space:' + s.id, name: s.name, href: s.href, img: s.img, kind: 'space' }); });
    tracks.forEach(function (t) { out.push({ id: 'track:' + String(t.id).toLowerCase(), name: t.title, sub: t.label || 'AI-generated', href: '/music/', kind: 'track' }); });
    return out;
  }
  var KIND = { ai: 'AI', member: 'Member', track: 'Track', space: '' };

  function tileHTML(p) {
    var art = p.person ? '<span class="sp-tile-person">' + avatarHTML(p.person) + '</span>'
      : p.img ? '<img src="' + esc(p.img) + '" alt="" width="300" height="300" loading="lazy" decoding="async">'
      : '<i class="sp-tile-art" aria-hidden="true"></i>';
    var badge = KIND[p.kind] ? '<b class="sp-kind sp-kind-' + p.kind + '">' + (p.kind === 'ai' ? SPARK + ' ' : '') + KIND[p.kind] + '</b>' : '';
    return '<a class="sp-tile" href="' + esc(p.href) + '">' + art + badge + '<span>' + esc(p.name) + (p.sub ? '<small>' + esc(p.sub) + '</small>' : '') + '</span></a>';
  }

  function songHTML(song, ctx) {
    if (song && song.type === 'library') {
      var t = find(tracks, song.id);
      if (t) {
        return '<div class="sp-song"><div class="sp-art">' + NOTE + '</div><div class="sp-song-meta"><strong>' + esc(t.title) + '</strong><span>' + esc(t.artist || 'Pleading Socially') + (t.genre ? ' · ' + esc(t.genre) : '') + '</span><br><span class="sp-ai">' + esc(t.label || 'AI-generated') + '</span></div>' +
          '<button type="button" class="sp-play" data-sp-play aria-label="Play ' + esc(t.title) + '">' + PLAY + '</button></div>';
      }
    }
    if (song && song.type === 'youtube') {
      var label = (song.title || 'Profile song') + (song.artist ? ' · ' + song.artist : '');
      var action = ctx.embed
        ? '<button type="button" class="sp-play" data-sp-yt="' + esc(song.id) + '" aria-label="Load the player for ' + esc(label) + '">' + PLAY + '</button>'
        : '<a class="sp-play" href="https://www.youtube.com/watch?v=' + esc(song.id) + '" target="_blank" rel="noopener noreferrer" aria-label="Open ' + esc(label) + ' on YouTube">' + PLAY + '</a>';
      return '<div class="sp-song"><div class="sp-art">' + NOTE + '</div><div class="sp-song-meta"><strong>' + esc(song.title || 'Profile song') + '</strong><span>' + esc(song.artist || 'Shared from YouTube') + '</span><br><span class="sp-ai">Member link</span></div>' + action + '</div><div class="sp-yt" data-sp-yt-slot></div>';
    }
    return '<p class="sp-empty">' + (ctx.readonly ? 'No profile song yet.' : 'Pick a profile song below: a P.S library track or your own YouTube link. It never autoplays.') + '</p>';
  }

  function privacyChip(d, ctx) {
    if (ctx.mode === 'account' || ctx.readonly) {
      var p = d.privacy in PRIVACY ? d.privacy : 'public';
      return '<span class="sp-privacy">' + (p === 'public' ? GLOBE : p === 'members' ? PEOPLE : LOCK) + ' ' + esc(PRIVACY[p]) + '</span>';
    }
    return '<span class="sp-privacy">' + LOCK + ' Saved on this device only</span>';
  }

  function renderCard(d, ctx) {
    var cover = d.cover === 'my-banner' && ctx.bannerUrl ? { full: ctx.bannerUrl } : (find(COVERS, d.cover) || COVERS[0]);
    var all = pickables(ctx.people);
    var top = d.top8.map(function (id) { return find(all, id); }).filter(Boolean);
    var links = d.links.map(function (u) { var h = ''; try { h = new URL(u).hostname.replace(/^www\./, ''); } catch (e) {} return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer nofollow ugc">' + LINK + esc(h) + '</a></li>'; }).join('');
    var name = d.name || (ctx.readonly ? '' : 'Your Space');
    return '<article class="sp-card" aria-label="' + esc((name || 'Member') + ', P.S Space') + '">' +
      '<div class="sp-cover"><img src="' + esc(cover.full) + '" alt="" width="1280" height="720" decoding="async"><i class="sp-stars" aria-hidden="true"></i></div>' +
      '<div class="sp-head"><div class="sp-avatar">' + avatarHTML(ctx.profile || (d.name ? { displayName: d.name } : null)) + '</div>' +
      '<div class="sp-id"><h2 class="sp-name">' + esc(name) + '</h2>' +
      (ctx.profile && ctx.profile.username ? '<p class="sp-handle">@' + esc(ctx.profile.username) + '</p>' : '') +
      '<p class="sp-mood">' + esc(d.mood || (ctx.readonly ? '' : 'Set a mood line, how you are really doing.')) + '</p>' +
      privacyChip(d, ctx) + '</div></div>' +
      '<div class="sp-body"><div class="sp-panel"><h3>About me</h3><p class="sp-bio">' + esc(d.bio || (ctx.readonly ? 'No bio yet.' : 'Write a few lines about you. What keeps you going, what you make, what you love.')) + '</p>' + (links ? '<ul class="sp-links">' + links + '</ul>' : '') + '</div>' +
      '<div class="sp-panel"><h3>Profile song</h3>' + songHTML(d.song, ctx) + '</div>' +
      '<div class="sp-panel sp-wide"><h3>' + (ctx.readonly ? 'Top 8' : 'My Top 8') + ' <small>AI and human, side by side</small></h3>' + (top.length ? '<div class="sp-top8">' + top.map(tileHTML).join('') + '</div>' : '<p class="sp-empty">' + (ctx.readonly ? 'Nothing here yet.' : 'Choose up to 8: the AI family, your friends, spaces or tracks.') + '</p>') + '</div></div>' +
      '</article>';
  }

  function renderForm(d, ctx) {
    var acct = ctx.mode === 'account';
    var pick = function (type, name, value, checked, art, cap) {
      return '<label class="sp-pick"><input type="' + type + '" name="' + name + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '>' + art + '<span class="sp-cap">' + cap + '</span></label>';
    };
    var sw = function (s) { return '<i class="sp-swatch" style="--s1:' + s[0] + ';--s2:' + s[1] + ';--s3:' + s[2] + '" aria-hidden="true"></i>'; };
    var themes = THEMES.map(function (t) { return pick('radio', 'theme', t.id, d.theme === t.id, sw(t.s), esc(t.name)); }).join('');
    var covers = COVERS.map(function (c) { return pick('radio', 'cover', c.id, d.cover === c.id, '<img src="' + esc(c.thumb) + '" alt="" width="320" height="180" loading="lazy" decoding="async">', esc(c.name)); }).join('') +
      (ctx.bannerUrl ? pick('radio', 'cover', 'my-banner', d.cover === 'my-banner', '<img src="' + esc(ctx.bannerUrl) + '" alt="" width="320" height="180" loading="lazy" decoding="async">', 'My own banner') : '');
    var cur = d.song ? d.song.type + ':' + d.song.id : '';
    var songs = pick('radio', 'song', '', !cur, sw(['#0b0f19', '#1e293b', '#334155']), 'No song');
    songs += tracks.map(function (t, i) { return pick('radio', 'song', 'library:' + t.id, cur === 'library:' + t.id, sw(THEMES[(i % (THEMES.length - 1)) + 1].s), esc(t.title) + '<br><small class="sp-ai">' + esc(t.label || 'AI-generated') + '</small>'); }).join('');
    var mine = (ctx.mySongs || []).slice();
    if (d.song && d.song.type === 'youtube' && !mine.some(function (s) { return s.youtubeId === d.song.id; })) mine.unshift({ youtubeId: d.song.id, title: d.song.title, artist: d.song.artist });
    songs += mine.map(function (s) { return pick('radio', 'song', 'youtube:' + s.youtubeId, cur === 'youtube:' + s.youtubeId, sw(['#02101a', '#38bdf8', '#f59e0b']), esc(s.title || 'My YouTube song') + '<br><small class="sp-ai">My link</small>'); }).join('');
    var songNote = acct
      ? 'A P.S library track, or your own song as a YouTube link. It never autoplays: visitors tap to load and play it.'
      : 'From the site\'s own P.S library. AI tracks are labelled. It never autoplays, visitors tap to play.' + (tracks.length ? '' : ' The P.S library is not on this version of the site yet.');
    var ytField = acct ? '<div class="sp-yt-add"><label class="sp-field"><span>Or paste your own YouTube link</span><input type="url" name="ytUrl" inputmode="url" placeholder="youtube.com or youtu.be link"></label><div class="sp-row"><label class="sp-field" style="flex:1"><span>Song title</span><input type="text" name="ytTitle" maxlength="80"></label><label class="sp-field" style="flex:1"><span>Artist</span><input type="text" name="ytArtist" maxlength="60"></label></div></div>' : '';
    var all = pickables(ctx.people);
    var group = function (kind, title) {
      var items = all.filter(function (p) { return p.kind === kind; });
      if (!items.length) return '';
      return '<p class="sp-sub">' + title + '</p><div class="sp-grid">' + items.map(function (p) {
        var art = p.person ? '<span class="sp-pick-person">' + avatarHTML(p.person) + '</span>' : p.img ? '<img src="' + esc(p.img) + '" alt="" width="320" height="180" loading="lazy" decoding="async">' : sw(['#0b0f19', '#00fff0', '#f59e0b']);
        return pick('checkbox', 'top8', p.id, d.top8.indexOf(p.id) > -1, art, esc(p.name) + (p.kind === 'track' ? ' (AI)' : ''));
      }).join('') + '</div>';
    };
    var top = group('ai', 'The AI family') + group('member', 'My friends') + group('space', 'Spaces') + group('track', 'P.S tracks') +
      (acct && !(ctx.people || []).length ? '<p class="sp-note">Add friends from <a href="/community.html">Community</a> and they can sit in your Top 8 too.</p>' : '');
    var links = [0, 1, 2, 3].map(function (i) { return '<label class="sp-field"><span>Link ' + (i + 1) + ' (https only)</span><input type="url" name="link" inputmode="url" placeholder="https://" value="' + esc(d.links[i] || '') + '"></label>'; }).join('');
    var privacy = acct
      ? Object.keys(PRIVACY).map(function (k) { return '<label class="sp-row sp-radio"><input type="radio" name="privacy" value="' + k + '"' + (d.privacy === k ? ' checked' : '') + '> ' + esc(PRIVACY[k]) + '</label>'; }).join('') +
        '<p class="sp-note">This is the same setting as your page privacy. Your space shows on <a href="/@' + esc(ctx.profile.username) + '">your public page</a> to the people you choose here.</p>'
      : '<p class="sp-note">Your space is saved in this browser only, so nobody else can see it. <a href="/signup.html?next=%2Fprofile.html">Join free</a> or <a href="/login.html?next=%2Fprofile.html">sign in</a> to save it to your account and show it on your public page.</p>';
    return '<details class="sp-editor"' + (ctx.saved ? '' : ' open') + '><summary>Edit my space</summary><form class="sp-form" novalidate>' +
      '<fieldset><legend>Theme</legend><div class="sp-grid" role="radiogroup" aria-label="Theme">' + themes + '</div></fieldset>' +
      '<fieldset><legend>Cover image</legend><div class="sp-grid" role="radiogroup" aria-label="Cover image">' + covers + '</div>' + (acct && !ctx.bannerUrl ? '<p class="sp-note">Want your own? Upload a banner in Edit profile and it appears here.</p>' : '') + '</fieldset>' +
      '<fieldset><legend>Name, mood and bio</legend><div style="display:grid;gap:.7rem">' +
      '<label class="sp-field"><span>Display name</span><input type="text" name="name" maxlength="40" value="' + esc(d.name) + '" autocomplete="nickname"></label>' +
      '<label class="sp-field"><span>Mood or status line</span><input type="text" name="mood" maxlength="' + (acct ? 280 : 90) + '" value="' + esc(d.mood) + '" placeholder="Rising, one day at a time"></label>' +
      '<label class="sp-field"><span>Bio</span><textarea name="bio" rows="4" maxlength="' + (acct ? 300 : 600) + '">' + esc(d.bio) + '</textarea></label></div></fieldset>' +
      '<fieldset><legend>Profile song</legend><p class="sp-note" style="margin-bottom:.6rem">' + songNote + '</p><div class="sp-grid" role="radiogroup" aria-label="Profile song">' + songs + '</div>' + ytField + '</fieldset>' +
      '<fieldset><legend>My Top 8</legend><p class="sp-note" style="margin-bottom:.6rem">Pick up to 8. AI and human members sit side by side. <span class="sp-count" data-sp-count></span></p>' + top + '</fieldset>' +
      '<fieldset><legend>Links</legend><div style="display:grid;gap:.6rem">' + links + '</div></fieldset>' +
      '<fieldset><legend>Privacy</legend><div class="sp-row" role="radiogroup" aria-label="Who can see my space">' + privacy + '</div></fieldset>' +
      '<div class="sp-row"><button type="submit" class="sp-btn primary">' + (acct ? 'Save to my account' : 'Save my space') + '</button>' + (acct ? '<a class="sp-btn" href="/@' + esc(ctx.profile.username) + '">View my public page</a>' : '<button type="button" class="sp-btn" data-sp-reset>Reset</button>') + '<span role="status" aria-live="polite" class="sp-note" data-sp-status></span></div>' +
      '</form></details>';
  }

  function read(form, d, ctx) {
    var fd = new FormData(form);
    var songVal = String(fd.get('song') || ''), song = null;
    if (songVal.indexOf('library:') === 0) song = { type: 'library', id: songVal.slice(8) };
    if (songVal.indexOf('youtube:') === 0) {
      var id = songVal.slice(8), known = (ctx.mySongs || []).filter(function (s) { return s.youtubeId === id; })[0] || (d.song && d.song.id === id ? d.song : {});
      song = { type: 'youtube', id: id, title: String(known.title || '').slice(0, 80), artist: String(known.artist || '').slice(0, 60) };
    }
    var yt = ytId(fd.get('ytUrl'));
    if (yt) song = { type: 'youtube', id: yt, title: String(fd.get('ytTitle') || '').trim().slice(0, 80), artist: String(fd.get('ytArtist') || '').trim().slice(0, 60) };
    return {
      theme: fd.get('theme') || DEFAULTS.theme,
      cover: fd.get('cover') || DEFAULTS.cover,
      name: String(fd.get('name') || '').trim().slice(0, 40),
      mood: String(fd.get('mood') || '').trim().slice(0, ctx.mode === 'account' ? 280 : 90),
      bio: String(fd.get('bio') || '').trim().slice(0, ctx.mode === 'account' ? 300 : 600),
      song: song,
      top8: fd.getAll('top8').slice(0, 8),
      links: fd.getAll('link').map(function (s) { return String(s).trim(); }).filter(safeUrl).slice(0, 4),
      privacy: ctx.mode === 'account' ? (String(fd.get('privacy') || 'public')) : 'private'
    };
  }

  function stopSong() { if (audio) { audio.pause(); } }

  function wireSong(el, d) {
    var btn = el.querySelector('[data-sp-play]');
    var t = d.song && d.song.type === 'library' ? find(tracks, d.song.id) : null;
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
    var yt = el.querySelector('[data-sp-yt]');
    if (yt) {
      yt.addEventListener('click', function () {
        var id = yt.getAttribute('data-sp-yt');
        if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
        stopSong();
        var slot = el.querySelector('[data-sp-yt-slot]');
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id);
        frame.title = 'Profile song player';
        frame.loading = 'lazy';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allow = 'encrypted-media; picture-in-picture';
        slot.replaceChildren(frame);
        yt.hidden = true;
      }, { once: true });
    }
  }

  var tracksP = null;
  function loadTracks() {
    if (tracksP) return tracksP;
    return tracksP = fetch('/data/ps-playlists.json', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !Array.isArray(j.playlists)) return;
      j.playlists.forEach(function (pl) {
        (pl.tracks || []).forEach(function (t) {
          if (t && t.approved === true && typeof t.src === 'string' && t.src.indexOf('/assets/audio/') === 0) {
            tracks.push({ id: String(t.id), title: String(t.title || 'Untitled'), artist: t.artist, genre: t.genre, src: t.src, label: pl.kind === 'ai' ? (t.label || 'AI-generated') : (t.label || pl.label || '') });
          }
        });
      });
    }).catch(function () {});
  }
  // Signed-in calls go through the shared api() helper in /js/auth.js, which
  // refreshes the Identity session and sends the Authorization bearer.
  var authP = null;
  function auth() { if (!authP) authP = import('/js/auth.js').catch(function () { return null; }); return authP; }
  function callAPI(path, opts) {
    return auth().then(function (m) {
      if (!m || typeof m.api !== 'function') return { ok: false, status: 0, body: {}, noAuth: true };
      return m.api(path, opts).then(function (body) { return { ok: true, status: 200, body: body || {} }; },
        function (err) { return { ok: false, status: err && err.status || 0, body: err && err.data || {}, message: err && err.message }; });
    });
  }
  function getJSON(path) { return callAPI(path); }
  function hasSession() { try { return !!localStorage.getItem('gotrue.user'); } catch (e) { return false; } }
  // Re-run a mount when someone signs in or out on this page.
  var authWatchers = [];
  function onAuth(fn) {
    authWatchers.push(fn);
    if (authWatchers.length > 1) return;
    import('/js/vendor/netlify-identity.js').then(function (m) {
      if (m && typeof m.onAuthChange === 'function') m.onAuthChange(function (ev) { if (ev === 'login' || ev === 'logout') authWatchers.forEach(function (f) { try { f(ev); } catch (e) {} }); });
    }).catch(function () {});
  }
  var SAVED_FOR = {
    public: 'Saved to your account. Live on your public page.',
    members: 'Saved to your account. Visible to signed-in members only.',
    friends: 'Saved to your account. Visible to your friends only.'
  };

  // ─── Owner studio (profile.html, my-space.html) ───
  function mountStudio(root) {
    var ctx = { mode: 'guest', saved: hasLocal(), embed: root.getAttribute('data-embed') === 'youtube', people: [], mySongs: [] };
    var d = loadLocal();
    root.innerHTML = '<div data-sp-preview><div class="sp-card sp-loading" aria-hidden="true"></div></div><div data-sp-editor></div>';

    function paint(keepForm) {
      root.dataset.theme = d.theme;
      var preview = root.querySelector('[data-sp-preview]');
      preview.innerHTML = renderCard(d, ctx);
      wireSong(preview, d);
      if (!keepForm) { root.querySelector('[data-sp-editor]').innerHTML = renderForm(d, ctx); wireForm(); }
    }
    function wireForm() {
      var form = root.querySelector('.sp-form');
      if (!form) return;
      var count = form.querySelector('[data-sp-count]');
      var status = form.querySelector('[data-sp-status]');
      function limit() {
        var boxes = form.querySelectorAll('input[name=top8]');
        var n = form.querySelectorAll('input[name=top8]:checked').length;
        boxes.forEach(function (b) { b.disabled = !b.checked && n >= 8; });
        if (count) count.textContent = n + ' of 8 chosen';
      }
      limit();
      form.addEventListener('change', function (e) {
        if (e.target.name === 'top8') limit();
        var live = read(form, d, ctx);
        if (JSON.stringify(live.song) !== JSON.stringify(d.song)) stopSong();
        d = live; paint(true);
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        d = read(form, d, ctx);
        if (form.ytUrl && form.ytUrl.value.trim() && !ytId(form.ytUrl.value)) { status.textContent = 'That YouTube link did not look right. Paste a youtube.com or youtu.be link.'; return; }
        if (ctx.mode !== 'account') {
          var ok = saveLocal(d); ctx.saved = ok;
          status.textContent = ok ? (ctx.notice ? 'Saved on this device only. ' + ctx.notice : 'Saved on this device only. Sign in to save it to your account and show it on your public page.') : 'Could not save. Private browsing may block storage.';
          return;
        }
        var button = form.querySelector('[type=submit]');
        button.disabled = true; status.textContent = 'Saving…';
        callAPI('/api/me/space', {
          method: 'PUT',
          body: { space: { theme: d.theme, cover: d.cover, song: d.song, top8: d.top8, links: d.links }, displayName: d.name, bio: d.bio, statusText: d.mood, privacy: d.privacy }
        }).then(function (res) {
          if (!res.ok) throw new Error(res.status === 401 ? 'You have been signed out, so this was not saved to your account. Sign in and save again.' : (res.body && res.body.error) || res.message || 'Could not save to your account. Nothing was changed.');
          ctx.saved = true;
          if (d.song && d.song.type === 'youtube' && !ctx.mySongs.some(function (s) { return s.youtubeId === d.song.id; })) ctx.mySongs.unshift({ youtubeId: d.song.id, title: d.song.title, artist: d.song.artist });
          paint();
          root.querySelector('.sp-editor').open = true; // keep the confirmation in view
          var st = root.querySelector('[data-sp-status]');
          st.innerHTML = esc(SAVED_FOR[d.privacy] || SAVED_FOR.public) + (res.body.needsSupport ? ' That sounds heavy. You do not have to carry it alone: <a href="/crisis.html">help is here</a>, or call Samaritans free on <a href="tel:116123">116 123</a>.' : '');
        }).catch(function (err) {
          button.disabled = false; status.textContent = err.message || 'Could not save. Please try again.';
        });
      });
      var reset = form.querySelector('[data-sp-reset]');
      if (reset) reset.addEventListener('click', function () {
        try { localStorage.removeItem(KEY); } catch (err) {}
        stopSong(); ctx.saved = false; d = loadLocal(); paint();
        root.querySelector('[data-sp-status]').textContent = 'Reset to the default space.';
      });
    }

    Promise.all([loadTracks(), getJSON('/api/me/space')]).then(function (res) {
      var me = res[1];
      if (!me.ok || !me.body || !me.body.ok) {
        ctx.notice = me.status === 409 ? 'Finish setting up your profile to save your space to your account.'
          : me.status === 401 || !hasSession() ? ''
          : 'We could not reach your account just now, so changes save on this device only.';
        paint();
        if (ctx.notice) root.querySelector('[data-sp-editor]').insertAdjacentHTML('afterbegin', '<p class="sp-note sp-banner-note">' + esc(ctx.notice) + '</p>');
        return;
      }
      var b = me.body;
      ctx.mode = 'account'; ctx.saved = b.saved; ctx.profile = b.profile; ctx.bannerUrl = b.hasBanner ? b.bannerUrl : null; ctx.people = b.people || [];
      d = normalise(b.space);
      d.name = b.profile.displayName || ''; d.bio = b.profile.bio || ''; d.mood = b.profile.statusText || ''; d.privacy = b.profile.privacy;
      // First time on an account: carry over anything they built as a guest on this device.
      if (!b.saved && hasLocal()) { var local = loadLocal(); d.theme = local.theme; d.cover = local.cover; d.song = local.song && local.song.type === 'library' ? local.song : d.song; d.top8 = local.top8; d.links = local.links.length ? local.links : d.links; }
      paint();
      Promise.all([getJSON('/api/friends'), getJSON('/api/profile-songs')]).then(function (more) {
        var friends = more[0].ok && Array.isArray(more[0].body.friends) ? more[0].body.friends : [];
        friends.forEach(function (f) { if (f && f.username && !ctx.people.some(function (p) { return p.username === f.username; })) ctx.people.push({ username: f.username, displayName: f.displayName, avatar: f.avatar }); });
        ctx.mySongs = more[1].ok && Array.isArray(more[1].body.songs) ? more[1].body.songs.filter(function (s) { return /^[A-Za-z0-9_-]{11}$/.test(s.youtubeId || ''); }) : [];
        var open = root.querySelector('.sp-editor') && root.querySelector('.sp-editor').open;
        paint();
        if (open) root.querySelector('.sp-editor').open = true;
      });
    });
    window.addEventListener('pagehide', stopSong);
    if (!root.dataset.spAuthWatch) { root.dataset.spAuthWatch = '1'; onAuth(function () { stopSong(); mountStudio(root); }); }
  }

  // ─── Public view (/@username) ───
  function mountPublic(el) {
    var username = String(el.getAttribute('data-username') || '').toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(username)) return;
    var tries = el._spTries || 0;
    Promise.all([loadTracks(), getJSON('/api/profiles/' + encodeURIComponent(username) + '/space')]).then(function (res) {
      var b = res[1].body;
      if (!el.isConnected) return;
      // Locked or not reachable yet: keep the slot hidden (not removed) so it can
      // re-mount once sign-in resolves. Network blips retry twice.
      if (!res[1].ok || !b || !b.ok || b.locked || !b.saved) {
        el.hidden = true;
        if ((res[1].status === 0 || res[1].status >= 500) && tries < 2) { el._spTries = tries + 1; setTimeout(function () { mountPublic(el); }, 1500 * (tries + 1)); }
        return;
      }
      var d = normalise(b.space);
      d.name = b.profile.displayName; d.bio = b.profile.bio; d.mood = b.profile.statusText; d.privacy = 'public';
      var ctx = { readonly: true, embed: el.getAttribute('data-embed') === 'youtube', profile: b.profile, bannerUrl: b.bannerUrl, people: b.people || [] };
      el.dataset.theme = d.theme;
      el.innerHTML = renderCard(d, ctx);
      el.querySelector('.sp-privacy') && el.querySelector('.sp-privacy').remove();
      wireSong(el, d);
      el.hidden = false;
    });
    if (!el._spWatch) { el._spWatch = true; window.addEventListener('pagehide', stopSong); onAuth(function () { if (el.isConnected) { el._spTries = 0; mountPublic(el); } }); }
  }

  window.PSSpace = { mountPublic: mountPublic };
  var studio = document.getElementById('ps-space');
  if (studio) mountStudio(studio);
  var pub = document.getElementById('ps-space-public');
  if (pub) mountPublic(pub);
})();
