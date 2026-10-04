// ==============================================================
// games.js — PLEADING SANITY BRAIN GAMES · SHARED TOOLKIT
// One cosmic profile for every game: XP & levels, personal bests,
// daily streak, badges, daily challenge, toasts, confetti, pop-ups,
// soft optional sound (off by default) and gentle haptics.
// Our own games only: no ads, no tracking, all stored on this device.
//
// Load with a plain <script src="/js/games.js"></script> BEFORE a
// game's inline script and window.PSGames is ready to use.
// ==============================================================

(function () {
  'use strict';

  var KEY = 'ps-games-profile';
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reducedMotion() { return !!(reduceMQ && reduceMQ.matches); }

  // ─── GAME REGISTRY ───
  var GAMES = [
    { id: 'cosmic-focus', title: 'Cosmic Focus', icon: '🧠', url: '/cosmic-focus.html', skill: 'Memory',
      desc: 'Watch the stars light up, then repeat the sequence. Combos build, calm wins.' },
    { id: 'number-nebula', title: 'Number Nebula', icon: '🔢', url: '/number-nebula.html', skill: 'Logic',
      desc: 'Quick-fire sums and sequences that ramp up gently. Your brain, but sparklier.' },
    { id: 'pattern-galaxy', title: 'Pattern Galaxy', icon: '🌈', url: '/pattern-galaxy.html', skill: 'Perception',
      desc: 'Spot what comes next in the cosmic flow. Trains focus and intuition.' },
    { id: 'memory-ocean', title: 'Memory Ocean', icon: '🌊', url: '/memory-ocean.html', skill: 'Calm',
      desc: 'Flip and match in a peaceful sea of cards. No timers, just flow.' },
    { id: 'rhythm-resonance', title: 'Rhythm Resonance', icon: '🎵', url: '/rhythm-resonance.html', skill: 'Listening',
      desc: 'Listen, feel, repeat. Soothing tones that settle a busy mind.' },
    { id: 'stardust-dash', title: 'Stardust Dash', icon: '🌠', url: '/stardust-dash.html', skill: 'Reflex',
      desc: 'Catch stars, dodge silly worries like "Did I leave the oven on?"' },
    { id: 'solitaire', title: 'Sanity Solitaire', icon: '🃏', url: '/sanity-solitaire.html', skill: 'Patience',
      desc: 'Four solitaire games. Night cards. Your own app.' },
    { id: 'night-table', title: 'Night Table', icon: '♠️', url: '/poker.html', skill: 'Patience',
      desc: 'Hold\'em with play chips. One table. No cash.' },
    { id: 'cosmic-connect', title: 'Cosmic Connect', icon: '✨', url: '/cosmic-connect.html', skill: 'Memory',
      desc: 'Turn two cards. No timer. Match the sky.' },
    { id: 'truth-tag', title: 'Truth Tag', icon: '🏷️', url: '/truth-tag.html', skill: 'Discernment',
      desc: 'Evidence, lived experience, or philosophy. Learn the difference.' }
  ];
  function game(id) {
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i];
    return null;
  }

  // ─── BADGES ───
  var BADGES = {
    'first-light':  { icon: '✨', name: 'First Light', desc: 'Played your very first game' },
    'personal-best':{ icon: '🏆', name: 'Beat Yesterday', desc: 'Set a new personal best' },
    'combo-5':      { icon: '🔥', name: 'On a Roll', desc: 'Hit a 5× combo' },
    'combo-10':     { icon: '🌀', name: 'Flow State', desc: 'Hit a 10× combo' },
    'combo-20':     { icon: '🌌', name: 'Cosmic Flow', desc: 'Hit a 20× combo' },
    'streak-3':     { icon: '📅', name: 'Hat-Trick', desc: 'Played 3 days in a row' },
    'streak-7':     { icon: '🌙', name: 'Moon Cycle', desc: 'Played 7 days in a row' },
    'streak-30':    { icon: '🪐', name: 'Orbit Complete', desc: 'Played 30 days in a row' },
    'explorer':     { icon: '🧭', name: 'Star Explorer', desc: 'Played every game at least once' },
    'daily':        { icon: '🎯', name: 'Daily Devotee', desc: 'Completed a Daily Challenge' },
    'level-5':      { icon: '💫', name: 'Rising Star', desc: 'Reached player level 5' },
    'level-10':     { icon: '🌟', name: 'Supernova', desc: 'Reached player level 10' },
    'night-owl':    { icon: '🦉', name: 'Night Owl', desc: 'Played after 11pm (rest counts too 💙)' },
    'early-bird':   { icon: '🐦', name: 'Early Bird', desc: 'Played before 7am' },
    'steady-light': { icon: '🕯️', name: 'Steady Light', desc: 'Cleared the weekly challenge on this device' }
  };
  // Per-game mastery badge — reach level 5 in that game
  GAMES.forEach(function (g) {
    BADGES[g.id + '-master'] = { icon: g.icon, name: g.title + ' Star', desc: 'Reached level 5 in ' + g.title };
  });

  // ─── PLAYER LEVELS ───
  var TITLES = ['Stardust', 'Moonbeam', 'Comet', 'Nebula', 'Pulsar', 'Quasar', 'Supernova',
    'Galaxy Brain', 'Star Weaver', 'Cosmic Sage', 'Universe Whisperer'];
  // Level L needs 50·L·(L−1) total XP → 0, 100, 300, 600, 1000…
  function levelInfo(xp) {
    xp = Math.max(0, xp || 0);
    var lvl = Math.floor((1 + Math.sqrt(1 + (4 * xp) / 50)) / 2);
    var base = 50 * lvl * (lvl - 1);
    var next = 50 * (lvl + 1) * lvl;
    return {
      level: lvl,
      title: TITLES[Math.min(lvl - 1, TITLES.length - 1)],
      into: xp - base,
      need: next - base,
      pct: Math.round(((xp - base) / (next - base)) * 100)
    };
  }

  // ─── PROFILE STORAGE ───
  function blank() {
    return { v: 1, xp: 0, games: {}, badges: {}, streak: { count: 0, last: '' }, sound: false, daily: { date: '', done: false }, weekly: { key: '', done: false } };
  }
  var profile = (function () {
    try {
      var p = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (p && typeof p === 'object') {
        var b = blank();
        for (var k in b) if (!(k in p)) p[k] = b[k];
        return p;
      }
    } catch (e) { /* storage blocked or corrupt — start fresh */ }
    return blank();
  })();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch (e) { /* private mode */ }
    try { window.dispatchEvent(new CustomEvent('psgames:update')); } catch (e) { /* old browser */ }
  }
  function gameStats(id) {
    if (!profile.games[id]) profile.games[id] = { best: 0, bestLevel: 0, plays: 0, last: 0 };
    return profile.games[id];
  }

  // Local YYYY-MM-DD (not UTC, so midnight means the player's midnight)
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function yesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); }

  // ─── DAILY CHALLENGE — same pick for everyone on a given date ───
  function dailyChallenge() {
    var key = dayKey();
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    var g = GAMES[h % GAMES.length];
    return { game: g, date: key, done: profile.daily.date === key && profile.daily.done };
  }

  // ─── BADGE UNLOCK ───
  function unlock(id) {
    if (!BADGES[id] || profile.badges[id]) return false;
    profile.badges[id] = Date.now();
    save();
    var b = BADGES[id];
    toast(b.icon + ' Badge unlocked: ' + b.name, { kind: 'badge', sub: b.desc });
    if (window.PSVoice) PSVoice.speak(b.name + '. ' + b.desc);
    sfx('badge');
    return true;
  }

  var VOICE_OPEN = {
    'cosmic-focus': 'Watch the stars, then repeat them.',
    'number-nebula': 'Take your time. The sums can wait.',
    'pattern-galaxy': 'Look for what comes next.',
    'memory-ocean': 'Turn two cards. There is no clock.',
    'rhythm-resonance': 'Listen first. Then answer.',
    'stardust-dash': 'Catch the light. Leave the worries.',
    'solitaire': 'Three peaks, or another game. One card at a time.',
    'night-table': 'Play chips only. Your cards, then the board.',
    'cosmic-connect': 'Turn two cards. Match the sky.',
    'truth-tag': 'Evidence, lived experience, or philosophy. Take your time.'
  };
  function sayOpen(id) {
    if (!window.PSVoice || !VOICE_OPEN[id]) return;
    PSVoice.speak(VOICE_OPEN[id]);
  }

  // ─── SESSION START — call when a run begins. Updates the daily streak. ───
  function startSession(id) {
    var today = dayKey();
    var s = profile.streak;
    var isNewDay = s.last !== today;
    if (isNewDay) {
      s.count = s.last === yesterdayKey() ? s.count + 1 : 1;
      s.last = today;
      save();
      if (s.count > 1) toast('🔥 ' + s.count + ' days in a row! Your brain is showing up for you.', { kind: 'streak' });
    }
    if (s.count >= 3) unlock('streak-3');
    if (s.count >= 7) unlock('streak-7');
    if (s.count >= 30) unlock('streak-30');
    var hr = new Date().getHours();
    if (hr >= 23 || hr < 4) unlock('night-owl');
    if (hr >= 4 && hr < 7) unlock('early-bird');
    sayOpen(id);
    return { streak: s.count, isNewDay: isNewDay };
  }

  // ─── XP ───
  function addXP(n) {
    n = Math.max(0, Math.round(n || 0));
    if (!n) return levelInfo(profile.xp);
    var before = levelInfo(profile.xp).level;
    profile.xp += n;
    var after = levelInfo(profile.xp);
    save();
    if (after.level > before) {
      toast('⭐ Player level ' + after.level + ' — ' + after.title + '!', { kind: 'level' });
      confetti();
      sfx('level');
    }
    if (after.level >= 5) unlock('level-5');
    if (after.level >= 10) unlock('level-10');
    return after;
  }

  // ─── END OF RUN — call once when a run finishes (game over / round done).
  // stats = { score, level, maxCombo }. Returns { isBest, prevBest, xp, daily }.
  function endRun(id, stats) {
    stats = stats || {};
    var score = Math.max(0, Math.round(stats.score || 0));
    var g = gameStats(id);
    var prevBest = g.best;
    var isBest = score > prevBest && score > 0;
    g.plays++;
    g.last = Date.now();
    if (isBest) g.best = score;
    if ((stats.level || 0) > g.bestLevel) g.bestLevel = stats.level;
    save();

    unlock('first-light');
    if (isBest && prevBest > 0) {
      unlock('personal-best');
      toast('🏆 New personal best: ' + score + '!', { kind: 'best', sub: 'Previous: ' + prevBest });
      confetti();
    }
    var combo = stats.maxCombo || 0;
    if (combo >= 5) unlock('combo-5');
    if (combo >= 10) unlock('combo-10');
    if (combo >= 20) unlock('combo-20');
    if ((stats.level || 0) >= 5 && BADGES[id + '-master']) unlock(id + '-master');
    var all = GAMES.every(function (x) { return profile.games[x.id] && profile.games[x.id].plays > 0; });
    if (all) unlock('explorer');

    // XP: square root keeps very different score scales fair between games
    var xp = 10 + Math.round(Math.sqrt(score) * 2) + (isBest ? 25 : 0);
    var daily = false;
    var dc = dailyChallenge();
    if (dc.game.id === id && !dc.done) {
      xp *= 2;
      daily = true;
      profile.daily = { date: dc.date, done: true };
      save();
      toast('🎯 Daily Challenge complete — double XP!', { kind: 'daily' });
      unlock('daily');
    }
    addXP(xp);
    return { isBest: isBest, prevBest: prevBest, xp: xp, daily: daily };
  }

  // award(gameId, score, extra) — one-call end-of-round. extra = { level, maxCombo }.
  // Returns { xp, level, newBest, newBadges: [badge names] }.
  function award(id, score, extra) {
    extra = extra || {};
    var had = {};
    Object.keys(profile.badges).forEach(function (k) { had[k] = 1; });
    var r = endRun(id, { score: score, level: extra.level, maxCombo: extra.maxCombo });
    var names = Object.keys(profile.badges).filter(function (k) { return !had[k] && BADGES[k]; })
      .map(function (k) { return BADGES[k].name; });
    return { xp: r.xp, level: levelInfo(profile.xp).level, newBest: r.isBest, newBadges: names };
  }

  // Combo → score multiplier: ×1, ×2 at 3, ×3 at 6, ×4 at 10+
  function multiplier(combo) {
    return combo >= 10 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1;
  }

  // ─── KIND, FUNNY ONE-LINERS — rotate without repeating back-to-back ───
  var QUIPS = {
    start: [
      'Deep breath in… and let’s play. 🌬️',
      'Phones down, stars up. You’ve got this.',
      'No pressure. The universe is 13.8 billion years old — it can wait.',
      'Warming up the neurons. They said “5 more minutes” but we insisted.',
      'Let’s gently make your brain feel fancy. ✨',
      'Reminder: you showed up. That’s already a win.'
    ],
    correct: [
      'Nailed it! 🌟', 'Brain: 1, Chaos: 0.', 'Look at you go!', 'Stellar work.',
      'Your neurons just high-fived.', 'Smooth as a comet.', 'Chef’s kiss. 🤌',
      'That was so good a star blushed.', 'Galaxy brain activated.', 'Yes! Keep that flow.'
    ],
    combo: [
      'Combo climbing! You’re basically a constellation now.',
      'On fire (the safe, cosy kind). 🔥',
      'Somebody call NASA — we have lift-off!',
      'Flow state unlocked. Don’t think, just glow.',
      'Your focus is louder than your inner critic right now.',
      'Unstoppable. Well, stoppable, but gorgeous.'
    ],
    miss: [
      'Oops — even stars wobble. Go again? 💙',
      'Close! Your brain was just buffering.',
      'Mistakes are how brains grow. Yours is growing beautifully.',
      'No biggie. The moon has phases too.',
      'Plot twist! Shake it off and breathe.',
      'That one was sneaky. Not your fault. Mostly the universe’s.',
      'Gentle reminder: you’re doing better than you think.'
    ],
    levelup: [
      'Level up! Your mind just got a new room. 🏡✨',
      'New level unlocked — the stars are taking notes.',
      'Levelling up like a houseplant finally getting sunlight. 🌱',
      'Brain upgrade installed. No restart needed.',
      'Up you go! Evolution, not erasure.'
    ],
    gameover: [
      'Lovely session. Hydrate, stretch, glow. 💧',
      'Every round counts. Proud of you for playing.',
      'That’s a wrap! Your brain says thanks.',
      'Rest is part of training. Come back whenever.',
      'Not a loss — a warm-up for your next personal best.'
    ],
    best: [
      'NEW PERSONAL BEST! Past you would be amazed. 🏆',
      'You just out-did yesterday’s you. Legend.',
      'Record smashed (gently, respectfully).'
    ]
  };
  var lastQuip = {};
  function quip(kind) {
    var pool = QUIPS[kind] || QUIPS.correct;
    var i;
    do { i = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && i === lastQuip[kind]);
    lastQuip[kind] = i;
    return pool[i];
  }

  // ─── SOFT SOUND (WebAudio — off by default) ───
  var actx = null;
  function audio() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  // Play a soft sine tone. force=true ignores the sound toggle (for sound-based games).
  function tone(freq, dur, opts) {
    opts = opts || {};
    if (!profile.sound && !opts.force) return;
    var ctx = audio();
    if (!ctx) return;
    var t = ctx.currentTime + (opts.delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(opts.volume || 0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.25));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + (dur || 0.25) + 0.05);
  }
  // Pentatonic so every combo note sounds nice together
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  function sfx(name, n) {
    if (!profile.sound) return;
    switch (name) {
      case 'good': tone(PENTA[Math.min(n || 0, PENTA.length - 1)], 0.18); break;
      case 'miss': tone(220, 0.35, { type: 'triangle', volume: 0.08 }); break;
      case 'tap': tone(660, 0.06, { volume: 0.05 }); break;
      case 'level': [0, 2, 4, 5].forEach(function (k, i) { tone(PENTA[k], 0.3, { delay: i * 0.09 }); }); break;
      case 'badge': tone(1318.51, 0.2, { volume: 0.08 }); tone(1567.98, 0.3, { delay: 0.1, volume: 0.08 }); break;
      default: tone(440, 0.15);
    }
  }
  function setSound(on) {
    profile.sound = !!on;
    save();
    if (on) sfx('good', 2);
  }

  // Gentle haptics (mobile only, skipped for reduced motion)
  function buzz(pattern) {
    if (reducedMotion() || !navigator.vibrate) return;
    try { navigator.vibrate(pattern || 12); } catch (e) { /* not allowed */ }
  }

  // ─── INJECTED UI STYLES — toasts, pop-ups, pulses, profile bar ───
  function injectStyles() {
    if (document.getElementById('psg-styles')) return;
    var css = [
      '.psg-toasts{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:4000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:min(92vw,440px);}',
      '.psg-toast{pointer-events:auto;width:100%;padding:12px 18px;border-radius:16px;background:rgba(6,16,28,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(0,255,240,.55);color:#eafffd;font:600 .95rem/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 22px rgba(0,255,240,.18);animation:psgIn .35s cubic-bezier(.2,.9,.3,1.3) both;}',
      '.psg-toast small{display:block;font-weight:500;color:#b9faff;font-size:.82rem;}',
      '.psg-toast.badge,.psg-toast.best{border-color:#ffd700;box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 24px rgba(255,215,0,.3);}',
      '.psg-toast.level,.psg-toast.daily{border-color:#ff00ff;box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 24px rgba(255,0,255,.3);}',
      '.psg-toast.out{animation:psgOut .3s ease forwards;}',
      '@keyframes psgIn{from{opacity:0;transform:translateY(16px) scale(.95);}to{opacity:1;transform:none;}}',
      '@keyframes psgOut{to{opacity:0;transform:translateY(10px);}}',
      '.psg-pop{position:fixed;z-index:3900;pointer-events:none;font:900 1.25rem/1 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#00fff0;text-shadow:0 0 12px rgba(0,255,240,.7),0 2px 4px #000;transform:translate(-50%,-50%);animation:psgPop 1s ease-out forwards;white-space:nowrap;}',
      '.psg-pop.combo{color:#ff7cff;text-shadow:0 0 14px rgba(255,0,255,.8),0 2px 4px #000;font-size:1.45rem;}',
      '.psg-pop.gold{color:#ffd700;text-shadow:0 0 14px rgba(255,215,0,.8),0 2px 4px #000;font-size:1.5rem;}',
      '.psg-pop.miss{color:#ffb3c6;text-shadow:0 0 10px rgba(255,80,120,.6),0 2px 4px #000;}',
      '@keyframes psgPop{0%{opacity:0;transform:translate(-50%,-30%) scale(.6);}15%{opacity:1;transform:translate(-50%,-60%) scale(1.15);}100%{opacity:0;transform:translate(-50%,-180%) scale(1);}}',
      '.psg-pulse-good{animation:psgGood .5s ease-out;}',
      '.psg-pulse-bad{animation:psgBad .5s ease-out;}',
      '.psg-pulse-gold{animation:psgGold .8s ease-out;}',
      '@keyframes psgGood{0%{box-shadow:0 0 0 0 rgba(0,255,240,.7);}100%{box-shadow:0 0 0 22px rgba(0,255,240,0);}}',
      '@keyframes psgBad{0%{box-shadow:0 0 0 0 rgba(255,80,140,.6);}100%{box-shadow:0 0 0 18px rgba(255,80,140,0);}}',
      '@keyframes psgGold{0%{box-shadow:0 0 0 0 rgba(255,215,0,.8);}100%{box-shadow:0 0 0 30px rgba(255,215,0,0);}}',
      '.psg-confetti{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3800;}',
      '.psg-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 18px;padding:10px 12px;border-radius:16px;background:rgba(0,1,3,.45);border:1px solid rgba(0,255,240,.18);font:600 .85rem/1.3 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#eafffd;}',
      '.psg-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;background:rgba(0,255,240,.07);border:1px solid rgba(0,255,240,.2);white-space:nowrap;}',
      '.psg-chip b{color:#00fff0;}',
      '.psg-chip small{color:#b9faff;font-weight:500;}',
      '.psg-xp{flex:1 1 90px;min-width:90px;height:8px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;}',
      '.psg-xp span{display:block;height:100%;background:linear-gradient(90deg,#00fff0,#ff00ff);box-shadow:0 0 10px rgba(0,255,240,.6);transition:width .6s ease;}',
      '.psg-sound{min-height:44px;min-width:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(0,255,240,.45);background:rgba(0,1,3,.6);color:#eafffd;font:inherit;cursor:pointer;margin-left:auto;}',
      '.psg-sound[aria-pressed="true"]{background:rgba(0,255,240,.16);border-color:#00fff0;}',
      '.psg-sound:hover{border-color:#ff00ff;}',
      '.psg-sound:focus-visible{outline:3px solid #00fff0;outline-offset:2px;}',
      '@media (prefers-reduced-motion:reduce){.psg-toast,.psg-toast.out,.psg-pop,.psg-pulse-good,.psg-pulse-bad,.psg-pulse-gold{animation:none!important;}.psg-pop{display:none;}.psg-xp span{transition:none;}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'psg-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── TOASTS (announced politely to screen readers) ───
  var toastBox = null;
  function toast(msg, opts) {
    opts = opts || {};
    if (!document.body) return;
    injectStyles();
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'psg-toasts';
      toastBox.setAttribute('role', 'status');
      toastBox.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastBox);
    }
    var t = document.createElement('div');
    t.className = 'psg-toast ' + (opts.kind || '');
    t.textContent = msg;
    if (opts.sub) {
      var s = document.createElement('small');
      s.textContent = opts.sub;
      t.appendChild(s);
    }
    toastBox.appendChild(t);
    while (toastBox.children.length > 3) toastBox.removeChild(toastBox.firstChild);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, reducedMotion() ? 0 : 320);
    }, opts.ms || 3200);
  }

  // ─── FLOATING SCORE POP-UP — at an element or {x, y} viewport point ───
  function pop(text, at, kind) {
    if (reducedMotion() || !document.body) return;
    injectStyles();
    var x, y;
    if (at && at.getBoundingClientRect) {
      var r = at.getBoundingClientRect();
      x = r.left + r.width / 2; y = r.top + r.height / 2;
    } else if (at) { x = at.x; y = at.y; } else { x = window.innerWidth / 2; y = window.innerHeight / 2; }
    var el = document.createElement('div');
    el.className = 'psg-pop ' + (kind || '');
    el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1050);
  }

  // ─── GLOW PULSE on an element — kind: good | bad | gold (never a shake) ───
  function pulse(el, kind) {
    if (!el || reducedMotion()) return;
    injectStyles();
    var cls = 'psg-pulse-' + (kind || 'good');
    el.classList.remove('psg-pulse-good', 'psg-pulse-bad', 'psg-pulse-gold');
    void el.offsetWidth; // restart the animation
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 820);
  }

  // ─── PARTICLES — one shared DPR-aware overlay canvas ───
  var fx = null;
  function fxLayer() {
    if (fx) return fx;
    injectStyles();
    var c = document.createElement('canvas');
    c.className = 'psg-confetti';
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    fx = { c: c, ctx: c.getContext('2d'), parts: [], raf: 0, dpr: 1 };
    function resize() {
      fx.dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(window.innerWidth * fx.dpr);
      c.height = Math.round(window.innerHeight * fx.dpr);
    }
    resize();
    window.addEventListener('resize', resize);
    return fx;
  }
  function runFx() {
    if (fx.raf) return;
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var ctx = fx.ctx, d = fx.dpr;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, fx.c.width, fx.c.height);
      fx.parts = fx.parts.filter(function (p) {
        p.life -= dt;
        if (p.life <= 0) return false;
        p.vy += p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt;
        ctx.globalAlpha = Math.min(1, p.life / p.max * 1.5);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
        return true;
      });
      ctx.globalAlpha = 1;
      if (fx.parts.length && !document.hidden) fx.raf = requestAnimationFrame(frame);
      else { fx.raf = 0; fx.parts = []; ctx.clearRect(0, 0, fx.c.width, fx.c.height); }
    }
    fx.raf = requestAnimationFrame(frame);
  }
  var COLORS = ['#00fff0', '#ff00ff', '#ffd700', '#a855f7', '#eafffd'];
  // Radial sparkle burst at an element or {x, y} viewport point
  function burst(at, opts) {
    if (typeof at === 'number' && typeof opts === 'number') { at = { x: at, y: opts }; opts = arguments[2]; }
    if (reducedMotion() || !document.body) return;
    opts = opts || {};
    var x, y;
    if (at && at.getBoundingClientRect) {
      var r = at.getBoundingClientRect();
      x = r.left + r.width / 2; y = r.top + r.height / 2;
    } else if (at) { x = at.x; y = at.y; } else { x = window.innerWidth / 2; y = window.innerHeight / 2; }
    var f = fxLayer();
    var n = opts.count || 18;
    var cols = opts.colors || COLORS;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 220;
      f.parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 260, rot: 0, vr: 0,
        size: 3 + Math.random() * 4, color: cols[i % cols.length], life: 0.6 + Math.random() * 0.5, max: 1.1, shape: 'dot' });
    }
    runFx();
  }
  // Celebration confetti from the top of the screen
  function confetti(opts) {
    if (reducedMotion() || !document.body) return;
    opts = opts || {};
    var f = fxLayer();
    var n = opts.count || 90, w = window.innerWidth;
    for (var i = 0; i < n; i++) {
      f.parts.push({ x: Math.random() * w, y: -20 - Math.random() * 120, vx: (Math.random() - 0.5) * 120,
        vy: 80 + Math.random() * 160, g: 120, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10,
        size: 6 + Math.random() * 6, color: COLORS[i % COLORS.length], life: 2.2 + Math.random(), max: 3.2, shape: 'rect' });
    }
    runFx();
  }

  // ─── PROFILE BAR — drop into any game page: PSGames.mountBar(el, 'game-id') ───
  function mountBar(el, id) {
    if (!el) return;
    injectStyles();
    el.classList.add('psg-bar');
    el.innerHTML =
      '<span class="psg-chip" data-psg="lvl"></span>' +
      '<span class="psg-xp" role="progressbar" aria-label="XP to next player level" aria-valuemin="0" aria-valuemax="100"><span></span></span>' +
      '<span class="psg-chip" data-psg="streak"></span>' +
      (id ? '<span class="psg-chip" data-psg="best"></span>' : '') +
      '<button type="button" class="psg-sound" aria-pressed="false"></button>';
    var btn = el.querySelector('.psg-sound');
    btn.addEventListener('click', function () { setSound(!profile.sound); });
    function paint() {
      var li = levelInfo(profile.xp);
      el.querySelector('[data-psg="lvl"]').innerHTML = '⭐ Lv <b>' + li.level + '</b> <small>' + li.title + '</small>';
      var bar = el.querySelector('.psg-xp');
      bar.setAttribute('aria-valuenow', String(li.pct));
      bar.setAttribute('aria-valuetext', li.into + ' of ' + li.need + ' XP');
      bar.firstChild.style.width = li.pct + '%';
      var s = profile.streak;
      var live = s.last === dayKey() || s.last === yesterdayKey();
      el.querySelector('[data-psg="streak"]').innerHTML = '🔥 <b>' + (live ? s.count : 0) + '</b> day streak';
      if (id) el.querySelector('[data-psg="best"]').innerHTML = '🏆 Best <b>' + (gameStats(id).best || 0) + '</b>';
      btn.setAttribute('aria-pressed', profile.sound ? 'true' : 'false');
      btn.textContent = profile.sound ? '🔊 Sound on' : '🔇 Sound off';
    }
    paint();
    window.addEventListener('psgames:update', paint);
  }

  // Keep tabs in sync when another tab saves
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue) return;
    try { profile = JSON.parse(e.newValue); window.dispatchEvent(new CustomEvent('psgames:update')); } catch (err) { /* ignore */ }
  });

  // ─── PUBLIC API ───
  function weekKey() {
    var d = new Date();
    var one = new Date(d.getFullYear(), 0, 1);
    var n = Math.ceil(((d - one) / 86400000 + one.getDay() + 1) / 7);
    return d.getFullYear() + '-W' + n;
  }
  function weeklyChallenge() {
    var key = weekKey();
    var g = GAMES[key.length % GAMES.length];
    if (!profile.weekly) profile.weekly = { key: '', done: false };
    if (profile.weekly.key !== key) { profile.weekly = { key: key, done: false }; save(); }
    return { key: key, game: g, done: profile.weekly.done, reward: 'Week cleared · 40 XP and the Steady Light badge' };
  }
  function markWeekly(id) {
    var w = weeklyChallenge();
    if (w.done || w.game.id !== id) return false;
    profile.weekly.done = true;
    addXP(40);
    unlock('steady-light');
    save();
    return true;
  }

  function record(id, stats) {
    return endRun(id, stats || {});
  }

  window.PSGames = {
    GAMES: GAMES,
    BADGES: BADGES,
    game: game,
    profile: function () { return profile; },
    stats: function (id) { return gameStats(id); },
    best: function (id) { return (profile.games[id] && profile.games[id].best) || 0; },
    levelInfo: levelInfo,
    dailyChallenge: dailyChallenge,
    weeklyChallenge: weeklyChallenge,
    markWeekly: markWeekly,
    record: record,
    startSession: startSession,
    addXP: addXP,
    endRun: endRun,
    award: award,
    unlock: unlock,
    multiplier: multiplier,
    quip: quip,
    tone: tone,
    sfx: sfx,
    setSound: setSound,
    soundOn: function () { return !!profile.sound; },
    buzz: buzz,
    toast: toast,
    pop: pop,
    pulse: pulse,
    burst: burst,
    confetti: confetti,
    mountBar: mountBar,
    reducedMotion: reducedMotion,
    dayKey: dayKey
  };

  // ─── CARD LIST (kids.html → #game-list) ───
  function renderList() {
    var list = document.getElementById('game-list');
    if (!list) return;
    GAMES.forEach(function (g) {
      var card = document.createElement('article');
      card.className = 'cosmic-card game-card';
      var title = document.createElement('h3');
      title.textContent = g.icon + ' ' + g.title;
      var desc = document.createElement('p');
      desc.textContent = g.desc;
      card.append(title, desc);
      var best = window.PSGames.best(g.id);
      if (best) {
        var pb = document.createElement('p');
        pb.textContent = '🏆 Your best: ' + best;
        card.appendChild(pb);
      }
      var link = document.createElement('a');
      link.className = 'btn btn-primary';
      link.href = g.url;
      link.textContent = 'Play Now';
      link.setAttribute('aria-label', 'Play ' + g.title);
      card.appendChild(link);
      list.appendChild(card);
    });
  }

  // ─── GAMES HUB (games.html → #psg-hub) ───
  function renderHub() {
    var hub = document.getElementById('psg-hub');
    if (!hub) return;
    function paint() {
      var li = levelInfo(profile.xp);
      var s = profile.streak;
      var live = s.last === dayKey() || s.last === yesterdayKey();
      var earned = Object.keys(profile.badges).length;
      var total = Object.keys(BADGES).length;
      function set(sel, v) { hub.querySelectorAll(sel).forEach(function (n) { n.textContent = v; }); }
      set('[data-hub="level"]', li.level);
      set('[data-hub="title"]', li.title);
      set('[data-hub="xp"]', li.into + ' / ' + li.need + ' XP');
      set('[data-hub="totalxp"]', profile.xp);
      set('[data-hub="streak"]', live ? s.count : 0);
      set('[data-hub="badges"]', earned + ' / ' + total);
      var bar = hub.querySelector('[data-hub="bar"]');
      if (bar) {
        bar.firstElementChild.style.width = li.pct + '%';
        bar.setAttribute('aria-valuenow', String(li.pct));
        bar.setAttribute('aria-valuetext', li.into + ' of ' + li.need + ' XP to level ' + (li.level + 1));
      }

      // Daily challenge
      var dc = dailyChallenge();
      set('[data-hub="daily-title"]', dc.game.icon + ' ' + dc.game.title);
      set('[data-hub="daily-desc"]', dc.done
        ? 'Done for today — beautiful. A new pick lands at midnight. 🌙'
        : 'Play one round today for double XP. ' + dc.game.desc);
      set('[data-hub="weekly-title"]', 'This week · ' + (weeklyChallenge().game.icon) + ' ' + weeklyChallenge().game.title);
      set('[data-hub="weekly-desc"]', weeklyChallenge().done ? 'Week cleared. The light stays.' : weeklyChallenge().reward);
      var wl = hub.querySelector('[data-hub="weekly-link"]');
      if (wl) { wl.href = weeklyChallenge().game.url; wl.textContent = weeklyChallenge().done ? 'Week done' : 'Take the week'; }
      var dl = hub.querySelector('[data-hub="daily-link"]');
      if (dl) {
        dl.href = dc.game.url;
        dl.textContent = dc.done ? '▶ Play again' : '🎯 Take the challenge';
      }

      // Personal bests on each card
      document.querySelectorAll('[data-game]').forEach(function (card) {
        var id = card.getAttribute('data-game');
        var st = profile.games[id];
        var out = card.querySelector('.game-pb');
        if (out) out.textContent = st && st.plays ? '🏆 Best ' + st.best + ' · ' + st.plays + ' play' + (st.plays === 1 ? '' : 's') : '✨ Not played yet';
        var mb = card.querySelector('.game-mastery');
        if (mb) mb.hidden = !profile.badges[id + '-master'];
        card.classList.toggle('is-daily', id === dc.game.id);
      });

      // Badge cabinet
      var grid = hub.querySelector('[data-hub="badge-grid"]');
      if (grid) {
        grid.innerHTML = '';
        Object.keys(BADGES).forEach(function (bid) {
          var b = BADGES[bid];
          var got = !!profile.badges[bid];
          var li2 = document.createElement('li');
          li2.className = 'psg-badge' + (got ? ' got' : '');
          li2.innerHTML = '<span class="psg-badge-icon" aria-hidden="true"></span><span class="psg-badge-name"></span><span class="psg-badge-desc"></span>';
          li2.children[0].textContent = got ? b.icon : '🔒';
          li2.children[1].textContent = b.name + (got ? '' : ' (locked)');
          li2.children[2].textContent = b.desc;
          grid.appendChild(li2);
        });
      }
      var st = hub.querySelector('[data-hub="sound"]');
      if (st) {
        st.setAttribute('aria-pressed', profile.sound ? 'true' : 'false');
        st.textContent = profile.sound ? '🔊 Game sounds on' : '🔇 Game sounds off';
      }
    }
    var sb = hub.querySelector('[data-hub="sound"]');
    if (sb) sb.addEventListener('click', function () { setSound(!profile.sound); });
    paint();
    window.addEventListener('psgames:update', paint);
  }

  function ready() { renderList(); renderHub(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
