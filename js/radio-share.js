/* ============================================================
   PLEADING SANITY — INSANE RADIO SHARE + COSMIC ICON SET
   Shared by insane-radio.html and /music/index.html.
   - Native Web Share API (navigator.share) with clipboard fallback
     + toast. No external libs, no hotlinks, no icon fonts.
   - Inline SVG cosmic-sanctuary iconography (play/pause/next/prev/
     volume/share/equalizer/broadcast) exposed as PSRadioShare.ICONS.
   - Auto-augments any element carrying data-ps-share="song|playlist"
     with a share button; also wires Shane's playlist cards and user
     playlist items (rendered by js/radio-playlists.js, out of our
     edit scope) via MutationObserver. Marker class prevents doubles.
   - Share text: "Listen on Pleading Sanity Insane Radio" + URL.
   - Starts silent / no autoplay is NOT affected (share only).
   - No secrets, no solar-fit phrasing, no external requests.
   ============================================================ */
(function () {
  'use strict';
  if (window.PSRadioShare && window.PSRadioShare.__loaded) return;
  var SITE = 'https://pleadingsanity.co.uk';
  var RADIO_PAGE = SITE + '/insane-radio.html';
  var SHARE_LEAD = 'Listen on Pleading Sanity Insane Radio';

  // ---------- cosmic-sanctuary inline SVG icon set ----------
  // Stroke-based, currentColor, 24x24 viewBox. No external assets.
  var ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".45"/><path d="M10 8.2l6.2 3.8-6.2 3.8z" fill="currentColor" stroke="none"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".45"/><rect x="8.6" y="7.5" width="2.6" height="9" rx="1.1" fill="currentColor" stroke="none"/><rect x="12.8" y="7.5" width="2.6" height="9" rx="1.1" fill="currentColor" stroke="none"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6.5l7 5.5-7 5.5z" fill="currentColor" stroke="none"/><rect x="15.5" y="6.5" width="2.4" height="11" rx="1" fill="currentColor" stroke="none"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6.5l-7 5.5 7 5.5z" fill="currentColor" stroke="none"/><rect x="6.1" y="6.5" width="2.4" height="11" rx="1" fill="currentColor" stroke="none"/></svg>',
    volume: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" fill="currentColor" stroke="none"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".6"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" fill="currentColor" stroke="none"/><line x1="15.5" y1="9.5" x2="20.5" y2="14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="20.5" y1="9.5" x2="15.5" y2="14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="6" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.5" cy="6" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.5" cy="18" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.3 10.8l6.9-3.6M8.3 13.2l6.9 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    // animated equalizer bars — used on active station indicator
    eq: '<svg class="ps-eq-bars" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect class="ps-eq-bar ps-eq-b1" x="4" y="9" width="3" height="6" rx="1.2" fill="currentColor"/><rect class="ps-eq-bar ps-eq-b2" x="10.5" y="6" width="3" height="12" rx="1.2" fill="currentColor"/><rect class="ps-eq-bar ps-eq-b3" x="17" y="10.5" width="3" height="4.5" rx="1.2" fill="currentColor"/></svg>',
    // broadcast tower with pulses — station toggle
    broadcast: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 16.5a5 5 0 0 1 7 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".55"/><path d="M6 14a8.5 8.5 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".35"/><rect x="11" y="12" width="2" height="7" rx="1" fill="currentColor" stroke="none"/><circle cx="12" cy="9.5" r="1.8" fill="currentColor" stroke="none"/><path d="M8 21h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="3.5" height="3.5" rx="1" fill="currentColor" stroke="none" opacity=".8"/><rect x="3.5" y="15.5" width="3.5" height="3.5" rx="1" fill="currentColor" stroke="none" opacity=".8"/><rect x="10" y="6" width="11" height="2.2" rx="1.1" fill="currentColor" stroke="none"/><rect x="10" y="16.5" width="11" height="2.2" rx="1.1" fill="currentColor" stroke="none"/></svg>'
  };

  // ---------- toast ----------
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    try {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'ps-share-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        (document.body || document.documentElement).appendChild(toastEl);
      }
      toastEl.textContent = msg;
      toastEl.classList.add('is-visible');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toastEl.classList.remove('is-visible');
      }, 2600);
    } catch (e) {}
  }

  // ---------- core share ----------
  function buildShareData(opts) {
    opts = opts || {};
    var kind = opts.kind === 'playlist' ? 'playlist' : 'song';
    var title = opts.title || 'Insane Radio';
    var artist = opts.artist || '';
    var url = opts.url || RADIO_PAGE;
    var text = SHARE_LEAD + (kind === 'playlist' ? ' — playlist' : '') + (artist ? ' · ' + artist : '') + ' — ' + title;
    return { title: title, text: text, url: url };
  }
  function share(opts, cb) {
    var data = buildShareData(opts);
    var done = function (how) { if (typeof cb === 'function') { try { cb(how); } catch (e) {} } };
    if (navigator.share && typeof navigator.share === 'function') {
      var p = null;
      try { p = navigator.share(data); } catch (e) { p = Promise.reject(e); }
      if (p && typeof p.then === 'function') {
        p.then(function () { toast('Shared.'); done('native'); })
         .catch(function (err) {
            // user cancelled or unsupported — fall through to clipboard
            copyFallback(data, done);
         });
      } else { copyFallback(data, done); }
    } else {
      copyFallback(data, done);
    }
  }
  function copyFallback(data, done) {
    var payload = data.text + '\n' + data.url;
    var ok = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        navigator.clipboard.writeText(payload).then(function () { ok = true; toast('Link copied to clipboard — paste anywhere.'); done('clipboard'); })
          .catch(function () { legacyCopy(payload, done); });
        return;
      } catch (e) { /* fall through */ }
    }
    legacyCopy(payload, done);
  }
  function legacyCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      (document.body || document.documentElement).appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.parentNode.removeChild(ta);
      toast(ok ? 'Link copied to clipboard — paste anywhere.' : 'Could not copy — long-press to share manually.');
      done(ok ? 'legacy-clipboard' : 'failed');
    } catch (e) { done('failed'); }
  }

  // ---------- share button factory ----------
  function makeShareButton(opts) {
    opts = opts || {};
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ps-share-btn' + (opts.kind === 'playlist' ? ' ps-share-playlist' : ' ps-share-song');
    var label = opts.label || (opts.kind === 'playlist' ? 'Share playlist' : 'Share song');
    btn.setAttribute('aria-label', label + (opts.title ? ' — ' + opts.title : ''));
    btn.title = label;
    btn.innerHTML = '<span class="ps-share-icon" aria-hidden="true">' + ICONS.share + '</span>' +
                    '<span class="ps-share-label">' + label + '</span>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      share(opts);
    });
    return btn;
  }

  // ---------- auto-augmentation ----------
  // Elements we render (in-scope JS) carry data-ps-share-* attributes.
  // Playlist cards from js/radio-playlists.js (out of scope) are matched
  // by known stable classes. Marker class prevents double injection.
  var MARK = 'ps-share-injected';
  function trackUrlFrom(youtubeId) {
    return RADIO_PAGE + (youtubeId ? '#track-' + encodeURIComponent(youtubeId) : '');
  }
  function augmentElement(el) {
    if (!el || el.classList.contains(MARK)) return;
    var kind = el.getAttribute('data-ps-share') || '';
    if (!kind) return;
    el.classList.add(MARK);
    var title = el.getAttribute('data-ps-title') || '';
    var artist = el.getAttribute('data-ps-artist') || '';
    var url = el.getAttribute('data-ps-url') || trackUrlFrom(el.getAttribute('data-ps-youtube') || '');
    var wrap = document.createElement('span');
    wrap.className = 'ps-share-wrap';
    var sb = makeShareButton({ kind: kind, title: title, artist: artist, url: url });
    wrap.appendChild(sb);
    // Insert right after the track button inside its parent, or after el.
    if (el.parentNode) {
      if (el.nextSibling) el.parentNode.insertBefore(wrap, el.nextSibling);
      else el.parentNode.appendChild(wrap);
    }
  }
  function augmentPlaylistCard(card) {
    if (!card || card.classList.contains(MARK)) return;
    var nameEl = card.querySelector('.shane-playlist-name, .playlist-item-title');
    var name = nameEl ? (nameEl.textContent || '').trim() : 'Playlist';
    // find the playlist URL if present
    var url = RADIO_PAGE;
    var link = card.querySelector('a[href]');
    if (link) {
      try {
        var u = new URL(link.getAttribute('href'), window.location.origin);
        if (u.hostname === window.location.hostname || /youtube/.test(u.hostname)) url = u.href;
      } catch (e) {}
    }
    card.classList.add(MARK);
    var actions = card.querySelector('.shane-playlist-actions') || card;
    var sb = makeShareButton({ kind: 'playlist', title: name, url: url });
    sb.classList.add('ps-share-on-card');
    actions.appendChild(sb);
  }
  function scan() {
    try {
      var els = document.querySelectorAll('[data-ps-share]:not(.' + MARK + ')');
      for (var i = 0; i < els.length; i++) augmentElement(els[i]);
      var cards = document.querySelectorAll('.shane-playlist-card:not(.' + MARK + '), .playlist-item:not(.' + MARK + ')');
      for (var j = 0; j < cards.length; j++) augmentPlaylistCard(cards[j]);
    } catch (e) {}
  }
  function startObserver() {
    try {
      if (!('MutationObserver' in window)) { setInterval(scan, 1500); return; }
      var mo = new MutationObserver(function () { scan(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }
  function boot() {
    scan();
    startObserver();
    // periodic catch-up for late-rendered lists
    setTimeout(scan, 1200);
    setTimeout(scan, 3500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ---------- public API ----------
  window.PSRadioShare = {
    __loaded: true,
    ICONS: ICONS,
    share: share,
    makeShareButton: makeShareButton,
    toast: toast,
    buildShareData: buildShareData,
    RADIO_PAGE: RADIO_PAGE,
    SITE: SITE
  };
})();
