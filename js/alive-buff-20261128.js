/* Pleading Sanity — "feel alive" buff, 28 Nov 2026. No libraries.
   Adds: reading progress line, tactile ripple on buttons and a soft fade-in
   for lazy images. Loaded after the
   page is interactive (idle), so it never blocks rendering. Never touches
   crisis lines, and does nothing heavy under prefers-reduced-motion. */
(function () {
  "use strict";
  if (window.__psBuff20261128) return;
  window.__psBuff20261128 = true;
  var path = (location.pathname || "").replace(/\/+$/, "") || "/";
  // Dola-owned / protected areas: leave completely alone.
  if (/\/(crisis|login|signup|reset-password|app|manifesto)(\.html)?$/i.test(path)) return;
  if (/\/arron[^/]*$/i.test(path) || /^\/music(\/|$)/i.test(path)) return;

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  function calm() { return !!(document.body && document.body.classList.contains("ps-calm")); }

  if (!document.querySelector('link[href="/css/alive-buff-20261128.css"]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/css/alive-buff-20261128.css";
    document.head.appendChild(l);
  }
  if (document.body) document.body.classList.add("ps-buff");

  var CRISIS = ".ps-crisis-footer, .crisis-strip, .ps-crisis, .ps-start-urgent, .arron-crisis, .aa-crisis-persist, [aria-label='Crisis and emergency help'], a[href^='tel:'], a[href^='sms:']";
  function isCrisis(el) { return !!(el && el.closest && el.closest(CRISIS)); }

  // Lazy images: soft fade in once loaded (only images not yet loaded, never above-the-fold eager ones)
  if (!reduce) {
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        if (img.complete || isCrisis(img)) return;
        img.classList.add("ps-buff-img-wait");
        var done = function () {
          img.classList.add("ps-buff-img-in");
          img.classList.remove("ps-buff-img-wait");
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        setTimeout(done, 4000); // never leave an image hidden
      })(imgs[i]);
    }
  }

  if (reduce) return;

  // Reading progress line
  var bar = document.createElement("div");
  bar.id = "ps-buff-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  function paint() {
    ticking = false;
    var d = document.documentElement;
    var max = (d.scrollHeight - innerHeight) || 1;
    var p = Math.max(0, Math.min(1, (window.scrollY || d.scrollTop) / max));
    bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
  }
  addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
  }, { passive: true });
  paint();

  // Tactile ripple on buttons
  var BTN = "a.btn, .btn, a.button, button.button, .cta-button, .btn-amber, .btn-primary, .cr-btn, .sbtn, .pill, .ps-ask, .mc-download, button";
  document.addEventListener("pointerdown", function (ev) {
    if (calm() || ev.button > 0) return;
    var t = ev.target && ev.target.closest ? ev.target.closest(BTN) : null;
    if (!t || t.disabled || isCrisis(t) || t.classList.contains("ps-theme")) return;
    var cs = getComputedStyle(t);
    if (cs.display === "none" || cs.display === "contents") return;
    if (!t.classList.contains("ps-buff-rip-host")) {
      if (cs.position !== "static" && cs.position !== "relative") return; // never move floating/fixed buttons
      if (t.scrollWidth > t.clientWidth + 1 || t.scrollHeight > t.clientHeight + 1) return; // never clip content
      var kids = t.querySelectorAll("*");
      for (var k = 0; k < kids.length && k < 24; k++) {
        var kp = getComputedStyle(kids[k]).position;
        if (kp === "absolute" || kp === "fixed") return; // badges/tooltips keep their anchor
      }
      t.classList.add("ps-buff-rip-host");
    }
    var r = t.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var s = document.createElement("span");
    s.className = "ps-buff-ripple";
    s.setAttribute("aria-hidden", "true");
    s.style.setProperty("--ps-rip-size", size + "px");
    s.style.setProperty("--ps-rip-x", (ev.clientX - r.left) + "px");
    s.style.setProperty("--ps-rip-y", (ev.clientY - r.top) + "px");
    t.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 700);
    if (ev.pointerType === "touch" && navigator.vibrate) { try { navigator.vibrate(6); } catch (e) {} }
  }, { passive: true });

})();
