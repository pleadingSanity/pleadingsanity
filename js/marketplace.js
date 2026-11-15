/* =====================================================
   PLEADING SANITY — CREATOR MARKETPLACE
   Seed listings + grid/filter/detail-modal logic +
   seller profile-shop injection. Pure vanilla JS, no
   backend at this stage. Classic script (not a module)
   so it can load on marketplace.html and profile.html.
   Exposes window.PSMarketplace.
   - Brand: cosmic dark bg, teal (#00fff0) + amber.
   - No emoji. Inline SVG icons only. No purple/indigo.
   - Platform fee: 5% of each sale (transparent).
   - Survival category requires UK-rooted seller.
===================================================== */
(function () {
  'use strict';

  /* ---------- Seed listings (9 sample, 3 categories) ---------- */
  var LISTINGS = [
    { id: 'lst-001', sellerId: 'shane-cooper', sellerName: 'Shane Cooper',
      title: 'Signed "Rise From Madness" Art Print (A3)',
      description: 'Limited-run A3 giclée print, signed and numbered. Printed on recycled stock in Leicestershire. Ships flat, UK first.',
      priceGBP: 25, category: 'physical', ukRooted: true, digital: false },
    { id: 'lst-002', sellerId: 'shane-cooper', sellerName: 'Shane Cooper',
      title: 'Survival Journal — Linen-bound Hardcover',
      description: '200-page lay-flat hardcover with prompts, mood trackers and blank pages. Made in the UK.',
      priceGBP: 18, category: 'physical', ukRooted: true, digital: false },
    { id: 'lst-003', sellerId: 'arron-voice', sellerName: 'Arron Voice Pack',
      title: 'Calm Sleep Story Bundle (MP3, 4 stories)',
      description: 'Four original sleep stories read in a calm voice. Instant digital download. No subscription.',
      priceGBP: 9, category: 'digital', ukRooted: true, digital: true },
    { id: 'lst-004', sellerId: 'arron-voice', sellerName: 'Arron Voice Pack',
      title: 'Breathing Exercise Audio Pack (MP3)',
      description: 'Box breathing, 4-7-8 and body scan guides — 10 to 20 minutes each. Digital download.',
      priceGBP: 5, category: 'digital', ukRooted: true, digital: true },
    { id: 'lst-005', sellerId: 'mindful-maker', sellerName: 'Mindful Maker UK',
      title: 'Hand-poured Lavender Soy Candle',
      description: 'Small-batch soy wax candle, lavender and cedar, 40hr burn. Poured in Devon, UK.',
      priceGBP: 12, category: 'physical', ukRooted: true, digital: false },
    { id: 'lst-006', sellerId: 'survival-steve', sellerName: 'Survival Steve (UK)',
      title: 'UK Wild Camping & Foraging Guide (PDF)',
      description: 'UK-specific: legal access, seasonal foraging, leave-no-trace, kit list. 60-page illustrated PDF.',
      priceGBP: 15, category: 'survival', ukRooted: true, digital: true },
    { id: 'lst-007', sellerId: 'survival-steve', sellerName: 'Survival Steve (UK)',
      title: 'Beginner Bushcraft Course (Online, 4 weeks)',
      description: 'Live weekly sessions + recordings. UK-based instructor. Knife safety, fire, shelter, water. 18+.',
      priceGBP: 49, category: 'survival', ukRooted: true, digital: true },
    { id: 'lst-008', sellerId: 'cosmic-crafter', sellerName: 'Cosmic Crafter',
      title: 'Teal Agate Worry Stone',
      description: 'Polished teal agate thumb stone in a cotton pouch. Ships worldwide from EU stock.',
      priceGBP: 8, category: 'physical', ukRooted: false, digital: false },
    { id: 'lst-009', sellerId: 'word-weaver', sellerName: 'Word Weaver',
      title: 'Poetry Zine: "Quiet at 3am" (Digital PDF)',
      description: '24-page original poetry zine about night thoughts and recovery. Instant download.',
      priceGBP: 4, category: 'digital', ukRooted: false, digital: true }
  ];

  var PLATFORM_FEE_PCT = 5;

  /* ---------- Inline SVG icons (no emoji) ---------- */
  var ICON = {
    shopBag: '<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    physical: '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    digital: '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    survival: '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'
  };

  /* UK Rooted badge — Union Jack-inspired, teal + amber, no emoji */
  function ukRootedBadge() {
    return '<span class="psm-uk-badge" title="UK Rooted — seller based in UK or item ships from UK" aria-label="UK Rooted">' +
      '<svg viewBox="0 0 32 20" aria-hidden="true" width="26" height="16">' +
        '<rect width="32" height="20" rx="3" fill="#0d1b2a" stroke="#00fff0" stroke-width="1.2"/>' +
        '<path d="M0 0 L32 20 M32 0 L0 20" stroke="#00fff0" stroke-width="2.4" opacity="0.85"/>' +
        '<path d="M16 0 V20 M0 10 H32" stroke="#f59e0b" stroke-width="2.2"/>' +
        '<circle cx="16" cy="10" r="2.4" fill="#f59e0b"/>' +
      '</svg>' +
      '<span>UK Rooted</span></span>';
  }

  function categoryBadge(cat) {
    var label = { physical: 'Physical', digital: 'Digital', survival: 'Survival' }[cat] || cat;
    var icon = ICON[cat] || ICON.physical;
    return '<span class="psm-cat-badge psm-cat-' + cat + '">' + icon + '<span>' + label + '</span></span>';
  }

  /* Listing image placeholder — inline SVG, brand colors, no hotlinking */
  function listingImage(l) {
    var bg = { physical: '#0d1b2a', digital: '#0a1f2e', survival: '#1a1408' }[l.category] || '#0d1b2a';
    var accent = l.category === 'survival' ? '#f59e0b' : '#00fff0';
    var icon = ICON[l.category] || ICON.physical;
    return '<div class="psm-card-img" role="img" aria-label="' + esc(l.title) + ' — product image placeholder" ' +
      'style="background:radial-gradient(circle at 30% 20%, rgba(0,255,240,.18), transparent 55%), ' + bg + '">' +
      '<span class="psm-img-icon" style="color:' + accent + '">' + icon + '</span>' +
      '<span class="psm-img-label">' + (l.digital ? 'Digital' : 'Physical') + '</span>' +
    '</div>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtPrice(p) { return '£' + Number(p).toFixed(2); }

  /* ---------- Listing card ---------- */
  function cardHTML(l) {
    return '<article class="psm-card" data-id="' + l.id + '" tabindex="0" role="button" ' +
      'aria-label="View details: ' + esc(l.title) + ', price ' + fmtPrice(l.priceGBP) + '">' +
      listingImage(l) +
      '<div class="psm-card-body">' +
        '<div class="psm-card-badges">' + categoryBadge(l.category) + (l.ukRooted ? ukRootedBadge() : '') + '</div>' +
        '<h3 class="psm-card-title">' + esc(l.title) + '</h3>' +
        '<p class="psm-card-price">' + fmtPrice(l.priceGBP) + '</p>' +
        '<a class="psm-seller-link" href="/profile.html?seller=' + encodeURIComponent(l.sellerId) + '#shop" ' +
        'onclick="event.stopPropagation()" aria-label="View seller profile: ' + esc(l.sellerName) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        esc(l.sellerName) + '</a>' +
      '</div></article>';
  }

  /* ---------- Filters + grid (marketplace page) ---------- */
  var currentFilter = 'all';
  var gridEl = null;

  function filteredListings() {
    if (currentFilter === 'all') return LISTINGS;
    if (currentFilter === 'uk') return LISTINGS.filter(function (l) { return l.ukRooted; });
    return LISTINGS.filter(function (l) { return l.category === currentFilter; });
  }

  function renderGrid() {
    if (!gridEl) return;
    var items = filteredListings();
    var countEl = document.getElementById('psm-count');
    if (countEl) countEl.textContent = items.length + ' listing' + (items.length === 1 ? '' : 's');
    if (!items.length) {
      gridEl.innerHTML = '<p class="psm-empty">No listings in this category yet. Be the first to sell.</p>';
      return;
    }
    gridEl.innerHTML = items.map(cardHTML).join('');
    Array.prototype.forEach.call(gridEl.querySelectorAll('.psm-card'), function (card) {
      var open = function () { openDetail(card.getAttribute('data-id')); };
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }

  function setFilter(f, btn) {
    currentFilter = f;
    var buttons = document.querySelectorAll('.psm-filter-btn');
    Array.prototype.forEach.call(buttons, function (b) {
      var active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderGrid();
  }

  function initFilters() {
    var buttons = document.querySelectorAll('.psm-filter-btn');
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () { setFilter(b.getAttribute('data-filter'), b); });
    });
  }

  /* ---------- Detail modal + payment ---------- */
  var modalEl = null;
  var lastFocused = null;

  function closeModal() {
    if (!modalEl) return;
    modalEl.remove();
    modalEl = null;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) { try { lastFocused.focus(); } catch (e) {} }
    document.removeEventListener('keydown', modalKeydown);
  }

  function modalKeydown(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab' && modalEl) {
      var focusables = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function openDetail(id) {
    var l = null;
    for (var i = 0; i < LISTINGS.length; i++) { if (LISTINGS[i].id === id) { l = LISTINGS[i]; break; } }
    if (!l) return;
    lastFocused = document.activeElement;
    if (modalEl) closeModal();

    var fee = (l.priceGBP * PLATFORM_FEE_PCT / 100);
    var sellerGets = l.priceGBP - fee;

    modalEl = document.createElement('div');
    modalEl.className = 'psm-modal-overlay';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-labelledby', 'psm-modal-title');
    modalEl.innerHTML =
      '<div class="psm-modal" role="document">' +
        '<button type="button" class="psm-modal-close" aria-label="Close details">' + ICON.close + '</button>' +
        listingImage(l) +
        '<div class="psm-modal-body">' +
          '<div class="psm-card-badges">' + categoryBadge(l.category) + (l.ukRooted ? ukRootedBadge() : '') + '</div>' +
          '<h2 id="psm-modal-title" class="psm-modal-title">' + esc(l.title) + '</h2>' +
          '<p class="psm-modal-seller">Sold by <a href="/profile.html?seller=' + encodeURIComponent(l.sellerId) + '#shop">' + esc(l.sellerName) + '</a></p>' +
          '<p class="psm-modal-price">' + fmtPrice(l.priceGBP) + (l.digital ? ' <span class="psm-digital-note">· instant digital download</span>' : '') + '</p>' +
          '<p class="psm-modal-desc">' + esc(l.description) + '</p>' +
          '<div class="psm-fee-note">Platform fee ' + PLATFORM_FEE_PCT + '%: on a ' + fmtPrice(l.priceGBP) + ' sale, seller receives ' + fmtPrice(sellerGets) + ', platform ' + fmtPrice(fee) + '. Investors share in platform revenue.</div>' +
          '<div class="psm-pay-area" id="psm-pay-area">' +
            '<p class="psm-pay-label">Pay securely</p>' +
            '<div id="psm-paypal-container" class="psm-paypal-container" aria-live="polite">Loading PayPal…</div>' +
            '<div class="psm-stripe-placeholder" role="note">' +
              '<strong>Stripe coming soon</strong> — API key needed from Shane. PayPal is available now.' +
            '</div>' +
            '<p class="psm-pay-note">By purchasing you agree to the seller terms. 5% platform fee applies. Seller will fulfil your order.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);
    document.body.style.overflow = 'hidden';

    modalEl.querySelector('.psm-modal-close').addEventListener('click', closeModal);
    modalEl.addEventListener('click', function (e) { if (e.target === modalEl) closeModal(); });
    document.addEventListener('keydown', modalKeydown);
    setTimeout(function () { var c = modalEl && modalEl.querySelector('.psm-modal-close'); if (c) c.focus(); }, 30);

    renderPayPal(l);
  }

  function renderPayPal(l) {
    var container = document.getElementById('psm-paypal-container');
    if (!container) return;
    function showFallback() {
      container.innerHTML = '<p class="psm-paypal-fallback">PayPal could not load (may be blocked in this browser). ' +
        'Stripe is coming soon — API key needed from Shane. Your order was not placed.</p>';
    }
    function doRender() {
      if (!window.paypal || !paypal.Buttons) { showFallback(); return; }
      container.innerHTML = '';
      try {
        paypal.Buttons({
          style: { layout: 'vertical', shape: 'pill', color: 'gold', label: 'pay' },
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [{
                description: l.title + ' — ' + l.sellerName,
                amount: { currency_code: 'GBP', value: Number(l.priceGBP).toFixed(2) }
              }]
            });
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              var payer = (details.payer && details.payer.name && details.payer.name.given_name) || 'friend';
              document.getElementById('psm-pay-area').innerHTML =
                '<div class="psm-thanks" role="status">' +
                  '<span class="psm-thanks-icon" aria-hidden="true">' + ICON.check + '</span>' +
                  '<h3>Thank you, ' + esc(payer) + '</h3>' +
                  '<p>Payment received for <strong>' + esc(l.title) + '</strong>. A ' + PLATFORM_FEE_PCT + '% platform fee applies. ' +
                  'The seller (' + esc(l.sellerName) + ') will fulfil your order' + (l.digital ? ' — your digital download link is on its way' : '') + '.</p>' +
                  '<button type="button" class="ps-btn ps-btn-primary ps-btn-sm" onclick="document.querySelector(\'.psm-modal-close\').click()">Close</button>' +
                '</div>';
            });
          },
          onError: function () { showFallback(); }
        }).render('#psm-paypal-container').catch(function () { showFallback(); });
      } catch (e) { showFallback(); }
    }
    if (window.paypal && paypal.Buttons) { doRender(); }
    else {
      var waited = 0;
      var iv = setInterval(function () {
        waited += 200;
        if (window.paypal && paypal.Buttons) { clearInterval(iv); doRender(); }
        else if (waited > 6000) { clearInterval(iv); showFallback(); }
      }, 200);
    }
  }

  /* ---------- Listing-create mock (survival requires UK Rooted) ---------- */
  function initCreateForm() {
    var form = document.getElementById('psm-create-form');
    if (!form) return;
    var msg = document.getElementById('psm-create-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var cat = form.category.value;
      var uk = form.ukRooted.checked;
      if (cat === 'survival' && !uk) {
        msg.className = 'psm-create-msg err';
        msg.textContent = 'Survival gear, guides and courses are accepted ONLY from UK-rooted sellers (seller based in UK OR items ship from UK). Tick "UK Rooted" or choose another category.';
        msg.setAttribute('role', 'alert');
        return;
      }
      msg.className = 'psm-create-msg ok';
      msg.setAttribute('role', 'status');
      msg.textContent = 'Listing draft saved (mock — backend listing creation coming soon). Sellers choose what to list — as long as it\'s legal.';
    });
  }

  /* ---------- Seller profile shop (compact section) ---------- */
  function renderProfileShop(container, sellerId, sellerName) {
    if (!container) return;
    var items = LISTINGS.filter(function (l) { return l.sellerId === sellerId; });
    var section = document.createElement('section');
    section.className = 'panel psm-profile-shop';
    section.id = 'shop';
    section.setAttribute('aria-labelledby', 'psm-shop-title');
    var inner = '<h2 id="psm-shop-title" class="psm-shop-heading">' + ICON.shopBag + ' Shop' + (sellerName ? ' — ' + esc(sellerName) : '') + '</h2>';
    if (!items.length) {
      inner += '<p class="muted">No marketplace listings yet from this seller.</p>' +
        '<div class="btn-row"><a class="sbtn primary" href="/marketplace.html#sell">Sell on Pleading Sanity</a>' +
        '<a class="sbtn ghost" href="/marketplace.html">Browse the marketplace</a></div>';
    } else {
      inner += '<div class="psm-shop-grid">';
      items.forEach(function (l) {
        inner += '<article class="psm-shop-card" data-id="' + l.id + '" tabindex="0" role="button" aria-label="View ' + esc(l.title) + '">' +
          listingImage(l) +
          '<div class="psm-shop-card-body">' +
            '<h3>' + esc(l.title) + '</h3>' +
            '<p class="psm-card-price">' + fmtPrice(l.priceGBP) + '</p>' +
            '<div class="psm-card-badges">' + categoryBadge(l.category) + (l.ukRooted ? ukRootedBadge() : '') + '</div>' +
          '</div></article>';
      });
      inner += '</div>';
    }
    section.innerHTML = inner;
    container.appendChild(section);
    Array.prototype.forEach.call(section.querySelectorAll('.psm-shop-card'), function (card) {
      var open = function () { openDetail(card.getAttribute('data-id')); };
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    if (location.hash === '#shop') {
      setTimeout(function () { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    }
  }

  /* ---------- Profile page auto-inject (JS-driven profile) ---------- */
  function initProfileShop() {
    if (!/\/profile\.html/.test(location.pathname)) return;
    var params = new URLSearchParams(location.search);
    var sellerId = params.get('seller');
    if (!sellerId) return; // own profile: no seed match → skip to avoid clutter
    var root = document.getElementById('root');
    if (!root) return;
    var sellerName = null;
    for (var i = 0; i < LISTINGS.length; i++) { if (LISTINGS[i].sellerId === sellerId) { sellerName = LISTINGS[i].sellerName; break; } }
    var injected = false;
    function tryInject() {
      if (injected) return;
      if (root.querySelector('.profile-top') || root.querySelector('#p-name')) {
        injected = true;
        renderProfileShop(root, sellerId, sellerName);
      }
    }
    var obs = new MutationObserver(tryInject);
    obs.observe(root, { childList: true, subtree: true });
    tryInject();
    setTimeout(function () { obs.disconnect(); }, 15000);
  }

  /* ---------- Public API ---------- */
  window.PSMarketplace = {
    LISTINGS: LISTINGS,
    PLATFORM_FEE_PCT: PLATFORM_FEE_PCT,
    openDetail: openDetail,
    renderProfileShop: renderProfileShop,
    ukRootedBadge: ukRootedBadge,
    categoryBadge: categoryBadge
  };

  /* ---------- Auto init ---------- */
  function init() {
    gridEl = document.getElementById('psm-grid');
    if (gridEl) { initFilters(); renderGrid(); initCreateForm(); }
    initProfileShop();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
