// ==============================================================
// PLEADING SANITY — MIND MODE
// Mood toggle + dynamic message/quote changes.
//   [data-mind-mode]      container of mood buttons (data-mood="…")
//   [data-mind-message]   element that gets the mood's message
//   [data-mind-quote]     featured quote, rotated by [data-mind-next]
//   [data-quote-wall]     list whose items carry data-moods="low anxious …"
// Your mood stays on your device only (localStorage). No tracking.
// ==============================================================

(function () {
  'use strict';

  var STORAGE_KEY = 'ps-mind-mode';
  var MESSAGES = {
    all: 'Every word here was written by someone who has been in the dark and found a way through. Take what you need.',
    low: 'Heavy day? You don\'t have to fix it right now. Just breathe, and let these sit with you. 💙',
    anxious: 'Your mind is racing — that\'s okay. Slow breath in for four, out for six. You are safe in this moment.',
    rising: 'You\'re climbing. Notice how far you\'ve come — yesterday\'s you would be proud.',
    fierce: 'That fire is yours. Turn it into purpose. Madness into meaning.'
  };

  var buttons = document.querySelectorAll('[data-mind-mode] [data-mood]');
  if (!buttons.length) return;

  var messageEl = document.querySelector('[data-mind-message]');
  var featuredEl = document.querySelector('[data-mind-quote]');
  var nextBtn = document.querySelector('[data-mind-next]');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-quote-wall] [data-moods]'));
  var current = 'all';
  var lastIndex = -1;

  function visibleItems() {
    return items.filter(function (el) { return !el.hidden; });
  }

  function feature() {
    if (!featuredEl) return;
    var pool = visibleItems();
    if (!pool.length) return;
    var i = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && i === lastIndex) i = (i + 1) % pool.length;
    lastIndex = i;
    var source = pool[i];
    var text = source.querySelector('p');
    var cite = source.querySelector('cite');
    featuredEl.querySelector('p').textContent = text ? text.textContent : '';
    featuredEl.querySelector('cite').textContent = cite ? cite.textContent : '';
  }

  function setMood(mood, save) {
    if (!MESSAGES[mood]) mood = 'all';
    current = mood;
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.mood === mood));
    });
    items.forEach(function (el) {
      el.hidden = mood !== 'all' && el.dataset.moods.split(' ').indexOf(mood) === -1;
    });
    if (messageEl) messageEl.textContent = MESSAGES[mood];
    document.documentElement.dataset.mindMode = mood;
    lastIndex = -1;
    feature();
    if (save) {
      try { localStorage.setItem(STORAGE_KEY, mood); } catch (e) { /* private mode */ }
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () { setMood(btn.dataset.mood, true); });
  });
  if (nextBtn) nextBtn.addEventListener('click', feature);

  var saved = 'all';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'all'; } catch (e) { /* private mode */ }
  setMood(saved, false);
})();
