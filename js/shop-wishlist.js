/* Pleading Sanity Shop — wishlist + notify-me.
   "Save to wishlist" + "Notify me when in stock" per collection card.
   Wishlist in localStorage ps_shop_wishlist; notify captures in ps_shop_notify
   and posts to Netlify Form "shop-notify-me".
   Honest: design previews, no stock yet — we notify when samples approved. */
(function () {
  var cards = document.querySelectorAll(".collection-grid .collection-card");
  if (!cards.length) return;

  var WISH_KEY = "ps_shop_wishlist";
  var NOTIFY_KEY = "ps_shop_notify";
  var FORM_NAME = "shop-notify-me";

  var style = document.createElement("style");
  style.textContent = [
    ".ps-wl-actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}",
    ".ps-wl-btn{flex:1;min-width:110px;min-height:44px;border-radius:999px;font-weight:800;font-size:.85rem;cursor:pointer;padding:9px 12px;box-sizing:border-box;transition:.15s;border:1px solid transparent;}",
    ".ps-wl-save{background:transparent;color:#00fff0;border-color:rgba(0,255,240,.5);}",
    ".ps-wl-save:hover{background:rgba(0,255,240,.1);}",
    ".ps-wl-save.ps-wl-on{background:#00fff0;color:#0b0f19;border-color:#00fff0;}",
    ".ps-wl-notify{background:#f59e0b;color:#0b0f19;}",
    ".ps-wl-notify:hover{background:#fbbf24;}",
    ".ps-wl-notify.ps-wl-done{background:#10b981;color:#04120c;}",
    ".ps-wl-toggle{position:fixed;bottom:84px;left:16px;z-index:9998;background:#0b0f19;color:#00fff0;border:1px solid rgba(0,255,240,.5);border-radius:999px;padding:11px 16px;font-weight:900;font-size:.9rem;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.5);min-height:48px;}",
    ".ps-wl-toggle .ps-wl-count{background:#f59e0b;color:#0b0f19;border-radius:999px;padding:1px 8px;margin-left:6px;font-size:.8rem;}",
    ".ps-wl-panel{position:fixed;bottom:140px;left:16px;right:16px;max-width:420px;z-index:9999;background:#0b0f19;border:1px solid rgba(0,255,240,.35);border-radius:16px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.7);display:none;max-height:60vh;overflow-y:auto;}",
    "@media(min-width:560px){.ps-wl-panel{left:16px;right:auto;width:380px;}}",
    ".ps-wl-panel.ps-wl-open{display:block;}",
    ".ps-wl-panel h3{margin:0 0 4px;color:#eef6ff;font-size:1.05rem;font-weight:900;}",
    ".ps-wl-panel .ps-wl-sub{color:#94a3b8;font-size:.78rem;margin:0 0 12px;line-height:1.5;}",
    ".ps-wl-item{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(148,163,184,.15);}",
    ".ps-wl-item:last-child{border-bottom:none;}",
    ".ps-wl-item .nm{flex:1;color:#e2e8f0;font-size:.9rem;font-weight:700;line-height:1.35;}",
    ".ps-wl-item button{background:transparent;border:1px solid rgba(148,163,184,.4);color:#94a3b8;border-radius:8px;padding:6px 10px;font-size:.75rem;font-weight:800;cursor:pointer;min-height:36px;}",
    ".ps-wl-item button:hover{color:#fca5a5;border-color:#fca5a5;}",
    ".ps-wl-empty{color:#64748b;font-size:.88rem;text-align:center;padding:14px 0;}",
    ".ps-wl-close{position:absolute;top:10px;right:12px;background:none;border:none;color:#94a3b8;font-size:1.3rem;cursor:pointer;line-height:1;padding:4px;}",
    ".ps-wl-modal{position:fixed;inset:0;z-index:10000;background:rgba(4,6,10,.85);display:none;align-items:center;justify-content:center;padding:20px;}",
    ".ps-wl-modal.ps-wl-open{display:flex;}",
    ".ps-wl-modal-box{background:#0b0f19;border:1px solid rgba(0,255,240,.35);border-radius:16px;padding:20px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.7);}",
    ".ps-wl-modal-box h4{margin:0 0 6px;color:#eef6ff;font-size:1.05rem;font-weight:900;}",
    ".ps-wl-modal-box p{color:#94a3b8;font-size:.82rem;margin:0 0 12px;line-height:1.5;}",
    ".ps-wl-field{width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;color:#f8fafc;padding:11px;border-radius:10px;font-size:.92rem;margin-bottom:10px;min-height:46px;}",
    ".ps-wl-field:focus{outline:2px solid #00fff0;outline-offset:1px;}",
    ".ps-wl-submit{width:100%;min-height:48px;background:#f59e0b;color:#0b0f19;border:none;border-radius:10px;font-weight:900;font-size:1rem;cursor:pointer;}",
    ".ps-wl-submit:disabled{opacity:.5;cursor:not-allowed;}",
    ".ps-wl-err{color:#fca5a5;font-size:.8rem;margin:0 0 8px;display:none;line-height:1.4;}",
    ".ps-wl-ok{color:#6ee7b7;font-size:.9rem;line-height:1.5;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.35);border-radius:10px;padding:12px;margin-top:8px;display:none;}"
  ].join("");
  document.head.appendChild(style);

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }

  // Identify each card
  var items = [];
  cards.forEach(function (card, i) {
    var kicker = card.querySelector(".collection-kicker");
    var h3 = card.querySelector("h3");
    var img = card.querySelector("img");
    var sku = kicker ? kicker.textContent.trim().split(/[\/·,]/)[0].trim() : "";
    var id = slug(sku || (h3 ? h3.textContent : "") || "item-" + i) || "item-" + i;
    var name = h3 ? h3.textContent.trim() : ("Item " + (i + 1));
    items.push({ id: id, name: name, sku: sku, card: card });

    var actions = document.createElement("div");
    actions.className = "ps-wl-actions";

    var save = document.createElement("button");
    save.type = "button";
    save.className = "ps-wl-btn ps-wl-save";
    save.setAttribute("data-id", id);
    save.innerHTML = "♡ Save";
    save.addEventListener("click", function () { toggleWish(id, save); });

    var notify = document.createElement("button");
    notify.type = "button";
    notify.className = "ps-wl-btn ps-wl-notify";
    notify.setAttribute("data-id", id);
    notify.textContent = "Notify me when in stock";
    notify.addEventListener("click", function () { openNotify(id, name, notify); });

    actions.appendChild(save);
    actions.appendChild(notify);
    var copy = card.querySelector(".collection-card-copy") || card;
    copy.appendChild(actions);
  });

  function isWished(id) { return read(WISH_KEY).indexOf(id) !== -1; }

  function toggleWish(id, btn) {
    var list = read(WISH_KEY);
    var idx = list.indexOf(id);
    if (idx === -1) { list.push(id); } else { list.splice(idx, 1); }
    write(WISH_KEY, list);
    syncSaveBtns();
    syncCount();
    renderPanel();
  }

  function syncSaveBtns() {
    var list = read(WISH_KEY);
    document.querySelectorAll(".ps-wl-save").forEach(function (b) {
      var on = list.indexOf(b.getAttribute("data-id")) !== -1;
      b.classList.toggle("ps-wl-on", on);
      b.innerHTML = on ? "♥ Saved" : "♡ Save";
    });
  }

  // Notify modal
  var modal = document.createElement("div");
  modal.className = "ps-wl-modal";
  modal.innerHTML =
    '<div class="ps-wl-modal-box" role="dialog" aria-modal="true" aria-labelledby="ps-wl-mtitle">' +
    '<h4 id="ps-wl-mtitle">Notify me when in stock</h4>' +
    '<p id="ps-wl-mitem" style="color:#00fff0;font-weight:800;margin-bottom:8px;"></p>' +
    '<p>These are design previews — no stock yet. Leave your email or mobile and we\'ll message you the moment samples are approved and stock lands. No spam, no marketing list.</p>' +
    '<input id="ps-wl-contact" class="ps-wl-field" type="text" placeholder="Email or mobile number" aria-label="Email or mobile number">' +
    '<p id="ps-wl-err" class="ps-wl-err"></p>' +
    '<button id="ps-wl-submit" class="ps-wl-submit" type="button">Notify me →</button>' +
    '<div id="ps-wl-ok" class="ps-wl-ok"></div>' +
    '<button id="ps-wl-close" type="button" class="ps-wl-close" aria-label="Close" style="position:static;float:right;margin-top:-4px;">×</button>' +
    '</div>';
  document.body.appendChild(modal);

  var currentNotify = { id: null, name: null, btn: null };
  function openNotify(id, name, btn) {
    currentNotify = { id: id, name: name, btn: btn };
    document.getElementById("ps-wl-mitem").textContent = name;
    document.getElementById("ps-wl-contact").value = "";
    document.getElementById("ps-wl-err").style.display = "none";
    document.getElementById("ps-wl-ok").style.display = "none";
    document.getElementById("ps-wl-submit").style.display = "block";
    modal.classList.add("ps-wl-open");
    setTimeout(function () { var c = document.getElementById("ps-wl-contact"); if (c) c.focus(); }, 50);
  }
  function closeNotify() { modal.classList.remove("ps-wl-open"); }

  document.getElementById("ps-wl-close").addEventListener("click", closeNotify);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeNotify(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeNotify(); panel.classList.remove("ps-wl-open"); } });

  document.getElementById("ps-wl-submit").addEventListener("click", function () {
    var contactEl = document.getElementById("ps-wl-contact");
    var err = document.getElementById("ps-wl-err");
    var contact = (contactEl ? contactEl.value : "").trim();
    var looksPhone = /[\d\s+()-]{7,}/.test(contact);
    var looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    if (!looksPhone && !looksEmail) {
      err.textContent = "Pop a real email or mobile number — we need one to reach you.";
      err.style.display = "block";
      if (contactEl) contactEl.focus();
      return;
    }
    err.style.display = "none";
    var notifies = read(NOTIFY_KEY);
    notifies.push({ id: currentNotify.id, name: currentNotify.name, contact: contact, t: Date.now() });
    write(NOTIFY_KEY, notifies);
    // Post to Netlify Forms (non-blocking)
    try {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": FORM_NAME,
          "item": currentNotify.name + " (" + currentNotify.id + ")",
          "contact": contact,
          "source": "shop-wishlist-notify"
        }).toString()
      }).catch(function () {});
    } catch (e) {}
    var ok = document.getElementById("ps-wl-ok");
    ok.innerHTML = "<strong>You're on the list.</strong><br>We'll message " + contact + " when " + currentNotify.name + " is in stock. No spam — honest.";
    ok.style.display = "block";
    document.getElementById("ps-wl-submit").style.display = "none";
    if (currentNotify.btn) { currentNotify.btn.classList.add("ps-wl-done"); currentNotify.btn.textContent = "✓ On the list"; }
    setTimeout(closeNotify, 2600);
  });

  // Wishlist toggle button + panel
  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "ps-wl-toggle";
  toggle.innerHTML = '♡ Wishlist<span class="ps-wl-count">0</span>';
  document.body.appendChild(toggle);

  var panel = document.createElement("div");
  panel.className = "ps-wl-panel";
  panel.setAttribute("aria-live", "polite");
  document.body.appendChild(panel);

  toggle.addEventListener("click", function () {
    panel.classList.toggle("ps-wl-open");
    renderPanel();
  });

  function itemName(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i].name;
    return id;
  }

  function renderPanel() {
    var list = read(WISH_KEY);
    panel.innerHTML = '<button type="button" class="ps-wl-close" aria-label="Close wishlist">×</button><h3>Your wishlist</h3>' +
      '<p class="ps-wl-sub">Design previews — no stock yet. Hit "Notify me" on any item and we\'ll reach you when it\'s real.</p>';
    panel.querySelector(".ps-wl-close").addEventListener("click", function () { panel.classList.remove("ps-wl-open"); });
    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "ps-wl-empty";
      empty.textContent = "Nothing saved yet. Tap ♡ Save on any piece above.";
      panel.appendChild(empty);
      return;
    }
    list.forEach(function (id) {
      var row = document.createElement("div");
      row.className = "ps-wl-item";
      var nm = document.createElement("span");
      nm.className = "nm";
      nm.textContent = itemName(id);
      var rm = document.createElement("button");
      rm.type = "button";
      rm.textContent = "Remove";
      rm.addEventListener("click", function () {
        var l = read(WISH_KEY);
        var i = l.indexOf(id);
        if (i !== -1) l.splice(i, 1);
        write(WISH_KEY, l);
        syncSaveBtns(); syncCount(); renderPanel();
      });
      row.appendChild(nm); row.appendChild(rm);
      panel.appendChild(row);
    });
  }

  function syncCount() {
    var n = read(WISH_KEY).length;
    var c = toggle.querySelector(".ps-wl-count");
    if (c) c.textContent = n;
    toggle.style.display = n > 0 ? "block" : "none";
  }

  syncSaveBtns();
  syncCount();
})();
