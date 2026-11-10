/* Support Us — config-wired donation slots.
   Reads /data/support-config.json (public, no secrets). Empty slot = "Coming soon".
   PayPal is intentionally never wired here (Shane's call, Nov 2026).
   Email is rendered server-side in support-us.html and always works without JS. */
(function () {
  var DEFAULT = {
    email: "support@pleadingsanity.co.uk",
    buyMeACoffee: "",
    kofi: "",
    paypal: { enabled: false, me: "", buttonId: "", note: "" },
    bankTransfer: { enabled: false, accountName: "", sortCode: "", accountNumber: "", reference: "", note: "" },
    crypto: { enabled: false, label: "", address: "", network: "", note: "" }
  };
  var host = document.getElementById("support-options");
  if (!host) return;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function card(active, label) {
    var c = el("div", "support-card click-card" + (active ? " support-card-active" : " support-card-soon"));
    var lab = el("div", "support-label", label);
    c.appendChild(lab);
    return c;
  }
  function soonNote(c, text) {
    var p = el("p", "support-soon", text || "Coming soon — Shane is adding this option. Check back or email for details.");
    c.appendChild(p);
  }
  function render(cfg) {
    // Clear any JS-rendered cards (keep the first child = email card, rendered server-side)
    while (host.children.length > 1) host.removeChild(host.lastChild);

    // Buy Me a Coffee
    var bmc = card(!!cfg.buyMeACoffee, "Buy Me a Coffee");
    if (cfg.buyMeACoffee) {
      var a = el("a", "support-link", "Buy me a coffee →");
      a.href = cfg.buyMeACoffee;
      a.target = "_blank"; a.rel = "noopener noreferrer";
      bmc.appendChild(a);
    } else { soonNote(bmc); }
    host.appendChild(bmc);

    // Ko-fi
    var kofi = card(!!cfg.kofi, "Ko-fi");
    if (cfg.kofi) {
      var ka = el("a", "support-link", "Support on Ko-fi →");
      ka.href = cfg.kofi;
      ka.target = "_blank"; ka.rel = "noopener noreferrer";
      kofi.appendChild(ka);
    } else { soonNote(kofi); }
    host.appendChild(kofi);

    // Bank transfer
    var bt = cfg.bankTransfer || {};
    var btActive = !!(bt.enabled && bt.accountName && bt.sortCode && bt.accountNumber);
    var bank = card(btActive, "Bank transfer (UK)");
    if (btActive) {
      var dl = el("dl", "support-bank");
      [["Account name", bt.accountName], ["Sort code", bt.sortCode], ["Account number", bt.accountNumber], ["Reference", bt.reference || "your name"]].forEach(function (row) {
        if (!row[1]) return;
        var dt = el("dt", null, row[0]);
        var dd = el("dd", null, row[1]);
        dl.appendChild(dt); dl.appendChild(dd);
      });
      bank.appendChild(dl);
      if (bt.note) bank.appendChild(el("p", "support-note", bt.note));
    } else { soonNote(bank); }
    host.appendChild(bank);

    // Crypto
    var cr = cfg.crypto || {};
    var crActive = !!(cr.enabled && cr.address);
    var crypto = card(crActive, cr.label || "Crypto");
    if (crActive) {
      var addr = el("p", "support-crypto-addr", cr.address);
      addr.setAttribute("aria-label", "Crypto address");
      crypto.appendChild(addr);
      if (cr.network) crypto.appendChild(el("p", "support-note", "Network: " + cr.network));
      if (cr.note) crypto.appendChild(el("p", "support-note", cr.note));
    } else { soonNote(crypto); }
    host.appendChild(crypto);

    // PayPal — always a placeholder, never wired (Shane's call)
    var pp = card(false, "PayPal");
    soonNote(pp, (cfg.paypal && cfg.paypal.note) ? cfg.paypal.note : "PayPal is coming soon. In the meantime, email us and we'll arrange a secure link.");
    host.appendChild(pp);
  }

  render(DEFAULT);
  try {
    fetch("/data/support-config.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cfg) { if (cfg) render(Object.assign({}, DEFAULT, cfg)); })
      .catch(function () { /* DEFAULT already rendered */ });
  } catch (e) { /* DEFAULT already rendered */ }
})();
