/* =====================================================
   PLEADING SANITY — SITE MUSIC (autoplay, gesture-unmuted)
   Track: Kid Cudi ft. Wiz Khalifa — Man On The Moon (The Anthem)
   YouTube ID: DjdB4Bm4n2M
   - Hidden iframe autoplays MUTED (browsers block audible autoplay).
   - On FIRST user gesture (click / touchstart / keydown) we unmute by
     swapping the iframe src to mute=0 — done synchronously inside the
     gesture handler, which satisfies iOS Safari's requirement.
   - Scroll is deliberately NOT used as the unlock gesture: iOS does not
     treat scroll as a media-unlocking gesture, so it would fire once and
     consume the listener without unmuting.
   - Button toggles mute. Preference persisted in localStorage
     "ps-music-muted" ("1" = muted, "0" = playing).
   - If ps-music-muted === "1" on load: stay muted, no auto-unmute —
     the user's explicit choice is respected.
   SEPARATE from js/cosmic-audio-system.js (SFX, off by default) and
   js/ps-music.js (optional Spotify playlist widget). No conflict.
===================================================== */
(function () {
  'use strict';

  var VIDEO_ID = 'DjdB4Bm4n2M';
  var BASE = 'https://www.youtube.com/embed/' + VIDEO_ID;
  var STORE_KEY = 'ps-music-muted';

  var iframe = document.getElementById('ps-music-frame');
  var widget = document.getElementById('ps-music-widget');
  var btn = document.getElementById('ps-music-toggle');
  if (!iframe || !widget || !btn) return;

  // state: iframe always starts muted (autoplay requirement)
  var state = { muted: true, unlocked: false };

  function srcFor(muted) {
    return BASE + '?autoplay=1&mute=' + (muted ? '1' : '0') +
      '&loop=1&playlist=' + VIDEO_ID + '&rel=0&modestbranding=1';
  }

  function setPlayingUI(playing) {
    widget.classList.toggle('ps-playing', playing);
    if (playing) {
      btn.setAttribute('aria-label', 'Mute background music: Man on the Moon by Kid Cudi');
      btn.title = '♪ Man on the Moon — Kid Cudi (tap to mute)';
    } else {
      btn.setAttribute('aria-label', 'Unmute background music: Man on the Moon by Kid Cudi');
      btn.title = '♪ Man on the Moon — Kid Cudi (tap to unmute)';
    }
  }

  function applyMute(muted, persist) {
    state.muted = muted;
    // src swap — reliable across browsers; reloads the embed (loop continues)
    iframe.src = srcFor(muted);
    setPlayingUI(!muted);
    if (persist) {
      try { localStorage.setItem(STORE_KEY, muted ? '1' : '0'); } catch (e) {}
    }
  }

  // ---- first-gesture auto-unmute (only if user hasn't explicitly muted) ----
  var userExplicitlyMuted = false;
  try { userExplicitlyMuted = (localStorage.getItem(STORE_KEY) === '1'); } catch (e) {}

  function onFirstGesture() {
    if (state.unlocked || userExplicitlyMuted) return;
    state.unlocked = true;
    removeGestureListeners();
    // synchronous src swap inside the gesture handler — required by iOS
    applyMute(false, true);
  }

  function addGestureListeners() {
    document.addEventListener('click', onFirstGesture, { capture: true, once: true });
    document.addEventListener('touchstart', onFirstGesture, { capture: true, once: true, passive: true });
    document.addEventListener('keydown', onFirstGesture, { capture: true, once: true });
  }
  function removeGestureListeners() {
    document.removeEventListener('click', onFirstGesture, { capture: true });
    document.removeEventListener('touchstart', onFirstGesture, { capture: true });
    document.removeEventListener('keydown', onFirstGesture, { capture: true });
  }

  // ---- button toggle ----
  btn.addEventListener('click', function (e) {
    e.stopPropagation(); // don't also trigger the first-gesture unlocker
    e.preventDefault();
    state.unlocked = true; // user has interacted with music directly
    removeGestureListeners();
    applyMute(!state.muted, true);
  });

  // ---- init ----
  // iframe src already set in markup with mute=1; ensure it's correct
  iframe.src = srcFor(true);
  setPlayingUI(false); // starts muted

  if (userExplicitlyMuted) {
    // respect explicit choice: stay muted, no auto-unmute
    try { localStorage.setItem(STORE_KEY, '1'); } catch (e) {}
  } else {
    addGestureListeners();
  }
})();
