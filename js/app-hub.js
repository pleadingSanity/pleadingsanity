/* Sanity App Hub on /get-the-app.html (also /apps).
   A curated catalogue of rooms that already exist in this house. Every href is a real page.
   Favourites and "recently opened" stay on this device (localStorage), never sent anywhere.
   Dates are the page's real last change in the repository, not marketing.
   Evolution, Not Erasure: the install card above this catalogue is untouched. */
(function () {
  'use strict';

  var FAV_KEY = 'ps-app-favs';
  var RECENT_KEY = 'ps-app-recent';

  // own: has its own install icon (its own manifest id). house: opens inside the main app.
  // age: house guidance only, not an official rating.
  var APPS = [
    { id: 'arron-app', name: 'Arron', href: '/arron-app.html', img: '/assets/images/showcase/brain-calm.jpg', cats: ['wellbeing', 'ai'], featured: true, own: true, age: 'Teens and adults', added: '2026-09-28', updated: '2026-10-12',
      blurb: 'Your companion, full screen. A companion, not a doctor. Forget Me clears it all.',
      a11y: 'Keyboard and screen-reader friendly chat. Optional on-device Speak.' },
    { id: 'arron', name: 'Arron on the web', href: '/arron.html', img: '/assets/images/brand/home-brain-night.jpg', cats: ['wellbeing', 'ai'], age: 'Teens and adults', added: '2026-09-27', updated: '2026-10-20',
      blurb: 'The same Arron in a page, with Speak that never leaves your phone.',
      a11y: 'Live region for replies. Speak is off until you choose it.' },
    { id: 'journal', name: 'Journal Vault', href: '/journal-vault.html', img: '/assets/images/showcase/journal-calm.jpg', cats: ['wellbeing', 'productivity'], featured: true, age: 'Teens and adults', added: '2025-10-13', updated: '2026-10-13',
      blurb: 'Private words. Yours alone. Forget Me clears what you ask it to.',
      a11y: 'Large text areas, labelled controls.' },
    { id: 'notes', name: 'Sanctuary Notes', href: '/notes.html', img: '/assets/images/editorial/quiet-journal-640.webp', cats: ['productivity'], age: 'Everyone', added: '2026-10-09', updated: '2026-10-13',
      blurb: 'Quick notes and lists for the day, kept with your account.',
      a11y: 'Labelled inputs, keyboard friendly.' },
    { id: 'solitaire', name: 'Sanity Solitaire', href: '/sanity-solitaire.html', img: '/assets/games/worlds/aurora-lakes-v2.webp', cats: ['games'], featured: true, own: true, offline: true, age: 'Everyone', added: '2026-10-03', updated: '2026-10-20',
      blurb: 'Three peaks under the night sky. New deal, undo and hint. Progress stays on your phone.',
      a11y: '48px buttons on phone. Reduced motion respected.' },
    { id: 'poker', name: 'Night Table', href: '/poker.html', img: '/assets/games/worlds/forest-tavern-v2.webp', cats: ['games', 'community'], featured: true, age: 'Teens and adults', added: '2026-10-04', updated: '2026-10-20',
      blurb: 'Texas Hold’em with play chips only. No cash, no deposits. Friend rooms need no account.',
      a11y: 'Large action buttons. Table state announced as text.' },
    { id: 'cosmic-connect', name: 'Cosmic Connect', href: '/cosmic-connect.html', img: '/assets/theme/cards/cosmic-connect.webp', cats: ['games', 'kids'], offline: true, age: 'Everyone', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'Memory matching and star drawing. No timer.',
      a11y: 'Tap or keyboard. No time pressure.' },
    { id: 'truth-tag', name: 'Truth Tag', href: '/truth-tag.html', img: '/assets/theme/cards/truth-tag.webp', cats: ['games', 'education'], offline: true, age: 'Teens and adults', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'Practise telling known, experience, thought and belief apart.',
      a11y: 'Text-first. Works with a screen reader.' },
    { id: 'stardust-dash', name: 'Stardust Dash', href: '/stardust-dash.html', img: '/assets/theme/cards/stardust-dash.webp', cats: ['games', 'kids'], offline: true, age: 'Everyone', added: '2026-09-30', updated: '2026-10-13',
      blurb: 'Catch falling stars and dodge silly worries.',
      a11y: 'Touch and arrow keys.' },
    { id: 'cosmic-focus', name: 'Cosmic Focus', href: '/cosmic-focus.html', img: '/assets/theme/cards/cosmic-focus.webp', cats: ['games'], offline: true, age: 'Everyone', added: '2026-09-23', updated: '2026-10-13',
      blurb: 'A gentle focus game for when the mind is loud.',
      a11y: 'Large targets.' },
    { id: 'number-nebula', name: 'Number Nebula', href: '/number-nebula.html', img: '/assets/theme/cards/number-nebula.webp', cats: ['games', 'education', 'kids'], offline: true, age: 'Everyone', added: '2026-09-23', updated: '2026-10-13',
      blurb: 'Quick number puzzles among the stars.',
      a11y: 'Large targets.' },
    { id: 'pattern-galaxy', name: 'Pattern Galaxy', href: '/pattern-galaxy.html', img: '/assets/theme/cards/pattern-galaxy.webp', cats: ['games', 'kids'], offline: true, age: 'Everyone', added: '2026-09-23', updated: '2026-10-13',
      blurb: 'Watch the pattern, then repeat it.',
      a11y: 'Large targets.' },
    { id: 'memory-ocean', name: 'Memory Ocean', href: '/memory-ocean.html', img: '/assets/theme/cards/memory-ocean.webp', cats: ['games', 'kids'], offline: true, age: 'Everyone', added: '2026-09-23', updated: '2026-10-13',
      blurb: 'Turn the cards and find the pairs.',
      a11y: 'Large targets.' },
    { id: 'rhythm-resonance', name: 'Rhythm Resonance', href: '/rhythm-resonance.html', img: '/assets/theme/cards/rhythm-resonance.webp', cats: ['games'], offline: true, age: 'Everyone', added: '2026-09-23', updated: '2026-10-13',
      blurb: 'Tap along with a soft beat.',
      a11y: 'Visual beat as well as sound.' },
    { id: 'games', name: 'All Brain Games', href: '/games.html', img: '/assets/images/showcase/games.jpg', cats: ['games'], age: 'Everyone', added: '2026-09-23', updated: '2026-10-13',
      blurb: 'The whole shelf, with shared XP, levels and badges on this device.',
      a11y: 'Every card is one link. Mute switch wins.' },
    { id: 'mind-mode', name: 'Mind Mode', href: '/mind-mode.html', img: '/assets/theme/cards/mind-mode.webp', cats: ['wellbeing'], featured: true, offline: true, age: 'Everyone', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'Guided breathing and grounding. No score you can fail.',
      a11y: 'Text cues as well as motion. Reduced motion respected.' },
    { id: 'mood-journey', name: 'Mood Journey', href: '/mood-journey.html', img: '/assets/theme/cards/mood-journey.webp', cats: ['wellbeing'], offline: true, age: 'Everyone', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'A private weekly check-in. No streaks to lose.',
      a11y: 'Labelled choices.' },
    { id: 'healing-hz', name: 'Healing Hz', href: '/frequencies.html', img: '/assets/theme/cards/healing-hz.webp', cats: ['wellbeing'], offline: true, age: 'Everyone', added: '2026-09-23', updated: '2026-10-20',
      blurb: 'Quiet tones at soft volume. They fade in and out. Not a treatment.',
      a11y: 'Arrow keys move between tones.' },
    { id: 'silence', name: 'Silence', href: '/meditation.html', img: '/assets/images/space/aurora-planets.jpg', cats: ['wellbeing'], age: 'Everyone', added: '2026-09-27', updated: '2026-10-13',
      blurb: 'A simple silence timer, sound optional.',
      a11y: 'Large start and stop buttons.' },
    { id: 'quote-wall', name: 'Quote Wall', href: '/quote-wall.html', img: '/assets/images/editorial/connected-lights-640.webp', cats: ['wellbeing', 'community'], age: 'Everyone', added: '2026-09-27', updated: '2026-10-13',
      blurb: 'Words that kept people standing.',
      a11y: 'Readable text over dark cards.' },
    { id: 'finance', name: 'Sane Finance', href: '/finance.html', img: '/assets/images/showcase/finance.jpg', cats: ['finance', 'productivity'], featured: true, own: true, age: 'Adults', added: '2026-10-08', updated: '2026-10-20',
      blurb: 'Honest numbers, no sales pressure. Figures stay on your device. Not a lender or adviser.',
      a11y: 'Labelled number fields.' },
    { id: 'feed', name: 'Sanity Feed', href: '/feed.html', img: '/assets/images/showcase/community.jpg', cats: ['community'], age: 'Teens and adults', added: '2025-07-27', updated: '2026-10-16',
      blurb: 'Newest first. Hearts only. No ranking, nobody pays to be on top.',
      a11y: 'Stories scroll inside their own box. Escape leaves full screen.' },
    { id: 'sanctuary', name: 'My Sanctuary', href: '/sanctuary.html', img: '/assets/images/showcase/ai-family.jpg', cats: ['community'], age: 'Teens and adults', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'Your own corner of the house.',
      a11y: 'Labelled controls.' },
    { id: 'wisdom', name: 'Words from the Family', href: '/wisdom.html', img: '/assets/images/editorial/living-book-640.webp', cats: ['creativity', 'community'], age: 'Everyone', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'Evidence, Experience and Philosophy, kept apart.',
      a11y: 'Plain reading layout.' },
    { id: 'ai-stories', name: 'AI Stories', href: '/ai-stories.html', img: '/assets/images/showcase/ai-family.jpg', cats: ['ai', 'community'], age: 'Everyone', added: '2026-09-30', updated: '2026-10-13',
      blurb: 'Moments shared from conversations with Arron.',
      a11y: 'Plain reading layout.' },
    { id: 'creator', name: 'Creator Hub', href: '/creator.html', img: '/assets/images/editorial/creator-stage-640.webp', cats: ['creativity', 'community'], age: 'Teens and adults', added: '2026-10-08', updated: '2026-10-13',
      blurb: 'Set up your creator page and plan your next live.',
      a11y: 'Step-by-step form.' },
    { id: 'live', name: 'LIVE', href: '/live.html', img: '/assets/images/editorial/creator-stage-1280.webp', cats: ['creativity', 'community'], age: 'Teens and adults', added: '2026-10-08', updated: '2026-10-20',
      blurb: 'Share a stream link from YouTube or Twitch. This page does not broadcast by itself.',
      a11y: 'Embedded players keep their own controls.' },
    { id: 'ai-studio', name: 'AI Studio', href: '/ai-studio.html', img: '/assets/images/showcase/ai-family.jpg', cats: ['creativity', 'ai'], age: 'Teens and adults', added: '2026-09-30', updated: '2026-10-13',
      blurb: 'Humans and AI making things together.',
      a11y: 'Labelled controls.' },
    { id: 'write', name: 'Write with Arron', href: '/write.html', img: '/assets/images/editorial/quiet-journal-1280.webp', cats: ['creativity', 'ai'], age: 'Teens and adults', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'Draft a piece with Arron’s help. You choose what is published.',
      a11y: 'Large text areas.' },
    { id: 'rap', name: 'Rap Studio', href: '/rap.html', img: '/assets/images/editorial/rise-from-madness-1280.webp', cats: ['creativity'], age: 'Teens and adults', added: '2026-10-08', updated: '2026-10-12',
      blurb: 'Write bars and shape a verse.',
      a11y: 'Labelled inputs.' },
    { id: 'blueprint', name: 'Video Blueprint', href: '/blueprint.html', img: '/assets/images/editorial/connected-lights-1280.webp', cats: ['creativity', 'ai'], age: 'Teens and adults', added: '2026-10-01', updated: '2026-10-13',
      blurb: 'Plan a short video, shot by shot, with Arron.',
      a11y: 'Step-by-step form.' },
    { id: 'digital-story', name: 'My Digital Story', href: '/my-digital-story.html', img: '/assets/images/editorial/living-book-1280.webp', cats: ['creativity'], age: 'Teens and adults', added: '2026-10-11', updated: '2026-10-13',
      blurb: 'Preview your own posts as one story. Opt-in only.',
      a11y: 'Labelled inputs.' },
    { id: 'site-builder', name: 'Sane Site Builder', href: '/site-builder.html', img: '/assets/images/editorial/connected-lights-640.webp', cats: ['productivity', 'creativity'], age: 'Adults', added: '2026-10-13', updated: '2026-10-19',
      blurb: 'Write a clear brief for improving a website. It does not crawl or change any site.',
      a11y: 'Labelled form.' },
    { id: 'kids', name: 'Keep Kids Sane', href: '/kids.html', img: '/assets/theme/cards/kids.webp', cats: ['kids', 'education'], featured: true, age: 'Kids with a grown-up', added: '2026-09-27', updated: '2026-10-13',
      blurb: 'Safe, calm games, breathing and feelings for children.',
      a11y: 'Big buttons, simple words.' },
    { id: 'kids-series', name: 'Kids Cartoon Series', href: '/kids-series.html', img: '/assets/theme/cards/sanity-stories.webp', cats: ['kids', 'education'], age: 'Kids with a grown-up', added: '2026-10-11', updated: '2026-10-20',
      blurb: 'Meet Ollie, Zara, Max, Mia and Blinky. Episode scripts, not finished animation yet.',
      a11y: 'Plain reading layout.' },
    { id: 'bible', name: 'New Gen Bible', href: '/new-gen-bible.html', img: '/assets/images/editorial/rise-from-madness-640.webp', cats: ['education'], age: 'Teens and adults', added: '2026-10-06', updated: '2026-10-12',
      blurb: 'A living guide in twelve books. Nobody owns the truth.',
      a11y: 'Plain reading layout.' },
    { id: 'support', name: 'Support', href: '/support.html', img: '/assets/images/space/aurora-drive.jpg', cats: ['wellbeing'], age: 'Everyone', added: '2026-10-08', updated: '2026-10-16',
      blurb: 'Where to turn right now. Always free, always open.',
      a11y: 'Plain text, large links.' }
  ];

  var CATS = [
    { id: 'all', label: 'All' },
    { id: 'favs', label: '★ Favourites' },
    { id: 'games', label: 'Games' },
    { id: 'wellbeing', label: 'Wellbeing' },
    { id: 'ai', label: 'AI companions' },
    { id: 'community', label: 'Community' },
    { id: 'creativity', label: 'Creativity' },
    { id: 'education', label: 'Education' },
    { id: 'kids', label: 'Kids' },
    { id: 'finance', label: 'Finance' },
    { id: 'productivity', label: 'Productivity' }
  ];

  function read(key) { try { var v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* private mode: hub still works */ } }
  function byId(id) { for (var i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i]; return null; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function tile(app, favs) {
    var li = el('li', 'hub-item');
    var a = el('a', 'hub-card');
    a.href = app.href;
    a.dataset.app = app.id;
    var img = el('img');
    img.src = app.img; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.width = 640; img.height = 400;
    img.addEventListener('error', function fallback() {
      img.removeEventListener('error', fallback);
      img.src = '/assets/images/brand/crying-brain-logo-clear-256.webp';
      img.classList.add('hub-image-fallback');
    });
    a.appendChild(img);
    var t = el('span', 'hub-text');
    t.appendChild(el('strong', null, app.name));
    t.appendChild(el('span', 'hub-blurb', app.blurb));
    var meta = el('span', 'hub-meta');
    meta.appendChild(el('span', 'hub-tag' + (app.own ? ' hub-own' : ''), app.own ? 'Own app · install on its page' : 'Opens inside Sanity'));
    meta.appendChild(el('span', 'hub-age', app.age));
    if (app.offline) meta.appendChild(el('span', 'hub-age', 'Works offline once opened'));
    t.appendChild(meta);
    t.appendChild(el('span', 'hub-a11y', '♿ ' + app.a11y));
    a.appendChild(t);
    li.appendChild(a);

    var fav = el('button', 'hub-fav');
    fav.type = 'button';
    var on = favs.indexOf(app.id) !== -1;
    fav.setAttribute('aria-pressed', on ? 'true' : 'false');
    fav.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + app.name + (on ? ' from favourites' : ' to favourites'));
    fav.textContent = on ? '★' : '☆';
    fav.dataset.fav = app.id;
    li.appendChild(fav);
    return li;
  }

  function fill(list, apps, favs) {
    list.textContent = '';
    apps.forEach(function (app) { list.appendChild(tile(app, favs)); });
  }

  function boot() {
    var root = document.getElementById('app-hub');
    if (!root) return;
    var search = document.getElementById('hub-search');
    var chips = document.getElementById('hub-cats');
    var grid = document.getElementById('hub-grid');
    var count = document.getElementById('hub-count');
    var featured = document.getElementById('hub-featured');
    var fresh = document.getElementById('hub-fresh');
    var recentWrap = document.getElementById('hub-recent-wrap');
    var recent = document.getElementById('hub-recent');
    var state = { cat: 'all', q: '' };

    CATS.forEach(function (c) {
      var b = el('button', 'hub-chip', c.label);
      b.type = 'button';
      b.dataset.cat = c.id;
      b.setAttribute('aria-pressed', c.id === 'all' ? 'true' : 'false');
      chips.appendChild(b);
    });

    function render() {
      var favs = read(FAV_KEY);
      var q = state.q.trim().toLowerCase();
      var shown = APPS.filter(function (app) {
        if (state.cat === 'favs' && favs.indexOf(app.id) === -1) return false;
        if (state.cat !== 'all' && state.cat !== 'favs' && app.cats.indexOf(state.cat) === -1) return false;
        if (!q) return true;
        return (app.name + ' ' + app.blurb + ' ' + app.cats.join(' ')).toLowerCase().indexOf(q) !== -1;
      });
      fill(grid, shown, favs);
      if (!shown.length) {
        var empty = el('li', 'hub-empty', state.cat === 'favs' && !q
          ? 'No favourites yet. Tap ☆ on any app to keep it here.'
          : 'Nothing matches that yet. Try another word, or choose All.');
        grid.appendChild(empty);
      }
      count.textContent = shown.length + (shown.length === 1 ? ' app' : ' apps') + ' shown';

      fill(featured, APPS.filter(function (a) { return a.featured; }), favs);
      fill(fresh, APPS.slice()
        .sort(function (a, b) { return a.updated < b.updated ? 1 : -1; }).slice(0, 6), favs);

      var rec = read(RECENT_KEY).map(byId).filter(Boolean);
      recentWrap.hidden = !rec.length;
      fill(recent, rec, favs);
    }

    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      state.cat = b.dataset.cat;
      chips.querySelectorAll('[data-cat]').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      render();
    });
    search.addEventListener('input', function () { state.q = search.value; render(); });

    root.addEventListener('click', function (e) {
      var f = e.target.closest('[data-fav]');
      if (f) {
        var favs = read(FAV_KEY);
        var i = favs.indexOf(f.dataset.fav);
        if (i === -1) favs.push(f.dataset.fav); else favs.splice(i, 1);
        write(FAV_KEY, favs);
        var id = f.dataset.fav;
        render();
        var again = root.querySelector('#hub-grid [data-fav="' + id + '"]') || root.querySelector('[data-fav="' + id + '"]');
        if (again) again.focus();
        return;
      }
      var card = e.target.closest('[data-app]');
      if (card) {
        var rec = read(RECENT_KEY).filter(function (x) { return x !== card.dataset.app; });
        rec.unshift(card.dataset.app);
        write(RECENT_KEY, rec.slice(0, 6));
      }
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.PSAppHub = { apps: APPS };
})();
