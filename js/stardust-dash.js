// Stardust Dash — catch stars, dodge silly worries. Canvas, DPR-aware, keyboard + touch.
(function () {
  'use strict';
  var GID = 'stardust-dash', PS = window.PSGames;
  var W = 360, H = 480; // logical playfield
  var cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  var stage = document.getElementById('stage'), overlay = document.getElementById('overlay');
  var elScore = document.getElementById('score'), elLives = document.getElementById('lives'), elCombo = document.getElementById('combo');
  var elStatus = document.getElementById('status'), startBtn = document.getElementById('startBtn'), pauseBtn = document.getElementById('pauseBtn');
  var ovTitle = document.getElementById('ovTitle'), ovText = document.getElementById('ovText');
  var reduced = PS.reducedMotion();
  try { document.getElementById('yr').textContent = new Date().getFullYear(); } catch (e) { /* no-op */ }
  PS.mountBar(document.getElementById('psBar'), GID);

  var THOUGHTS = ['Did I leave the oven on?', 'Replying “you too” to the waiter', 'Did I reply-all?', 'That thing I said in 2009',
    'Is everyone staring?', 'Why did I wave back at no one?', 'Forgot why I walked in here', 'One more tab can’t hurt',
    'Was that email rude?', 'Is today Tuesday?', 'Accidentally liked a 2014 photo', 'Did I mute myself?', 'What if the wifi dies?',
    'Everyone heard my stomach'];
  var HIT_QUIPS = ['Worry dodged… nearly.', 'Oof. Brains do that.', 'Just a silly thought. It floats away.', 'Shake it off, stardust.'];

  var dpr = 1, k = 1, running = false, paused = false, over = false, last = 0, raf = 0;
  var st, keys = { l: false, r: false }, pointerX = null;
  var stars = []; // background
  for (var i = 0; i < 40; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.6 + .4, v: 8 + Math.random() * 20 });

  function fresh() {
    return { x: W / 2, y: H - 52, score: 0, lives: 3, combo: 0, max: 0, t: 0, spawn: 0.6, items: [], hurt: 0, caught: 0 };
  }
  st = fresh();

  function resize() {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    k = r.width / W;
    ctx.setTransform(dpr * k, 0, 0, dpr * (r.height / H), 0, 0);
    if (!running) draw();
  }
  window.addEventListener('resize', resize);

  function say(msg) { elStatus.textContent = msg; }
  function hud() {
    elScore.textContent = st.score;
    var h = ''; for (var i = 0; i < 3; i++) h += i < st.lives ? '♥' : '♡';
    elLives.textContent = h; elLives.setAttribute('aria-label', st.lives + ' lives');
    elCombo.textContent = '×' + PS.multiplier(st.combo) + (st.combo > 1 ? ' (' + st.combo + ')' : '');
  }

  function speedNow() {
    var cap = reduced ? 230 : 340;
    return Math.min(cap, 105 + st.t * 4);
  }
  function addItem() {
    var r = Math.random(), it = { y: -30, rot: Math.random() * 6 };
    if (r < 0.04 && st.lives < 3) { it.type = 'heart'; it.w = 26; }
    else if (r < 0.5) { it.type = 'star'; it.w = 28; }
    else {
      it.type = 'thought'; it.text = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)];
      ctx.font = '600 13px system-ui,sans-serif';
      it.w = Math.min(W - 16, ctx.measureText(it.text).width + 22);
    }
    it.x = 8 + it.w / 2 + Math.random() * (W - 16 - it.w);
    it.v = speedNow() * (0.85 + Math.random() * 0.3);
    st.items.push(it);
  }

  function update(dt) {
    st.t += dt;
    var sp = 330;
    if (keys.l) st.x -= sp * dt;
    if (keys.r) st.x += sp * dt;
    if (pointerX !== null) st.x += (pointerX - st.x) * Math.min(1, dt * 18);
    st.x = Math.max(24, Math.min(W - 24, st.x));
    st.hurt = Math.max(0, st.hurt - dt);
    st.spawn -= dt;
    if (st.spawn <= 0) { addItem(); st.spawn = Math.max(0.28, 0.85 - st.t * 0.01) * (0.7 + Math.random() * 0.6); }
    for (var i = st.items.length - 1; i >= 0; i--) {
      var it = st.items[i];
      it.y += it.v * dt; it.rot += dt * 2;
      var h = it.type === 'thought' ? 26 : 26;
      var hitY = Math.abs(it.y - st.y) < (h / 2 + 16);
      var hitX = Math.abs(it.x - st.x) < (it.w / 2 + 16 - (it.type === 'thought' ? 6 : 0));
      if (hitY && hitX) {
        st.items.splice(i, 1);
        if (it.type === 'thought') {
          if (st.hurt <= 0) {
            st.lives--; st.combo = 0; st.hurt = 1.2; hud();
            PS.sfx('miss'); PS.buzz(40);
            if (st.lives > 0) { say(HIT_QUIPS[Math.floor(Math.random() * HIT_QUIPS.length)] + ' ' + st.lives + ' ' + (st.lives === 1 ? 'life' : 'lives') + ' left.'); }
            else { return endGame(); }
          }
        } else if (it.type === 'heart') {
          st.lives = Math.min(3, st.lives + 1); hud(); say('A kind thought! +1 life 💙'); PS.pop('+1 ♥', pt(it.x, it.y), 'gold'); PS.sfx('level');
        } else {
          st.combo++; st.max = Math.max(st.max, st.combo); st.caught++;
          var m = PS.multiplier(st.combo), gain = 10 * m;
          st.score += gain; hud();
          var p = pt(it.x, it.y);
          PS.pop('+' + gain + (m > 1 ? ' ×' + m : ''), p, m > 1 ? 'combo' : '');
          PS.burst(p.x, p.y, { count: m > 1 ? 22 : 10 });
          PS.sfx('good', Math.min(7, st.combo));
          if (st.combo === 5 || st.combo === 10 || st.combo === 20) say(st.combo + ' in a row! ' + PS.quip('combo'));
        }
      } else if (it.y > H + 40) {
        st.items.splice(i, 1);
        if (it.type === 'star' && st.combo > 0) { st.combo = 0; hud(); }
      }
    }
  }
  function pt(x, y) { var r = cv.getBoundingClientRect(); return { x: r.left + x * r.width / W, y: r.top + y * r.height / H }; }

  function starPath(x, y, r, rot) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function rrect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    stars.forEach(function (s) { ctx.globalAlpha = .35 + s.s / 4; ctx.fillRect(s.x, s.y, s.s, s.s); });
    ctx.globalAlpha = 1;
    st.items.forEach(function (it) {
      if (it.type === 'star') {
        ctx.save(); ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 14; ctx.fillStyle = '#ffd700';
        starPath(it.x, it.y, 14, reduced ? 0 : it.rot * 0.5); ctx.fill(); ctx.restore();
      } else if (it.type === 'heart') {
        ctx.save(); ctx.shadowColor = '#00fff0'; ctx.shadowBlur = 12; ctx.fillStyle = '#00fff0'; ctx.font = '26px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♥', it.x, it.y); ctx.restore();
      } else {
        ctx.save(); ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 10;
        rrect(it.x - it.w / 2, it.y - 13, it.w, 26, 13);
        ctx.fillStyle = 'rgba(30,8,48,.92)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#ff00ff'; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffd9ff'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(it.text, it.x, it.y + 1, it.w - 12); ctx.restore();
      }
    });
    // player: glowing orb
    var blink = st.hurt > 0 && Math.floor(st.hurt * 10) % 2 === 0;
    if (!blink) {
      ctx.save(); ctx.shadowColor = '#00fff0'; ctx.shadowBlur = 20;
      var g = ctx.createRadialGradient(st.x - 5, st.y - 5, 2, st.x, st.y, 18);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#00fff0'); g.addColorStop(1, '#ff00ff');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(st.x, st.y, 16, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#000103'; ctx.fillRect(st.x - 6, st.y - 4, 3, 5); ctx.fillRect(st.x + 3, st.y - 4, 3, 5);
      ctx.fillRect(st.x - 5, st.y + 5, 10, 2);
    }
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    if (!running || paused) return;
    if (!reduced) stars.forEach(function (s) { s.y += s.v * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
    update(dt);
    if (running) draw();
  }

  function showOverlay(title, text, btn) {
    ovTitle.textContent = title; ovText.textContent = text; startBtn.textContent = btn;
    overlay.hidden = false; startBtn.focus({ preventScroll: true });
  }
  function start() {
    st = fresh(); over = false; running = true; paused = false; pointerX = null;
    PS.startSession(GID);
    overlay.hidden = true; pauseBtn.disabled = false; pauseBtn.textContent = '⏸ Pause';
    hud(); say(PS.quip('start')); cv.focus && cv.blur(); last = performance.now();
  }
  function endGame() {
    running = false; over = true; pauseBtn.disabled = true;
    var r = PS.award(GID, st.score, { level: Math.floor(st.t / 16) + 1, maxCombo: st.max });
    draw();
    var extra = (r.newBest ? ' New personal best!' : '') + (r.newBadges.length ? ' Badge: ' + r.newBadges.join(', ') + '.' : '');
    say('Round over. Score ' + st.score + ', best combo ' + st.max + '. +' + r.xp + ' XP.' + extra);
    showOverlay(r.newBest ? '🏆 New best!' : 'Round complete', 'Score ' + st.score + ' · Best combo ' + st.max + ' · +' + r.xp + ' XP. ' + PS.quip('gameover'), '🔁 Dash again');
  }
  function setPause(p) {
    if (!running || over) return;
    paused = p; pauseBtn.textContent = p ? '▶ Resume' : '⏸ Pause';
    if (p) { say('Paused. Take a breath. 💙'); showOverlay('Paused', 'Breathe in… and out. Resume whenever you are ready.', '▶ Resume'); }
    else { overlay.hidden = true; last = performance.now(); say('Back in the dash!'); }
  }

  startBtn.addEventListener('click', function () { if (paused) setPause(false); else start(); });
  pauseBtn.addEventListener('click', function () { setPause(!paused); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && running && !paused) setPause(true); });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.key;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') { keys.l = true; if (running) e.preventDefault(); }
    else if (key === 'ArrowRight' || key === 'd' || key === 'D') { keys.r = true; if (running) e.preventDefault(); }
    else if ((key === 'p' || key === 'P' || key === 'Escape') && running) { setPause(key === 'Escape' ? true : !paused); }
    else if (key === ' ' && running && document.activeElement && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); setPause(!paused); }
    if (running && !paused) pointerX = null;
  });
  document.addEventListener('keyup', function (e) {
    var key = e.key;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') keys.l = false;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') keys.r = false;
  });
  window.addEventListener('blur', function () { keys.l = keys.r = false; });

  // pointer / touch drag on the canvas
  function px(e) { var r = cv.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; }
  cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); pointerX = px(e); e.preventDefault(); });
  cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') pointerX = px(e); });
  function drop() { pointerX = null; }
  cv.addEventListener('pointerup', drop); cv.addEventListener('pointercancel', drop);

  // on-screen hold buttons
  [['leftBtn', 'l'], ['rightBtn', 'r']].forEach(function (p) {
    var b = document.getElementById(p[0]);
    b.addEventListener('pointerdown', function (e) { keys[p[1]] = true; pointerX = null; e.preventDefault(); });
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (ev) { b.addEventListener(ev, function () { keys[p[1]] = false; }); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { keys[p[1]] = true; e.preventDefault(); } });
    b.addEventListener('keyup', function (e) { if (e.key === 'Enter' || e.key === ' ') keys[p[1]] = false; });
  });

  resize(); hud();
  raf = requestAnimationFrame(frame);
})();
