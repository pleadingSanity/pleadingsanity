/* Support Us — config-wired donation slots.
   Reads /data/support-config.json (public, no secrets). Empty slot = honest dashed hint.
   Filled slots render as proper styled buttons. PayPal is intentionally never wired here
   (Shane's call, Nov 2026) — it stays a placeholder with an email fallback.
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
    c.appendChild(el("div", "support-label", label));
    return c;
  }
  /* Empty slot: honest dashed hint, never a broken button. */
  function soonHint(c, what) {
    var p = el("p", "support-soon");
    p.textContent = "Add your " + what + " → data/support-config.json";
    c.appendChild(p);
    var small = el("p", "support-note");
    small.textContent = "Coming soon — Shane is wiring this up. Check back or email for details.";
    c.appendChild(small);
  }
  /* Primary action button (external link). */
  function actionButton(href, text) {
    var a = el("a", "support-btn support-btn-primary", text);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }
  /* Copy-to-clipboard button with honest feedback. */
  function copyButton(text, label) {
    var b = el("button", "support-btn support-btn-ghost", label);
    b.type = "button";
    b.addEventListener("click", function () {
      var done = function () {
        b.textContent = "Copied ✓";
        setTimeout(function () { b.textContent = label; }, 1800);
      };
      var fail = function () {
        b.textContent = "Select & copy below";
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fail);
        } else { fail(); }
      } catch (e) { fail(); }
    });
    return b;
  }

  function render(cfg) {
    // Clear any JS-rendered cards (keep the first child = email card, rendered server-side)
    while (host.children.length > 1) host.removeChild(host.lastChild);

    // Buy Me a Coffee
    var bmc = card(!!cfg.buyMeACoffee, "Buy Me a Coffee");
    if (cfg.buyMeACoffee) {
      bmc.appendChild(el("p", "support-note", "One-off or monthly coffee. Runs through buymeacoffee.com."));
      bmc.appendChild(actionButton(cfg.buyMeACoffee, "Buy me a coffee →"));
    } else { soonHint(bmc, "Buy Me a Coffee page link"); }
    host.appendChild(bmc);

    // Ko-fi
    var kofi = card(!!cfg.kofi, "Ko-fi");
    if (cfg.kofi) {
      kofi.appendChild(el("p", "support-note", "One-off or monthly support. Runs through ko-fi.com."));
      kofi.appendChild(actionButton(cfg.kofi, "Support on Ko-fi →"));
    } else { soonHint(kofi, "Ko-fi page link"); }
    host.appendChild(kofi);

    // Bank transfer (UK)
    var bt = cfg.bankTransfer || {};
    var btActive = !!(bt.enabled && bt.accountName && bt.sortCode && bt.accountNumber);
    var bank = card(btActive, "Bank transfer (UK)");
    if (btActive) {
      var rows = [["Account name", bt.accountName], ["Sort code", bt.sortCode], ["Account number", bt.accountNumber], ["Reference", bt.reference || "your name"]];
      var dl = el("dl", "support-bank");
      rows.forEach(function (row) {
        if (!row[1]) return;
        dl.appendChild(el("dt", null, row[0]));
        dl.appendChild(el("dd", null, row[1]));
      });
      bank.appendChild(dl);
      if (bt.note) bank.appendChild(el("p", "support-note", bt.note));
      var blob = rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n");
      bank.appendChild(copyButton(blob, "Copy account details"));
    } else { soonHint(bank, "bank details (account name, sort code, account number)"); }
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
      crypto.appendChild(copyButton(cr.address, "Copy address"));
    } else { soonHint(crypto, "crypto address + network"); }
    host.appendChild(crypto);

    // PayPal — always a placeholder, never wired (Shane's call). enabled:false stays.
    var pp = card(false, "PayPal");
    var ppNote = (cfg.paypal && cfg.paypal.note)
      ? cfg.paypal.note
      : "PayPal is intentionally not wired yet. Email us and we'll arrange a secure link.";
    pp.appendChild(el("p", "support-soon", ppNote));
    var ppEmail = el("a", "support-btn support-btn-ghost", "Email for secure link →");
    ppEmail.href = "mailto:" + (cfg.email || DEFAULT.email);
    pp.appendChild(ppEmail);
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
