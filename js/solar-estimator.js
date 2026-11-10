/* Insane Solar — honest lead estimator.
   3-step widget (roof size, monthly bill, roof orientation) → RANGE estimate.
   Posts lead to Netlify Form "solar-estimator-lead".
   Honest by design: estimate only, not a quote, savings vary, no guarantee,
   actual survey by MCS-registered installer, AI does not certify. */
(function () {
  var mount = document.getElementById("solar-estimator-mount");
  if (!mount) return;

  var FORM_NAME = "solar-estimator-lead";
  var DISCLAIMER = "Estimate only — not a quote. Savings vary and are never guaranteed. Your roof, wiring and eligibility need an actual on-site survey by an MCS-registered installer. The AI does not certify anything; humans sign every certificate. Shane organises and oversees, trusted local fitters install.";

  // Inject styles once
  var style = document.createElement("style");
  style.textContent = [
    ".ps-est{background:rgba(15,23,42,.6);border:1px solid rgba(0,255,240,.25);border-radius:18px;padding:20px 18px;text-align:left;box-shadow:0 10px 40px -15px rgba(0,0,0,.6);}",
    ".ps-est-step{display:none;}",
    ".ps-est-step.ps-est-active{display:block;}",
    ".ps-est-q{font-weight:800;color:#eef6ff;font-size:1.05rem;margin:0 0 12px;line-height:1.4;}",
    ".ps-est-opts{display:grid;grid-template-columns:1fr;gap:8px;}",
    "@media(min-width:520px){.ps-est-opts{grid-template-columns:1fr 1fr;}}",
    ".ps-est-opt{display:block;width:100%;background:rgba(30,41,59,.7);border:1px solid rgba(148,163,184,.35);color:#e2e8f0;padding:13px 14px;border-radius:12px;font-size:.95rem;font-weight:700;cursor:pointer;text-align:left;min-height:48px;box-sizing:border-box;transition:border-color .15s,background .15s;}",
    ".ps-est-opt:hover,.ps-est-opt:focus-visible{border-color:#00fff0;outline:none;}",
    ".ps-est-opt.ps-est-sel{border-color:#00fff0;background:rgba(0,255,240,.12);color:#00fff0;}",
    ".ps-est-opt small{display:block;font-weight:500;color:#94a3b8;font-size:.8rem;margin-top:3px;}",
    ".ps-est-nav{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}",
    ".ps-est-btn{flex:1;min-width:120px;min-height:48px;border:none;border-radius:12px;font-weight:900;font-size:1rem;cursor:pointer;padding:12px 16px;box-sizing:border-box;}",
    ".ps-est-next{background:linear-gradient(135deg,#00fff0,#38bdf8);color:#0b0f19;}",
    ".ps-est-next:disabled{opacity:.4;cursor:not-allowed;}",
    ".ps-est-back{background:transparent;color:#94a3b8;border:1px solid rgba(148,163,184,.4);}",
    ".ps-est-back:hover{color:#e2e8f0;border-color:#e2e8f0;}",
    ".ps-est-prog{display:flex;gap:6px;margin-bottom:16px;}",
    ".ps-est-dot{flex:1;height:5px;border-radius:999px;background:rgba(148,163,184,.25);}",
    ".ps-est-dot.ps-est-done{background:#00fff0;}",
    ".ps-est-result{background:rgba(0,255,240,.06);border:1px solid rgba(0,255,240,.3);border-radius:14px;padding:16px;margin:14px 0;}",
    ".ps-est-range{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0;}",
    "@media(max-width:480px){.ps-est-range{grid-template-columns:1fr;}}",
    ".ps-est-rbox{background:rgba(11,15,25,.6);border-radius:10px;padding:12px;}",
    ".ps-est-rbox .k{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:#7dd3fc;font-weight:800;}",
    ".ps-est-rbox .v{font-size:1.15rem;font-weight:900;color:#eef6ff;margin-top:4px;line-height:1.25;}",
    ".ps-est-rbox .v span{color:#f59e0b;}",
    ".ps-est-disc{font-size:.78rem;line-height:1.55;color:#94a3b8;margin:12px 0 0;}",
    ".ps-est-disc strong{color:#cbd5e1;}",
    ".ps-est-field{width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;color:#f8fafc;padding:12px;border-radius:10px;font-size:.95rem;margin-bottom:10px;min-height:48px;}",
    ".ps-est-field:focus{outline:2px solid #00fff0;outline-offset:1px;}",
    ".ps-est-err{color:#fca5a5;font-size:.82rem;margin:0 0 8px;line-height:1.4;display:none;}",
    ".ps-est-ok{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.4);color:#6ee7b7;border-radius:12px;padding:14px;font-size:.95rem;line-height:1.5;}",
    ".ps-est-cta{font-weight:800;color:#eef6ff;margin:0 0 10px;font-size:1rem;}",
    ".ps-est-sub{color:#94a3b8;font-size:.82rem;margin:0 0 12px;line-height:1.5;}"
  ].join("");
  document.head.appendChild(style);

  var state = { step: 0, roof: null, bill: null, orient: null, estimate: null };

  var ROOF_OPTS = [
    { v: "small", t: "Smaller roof", s: "Up to ~20 m² · terraced / small semi", kw: 3.0 },
    { v: "medium", t: "Average roof", s: "~20–40 m² · typical 3-bed semi", kw: 5.0 },
    { v: "large", t: "Large roof", s: "40+ m² · detached / bungalow / multiple sides", kw: 8.0 },
    { v: "unsure", t: "Not sure", s: "We'll measure on survey — uses average", kw: 4.5 }
  ];
  var BILL_OPTS = [
    { v: "under60", t: "Under £60 / month", s: "Lower than UK average", "£": 50 },
    { v: "60-100", t: "£60–£100 / month", s: "Typical UK household", "£": 80 },
    { v: "100-150", t: "£100–£150 / month", s: "Larger home / EV / heating", "£": 125 },
    { v: "over150", t: "Over £150 / month", s: "High usage / battery worth a look", "£": 180 }
  ];
  var ORIENT_OPTS = [
    { v: "S", t: "South", s: "Best generation", f: 1.0 },
    { v: "SW/SE", t: "South-West or South-East", s: "Very good", f: 0.92 },
    { v: "E/W", t: "East or West", s: "Still worthwhile", f: 0.8 },
    { v: "NE/NW", t: "North-East or North-West", s: "Lower output — worth checking", f: 0.7 },
    { v: "N", t: "North-facing", s: "Much lower — talk to us first", f: 0.55 },
    { v: "unsure", t: "Not sure / mixed", s: "We'll check on survey", f: 0.85 }
  ];

  function optBtn(opt, key) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ps-est-opt";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", "false");
    b.innerHTML = "" + opt.t + "<small>" + opt.s + "</small>";
    b.addEventListener("click", function () {
      state[key] = opt.v;
      var sibs = b.parentNode.querySelectorAll(".ps-est-opt");
      for (var i = 0; i < sibs.length; i++) {
        sibs[i].classList.remove("ps-est-sel");
        sibs[i].setAttribute("aria-checked", "false");
      }
      b.classList.add("ps-est-sel");
      b.setAttribute("aria-checked", "true");
      var next = b.closest(".ps-est-step").querySelector(".ps-est-next");
      if (next) next.disabled = false;
    });
    return b;
  }

  function stepEl(idx, question, opts, key) {
    var wrap = document.createElement("div");
    wrap.className = "ps-est-step" + (idx === 0 ? " ps-est-active" : "");
    wrap.setAttribute("data-step", idx);
    var q = document.createElement("p");
    q.className = "ps-est-q";
    q.textContent = "Step " + (idx + 1) + " of 3 — " + question;
    wrap.appendChild(q);
    var optsEl = document.createElement("div");
    optsEl.className = "ps-est-opts";
    optsEl.setAttribute("role", "radiogroup");
    optsEl.setAttribute("aria-label", question);
    for (var i = 0; i < opts.length; i++) optsEl.appendChild(optBtn(opts[i], key));
    wrap.appendChild(optsEl);
    var nav = document.createElement("div");
    nav.className = "ps-est-nav";
    if (idx > 0) {
      var back = document.createElement("button");
      back.type = "button";
      back.className = "ps-est-btn ps-est-back";
      back.textContent = "← Back";
      back.addEventListener("click", function () { go(idx - 1); });
      nav.appendChild(back);
    }
    var next = document.createElement("button");
    next.type = "button";
    next.className = "ps-est-btn ps-est-next";
    next.textContent = idx === 2 ? "Show my estimate →" : "Next →";
    next.disabled = true;
    next.addEventListener("click", function () {
      if (idx === 2) { showResult(); } else { go(idx + 1); }
    });
    nav.appendChild(next);
    wrap.appendChild(nav);
    return wrap;
  }

  function go(idx) {
    state.step = idx;
    var steps = mount.querySelectorAll(".ps-est-step");
    for (var i = 0; i < steps.length; i++) steps[i].classList.toggle("ps-est-active", i === idx);
    var dots = mount.querySelectorAll(".ps-est-dot");
    for (var j = 0; j < dots.length; j++) dots[j].classList.toggle("ps-est-done", j <= idx);
  }

  function findOpt(list, v) {
    for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i];
    return list[list.length - 1];
  }

  function fmtPounds(n) { return "£" + Math.round(n / 100) * 100; }

  function compute() {
    var roof = findOpt(ROOF_OPTS, state.roof);
    var bill = findOpt(BILL_OPTS, state.bill);
    var orient = findOpt(ORIENT_OPTS, state.orient);
    // Bill-matched system size (kWh/year ÷ ~850 kWh per kWp/year UK)
    var unitPrice = 0.28; // £/kWh typical 2026 — varies by tariff
    var annualKwh = bill["£"] * 12 / unitPrice;
    var billKwp = annualKwh / 850;
    // System limited by roof; allow slight oversize for EV/battery headroom
    var kwp = Math.min(roof.kw, billKwp * 1.1);
    kwp = Math.max(1.5, kwp);
    var kwpLow = kwp * 0.85, kwpHigh = kwp * 1.2;
    var genLow = kwpLow * 750 * orient.f;
    var genHigh = kwpHigh * 950 * orient.f;
    // Installed cost £1,200–£1,900 per kWp (2026 UK, varies; VAT relief eligibility applies)
    var costLow = kwpLow * 1200, costHigh = kwpHigh * 1900;
    // Savings: self-consumption 30–60% at ~£0.28, export rest at SEG ~£0.05–0.10
    var saveLow = genLow * (0.30 * 0.25 + 0.70 * 0.05);
    var saveHigh = genHigh * (0.60 * 0.32 + 0.40 * 0.10);
    var paybackLow = costHigh > 0 && saveLow > 0 ? costHigh / saveHigh : null;
    var paybackHigh = costLow > 0 && saveHigh > 0 ? costLow / saveLow : null;
    return {
      kwp: kwp, kwpLow: kwpLow, kwpHigh: kwpHigh,
      genLow: genLow, genHigh: genHigh,
      costLow: costLow, costHigh: costHigh,
      saveLow: saveLow, saveHigh: saveHigh,
      paybackLow: paybackLow, paybackHigh: paybackHigh,
      roofLabel: roof.t, billLabel: bill.t, orientLabel: orient.t
    };
  }

  function rbox(k, vHtml) {
    var d = document.createElement("div");
    d.className = "ps-est-rbox";
    var kk = document.createElement("div"); kk.className = "k"; kk.textContent = k;
    var vv = document.createElement("div"); vv.className = "v"; vv.innerHTML = vHtml;
    d.appendChild(kk); d.appendChild(vv);
    return d;
  }

  function showResult() {
    state.estimate = compute();
    var e = state.estimate;
    // Hide step 3, show result step
    go(3);
    var res = document.getElementById("ps-est-result-wrap");
    if (!res) return;
    res.style.display = "block";
    var range = document.createElement("div");
    range.className = "ps-est-range";
    range.appendChild(rbox("System size (rough)", Math.round(e.kwpLow * 10) / 10 + "–" + Math.round(e.kwpHigh * 10) / 10 + " <span>kWp</span>"));
    range.appendChild(rbox("Installed cost (rough)", fmtPounds(e.costLow) + "–<br>" + fmtPounds(e.costHigh)));
    range.appendChild(rbox("Power per year", Math.round(e.genLow / 100) * 100 + "–" + Math.round(e.genHigh / 100) * 100 + " <span>kWh</span>"));
    range.appendChild(rbox("Possible yearly saving", fmtPounds(e.saveLow) + "–<br>" + fmtPounds(e.saveHigh)));
    res.innerHTML = "";
    var h = document.createElement("p");
    h.className = "ps-est-q";
    h.style.marginBottom = "6px";
    h.textContent = "Your honest ballpark range";
    res.appendChild(h);
    var sub = document.createElement("p");
    sub.className = "ps-est-sub";
    sub.textContent = "Based on: " + e.roofLabel.toLowerCase() + ", " + e.billLabel.toLowerCase() + ", " + e.orientLabel.toLowerCase() + " roof. Wide range on purpose — every roof is different.";
    res.appendChild(sub);
    res.appendChild(range);
    if (e.paybackLow && e.paybackHigh) {
      var pb = document.createElement("p");
      pb.style.cssText = "color:#cbd5e1;font-size:.88rem;margin:8px 0 0;line-height:1.5;";
      pb.textContent = "Simple payback at today's prices: roughly " + Math.round(e.paybackLow) + "–" + Math.round(e.paybackHigh) + " years — longer if you export most power, shorter with a battery or daytime use. Not guaranteed.";
      res.appendChild(pb);
    }
    var disc = document.createElement("p");
    disc.className = "ps-est-disc";
    disc.innerHTML = "<strong>" + DISCLAIMER + "</strong>";
    res.appendChild(disc);
    // Lead capture
    var lead = document.getElementById("ps-est-lead");
    if (lead) lead.style.display = "block";
  }

  function submitLead(ev) {
    ev.preventDefault();
    var nameEl = document.getElementById("ps-est-name");
    var contactEl = document.getElementById("ps-est-contact");
    var postEl = document.getElementById("ps-est-postcode");
    var err = document.getElementById("ps-est-lead-err");
    var name = (nameEl ? nameEl.value : "").trim();
    var contact = (contactEl ? contactEl.value : "").trim();
    var postcode = (postEl ? postEl.value : "").trim();
    var looksPhone = /[\d\s+()-]{7,}/.test(contact);
    var looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    if (!name) { showErr(err, "Pop your name in so Shane knows who to call."); if (nameEl) nameEl.focus(); return; }
    if (!looksPhone && !looksEmail) { showErr(err, "Pop a mobile number or email — Shane needs one to send your quote."); if (contactEl) contactEl.focus(); return; }
    if (!postcode || postcode.replace(/\s/g, "").length < 5) { showErr(err, "Pop your postcode in — it tells us the roof and grid area."); if (postEl) postEl.focus(); return; }
    if (err) err.style.display = "none";
    var e = state.estimate || {};
    var body = new URLSearchParams({
      "form-name": FORM_NAME,
      "name": name,
      "contact": contact,
      "postcode": postcode,
      "roofSize": findOpt(ROOF_OPTS, state.roof).t,
      "monthlyBill": findOpt(BILL_OPTS, state.bill).t,
      "roofOrientation": findOpt(ORIENT_OPTS, state.orient).t,
      "estimateLow": fmtPounds(e.saveLow || 0) + "/yr saving, " + fmtPounds(e.costLow || 0) + " cost",
      "estimateHigh": fmtPounds(e.saveHigh || 0) + "/yr saving, " + fmtPounds(e.costHigh || 0) + " cost",
      "source": "solar-estimator-widget"
    });
    var btn = document.getElementById("ps-est-submit");
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    try {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      }).then(function () { doneLead(name); }).catch(function () { doneLead(name); });
    } catch (err2) { doneLead(name); }
    // Don't wait for network — show confirmation immediately
    doneLead(name);
  }

  var doneFired = false;
  function doneLead(name) {
    if (doneFired) return;
    doneFired = true;
    var lead = document.getElementById("ps-est-lead");
    var ok = document.getElementById("ps-est-ok");
    if (lead) lead.style.display = "none";
    if (ok) {
      ok.style.display = "block";
      ok.innerHTML = "<strong>Cheers " + (name || "there") + " — that's with Shane.</strong><br>He'll call or message you back with a proper quote after a real survey. No pressure, no hard sell. Prefer to reach him now? Call <a href=\"tel:07999899304\" style=\"color:#6ee7b7;font-weight:800;\">07999 899304</a> or <a href=\"https://wa.me/447711147663\" target=\"_blank\" rel=\"noopener\" style=\"color:#6ee7b7;font-weight:800;\">WhatsApp</a>.";
    }
  }

  function showErr(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  // Build widget
  var root = document.createElement("div");
  root.className = "ps-est";
  root.setAttribute("aria-live", "polite");

  var prog = document.createElement("div");
  prog.className = "ps-est-prog";
  for (var p = 0; p < 3; p++) {
    var d = document.createElement("div");
    d.className = "ps-est-dot" + (p === 0 ? " ps-est-done" : "");
    prog.appendChild(d);
  }
  root.appendChild(prog);

  root.appendChild(stepEl(0, "How big is your roof?", ROOF_OPTS, "roof"));
  root.appendChild(stepEl(1, "What's your monthly electricity bill?", BILL_OPTS, "bill"));
  root.appendChild(stepEl(2, "Which way does your roof face?", ORIENT_OPTS, "orient"));

  // Result (hidden until computed)
  var resWrap = document.createElement("div");
  resWrap.id = "ps-est-result-wrap";
  resWrap.className = "ps-est-step";
  resWrap.style.display = "none";
  root.appendChild(resWrap);

  // Lead capture (hidden until result shown)
  var lead = document.createElement("div");
  lead.id = "ps-est-lead";
  lead.style.display = "none";
  lead.style.marginTop = "16px";
  lead.innerHTML =
    '<p class="ps-est-cta">Want a proper quote from Shane? Leave your details — no obligation.</p>' +
    '<p class="ps-est-sub">He only calls after a real survey by an MCS-registered installer. The AI never certifies.</p>' +
    '<input id="ps-est-name" class="ps-est-field" type="text" autocomplete="name" placeholder="Your name" aria-label="Your name" required>' +
    '<input id="ps-est-contact" class="ps-est-field" type="text" autocomplete="tel" placeholder="Mobile number or email" aria-label="Mobile number or email" required>' +
    '<input id="ps-est-postcode" class="ps-est-field" type="text" autocomplete="postal-code" placeholder="Postcode (e.g. LE1 1AA)" aria-label="Postcode" required>' +
    '<p id="ps-est-lead-err" class="ps-est-err"></p>' +
    '<button id="ps-est-submit" type="button" class="ps-est-btn ps-est-next" style="width:100%;">Send my details to Shane →</button>';
  root.appendChild(lead);

  var ok = document.createElement("div");
  ok.id = "ps-est-ok";
  ok.className = "ps-est-ok";
  ok.style.display = "none";
  ok.style.marginTop = "16px";
  root.appendChild(ok);

  var footDisc = document.createElement("p");
  footDisc.className = "ps-est-disc";
  footDisc.innerHTML = "<strong>Honesty note:</strong> " + DISCLAIMER;
  root.appendChild(footDisc);

  mount.appendChild(root);

  var sub = document.getElementById("ps-est-submit");
  if (sub) sub.addEventListener("click", submitLead);
  ["ps-est-name", "ps-est-contact", "ps-est-postcode"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); submitLead(ev); } });
  });
})();
