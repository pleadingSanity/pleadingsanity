/* Pleading Sanity — new-gen alive motion, 23 Nov 2026. No libraries. */
(function () {
  "use strict";
  var path = (location.pathname || "").replace(/\/+$/, "") || "/";
  if (/\/(crisis|login|signup|reset-password)(\.html)?$/i.test(path)) return;

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}
  if (document.body && document.body.classList.contains("ps-calm")) reduce = true;

  document.documentElement.classList.add("ps-alive");
  if (document.body) document.body.classList.add("ps-alive");

  if (!document.querySelector('link[href="/css/alive-20261123.css"]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/css/alive-20261123.css";
    document.head.appendChild(l);
  }
  [["orbitron-latin-700","Orbitron"],["exo2-latin-600","Exo 2"]].forEach(function (p) {
    var href = "/assets/fonts/" + p[0] + ".woff2";
    if (document.querySelector('link[href="' + href + '"]')) return;
    var pl = document.createElement("link");
    pl.rel = "preload";
    pl.as = "font";
    pl.type = "font/woff2";
    pl.crossOrigin = "anonymous";
    pl.href = href;
    document.head.appendChild(pl);
  });

  var layer = document.getElementById("ps-alive-stars");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "ps-alive-stars";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<span class="ps-alive-stars-a"></span><span class="ps-alive-stars-b"></span>';
    (document.body || document.documentElement).insertBefore(layer, document.body.firstChild);
  }

  if (!reduce && typeof requestAnimationFrame === "function") {
    function startWarp() {
      if (document.getElementById("ps-alive-warp")) return;
      try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      } catch (e) {}
      if (document.body && document.body.classList.contains("ps-calm")) return;
      var c = document.createElement("canvas");
      c.id = "ps-alive-warp";
      c.setAttribute("aria-hidden", "true");
      layer.appendChild(c);
      var ctx = c.getContext("2d", { alpha: true });
      var mobile = (Math.min(screen.width, screen.height) < 760) || /Mobi|Android/i.test(navigator.userAgent || "");
      var n = mobile ? 64 : 120;
      var gap = 1000 / (mobile ? 30 : 45);
      var cols = ["rgba(0,255,240,", "rgba(236,242,247,", "rgba(192,200,210,", "rgba(245,158,11,"];
      var S = [];
      function birth(s, fresh) {
        s.x = Math.random() * 2 - 1;
        s.y = Math.random() * 2 - 1;
        s.z = fresh ? Math.random() * 0.85 + 0.12 : 1;
        s.p = s.z;
        s.c = Math.random() < 0.07 ? 3 : Math.random() < 0.45 ? 0 : Math.random() < 0.72 ? 1 : 2;
      }
      for (var i = 0; i < n; i++) { var s = {}; birth(s, 1); S.push(s); }
      var w = 0, h = 0, cx = 0, cy = 0, last = 0, hid = false, raf = 0;
      function size() {
        var r = Math.min(window.devicePixelRatio || 1, 1.25);
        w = layer.clientWidth || innerWidth;
        h = layer.clientHeight || innerHeight;
        c.width = Math.max(1, w * r);
        c.height = Math.max(1, h * r);
        c.style.width = w + "px";
        c.style.height = h + "px";
        ctx.setTransform(r, 0, 0, r, 0, 0);
        cx = w / 2;
        cy = h / 2;
      }
      size();
      addEventListener("resize", size, { passive: true });
      document.addEventListener("visibilitychange", function () {
        hid = document.hidden;
        if (hid) { if (raf) cancelAnimationFrame(raf); raf = 0; }
        else { last = 0; raf = requestAnimationFrame(tick); }
      });
      function tick(t) {
        if (hid) return;
        raf = requestAnimationFrame(tick);
        if (t - last < gap) return;
        last = t;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < n; i++) {
          var s = S[i];
          s.p = s.z;
          s.z -= 0.0017;
          if (s.z < 0.05) birth(s, 0);
          var x = s.x / s.z * cx + cx, y = s.y / s.z * cy + cy;
          var px = s.x / s.p * cx + cx, py = s.y / s.p * cy + cy;
          var a = (1 - s.z) * 0.62;
          ctx.strokeStyle = cols[s.c] + a + ")";
          ctx.lineWidth = (1 - s.z) * 1.1 + 0.2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(tick);
    }
    function kickWarp() {
      if (typeof requestIdleCallback === "function") requestIdleCallback(startWarp, { timeout: 2000 });
      else setTimeout(startWarp, 0);
    }
    if (document.readyState === "complete") kickWarp();
    else window.addEventListener("load", kickWarp, { once: true });
  }

  if (reduce) return;

  function isCrisis(el) {
    if (!el || !el.closest) return false;
    if (el.closest(".ps-crisis-footer, .arron-crisis, .arron-crisis-banner, .aa-crisis-persist, .ps-start-urgent, [aria-label='Crisis and emergency help']")) return true;
    return false;
  }

  var nodes = document.querySelectorAll(
    ".card, .tool-card, .hp-card, .game-card, .ps-card, .sx-card, .finance-card, .door, .mc-card, article.card, .ps-discover, .collection-grid, .solar-kit"
  );
  if (!("IntersectionObserver" in window) || !nodes.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("ps-alive-in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  nodes.forEach(function (el) {
    if (isCrisis(el)) return;
    if (el.closest("header.hero, .ps-legacy-hero, .ps-hero-visual, .shop-hero, .finance-hero, .st-hero, .arron-head, .mc-hero")) return;
    el.classList.add("ps-alive-reveal");
    io.observe(el);
  });
})();
