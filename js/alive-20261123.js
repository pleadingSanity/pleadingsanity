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

  function injectCss() {
    if (document.querySelector('link[href="/css/alive-20261123.css"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/css/alive-20261123.css";
    document.head.appendChild(l);
  }
  injectCss();

  if (reduce) return;

  if (!document.getElementById("ps-alive-stars")) {
    var layer = document.createElement("div");
    layer.id = "ps-alive-stars";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<span class="ps-alive-stars-a"></span><span class="ps-alive-stars-b"></span>';
    document.body.insertBefore(layer, document.body.firstChild);
  }

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
