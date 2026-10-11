// ==============================================================
// THE SANE FINANCE GBT — page wiring
// All personal finance data stays in this browser (localStorage).
// Nothing is sent anywhere unless the person asks the AI and, for
// their profile figures, ticks the consent box first.
// Every bit of user text is escaped before it touches the page.
// ==============================================================
import * as E from "./finance-engine.js";

const $ = (id) => document.getElementById(id);
const esc = E.esc;
const KEYS = { profile: "ps-sane-finance-profile", quotes: "ps-sane-finance-quotes", tracker: "ps-sane-finance-tracker", brief: "ps-sane-finance-brief" };
const money = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n) || 0);

const store = {
  get(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
  drop(key) { try { localStorage.removeItem(key); } catch {} },
};

// ---------- INSTALL ----------
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; $("install-finance").hidden = false; });
$("install-finance").addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $("install-finance").hidden = true;
});
const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone) $("ios-install").hidden = false;

// ---------- PROFILE ----------
const form = $("profile-form");
let profile = { ...E.EMPTY_PROFILE, ...store.get(KEYS.profile, {}) };
const fields = [...form.elements].filter((el) => el.name);

function fillProfile() { for (const el of fields) if (profile[el.name] !== undefined) el.value = profile[el.name]; }
function readProfile() {
  const next = { ...E.EMPTY_PROFILE };
  for (const el of fields) next[el.name] = String(el.value ?? "").slice(0, 200);
  return next;
}
function applyConditional() {
  const isCar = form.purchaseType.value === "car";
  const emp = form.employment.value;
  form.querySelectorAll("[data-only='car']").forEach((el) => { if (el.tagName === "FIELDSET") return; el.hidden = !isCar; });
  form.querySelectorAll("[data-only-emp]").forEach((el) => { el.hidden = el.dataset.onlyEmp !== emp; });
}

let step = 0;
const stepTabs = [...form.querySelectorAll("[role=tab]")];
const stepSets = [...form.querySelectorAll("fieldset.finance-step")];
const visibleSteps = () => stepSets.map((s, i) => i).filter((i) => stepSets[i].dataset.only !== "car" || form.purchaseType.value === "car");
function showStep(i) {
  const vis = visibleSteps();
  step = vis.includes(i) ? i : vis[0];
  stepSets.forEach((s, j) => { s.hidden = j !== step; });
  stepTabs.forEach((t, j) => { t.setAttribute("aria-selected", String(j === step)); t.hidden = !vis.includes(j); });
  const pos = vis.indexOf(step);
  $("step-back").disabled = pos <= 0;
  $("step-next").disabled = pos >= vis.length - 1;
}
stepTabs.forEach((t) => t.addEventListener("click", () => showStep(Number(t.dataset.step))));
$("step-back").addEventListener("click", () => { const v = visibleSteps(); showStep(v[Math.max(0, v.indexOf(step) - 1)]); });
$("step-next").addEventListener("click", () => { const v = visibleSteps(); showStep(v[Math.min(v.length - 1, v.indexOf(step) + 1)]); });
form.addEventListener("change", () => { applyConditional(); showStep(step); });
form.addEventListener("submit", (e) => {
  e.preventDefault();
  profile = readProfile();
  const saved = store.set(KEYS.profile, profile);
  $("profile-saved").textContent = saved ? "Saved on this device only." : "Couldn't save on this device (private browsing?). Results still shown below.";
  renderAll();
  ($("safety").hidden ? $("calculator") : $("safety")).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});

// ---------- RENDER: SAFETY ----------
function renderSafety() {
  const d = E.difficultyCheck(profile);
  const box = $("safety");
  box.hidden = !d.stop;
  if (!d.stop) { box.innerHTML = ""; return; }
  box.innerHTML = `<div class="finance-kicker">PLEASE READ FIRST</div><h2>${esc(d.headline)}</h2>
  <p>Based on what you've told us:</p><ul>${d.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
  <p>More borrowing can make this harder. Free, confidential debt help can look at your whole situation, and none of these organisations charge you or earn commission from you.</p>
  <ul class="finance-help">${d.help.map((h) => `<li><a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.name)}</a> — ${esc(h.note)}</li>`).join("")}</ul>
  <p class="finance-muted">You can still use every tool below. We just won't pretend new credit is the answer if it might not be.</p>`;
}

// ---------- RENDER: AFFORDABILITY ----------
function renderAffordability() {
  const a = E.affordability(profile);
  if (!a.income && !a.borrow) { $("f-result").innerHTML = "Fill in your profile and press <strong>Save and check affordability</strong>."; return; }
  const verdict = { ok: ["fits", "Fits your figures"], tight: ["tight", "Tight — be careful"], over: ["over", "Doesn't fit"], unknown: ["unknown", "Not enough information"] }[a.level];
  const row = (k, v, cls = "") => `<tr class="${cls}"><th scope="row">${k}</th><td>${v}</td></tr>`;
  $("f-result").innerHTML = `<p class="finance-verdict ${verdict[0]}"><strong>${verdict[1]}</strong></p>
  <ul>${a.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  <div class="finance-table-wrap"><table class="finance-table"><tbody>
  ${row("Monthly income", money(a.income))}${row("Essential spending", "− " + money(a.essentials))}${row("Existing credit", "− " + money(a.commitments))}
  ${row("Left each month", money(a.disposable), "strong")}
  ${a.borrow ? row("Proposed payment", "− " + money(a.payment)) + row("Left after the new payment", money(a.remaining), a.remaining < 0 ? "bad strong" : "strong") : ""}
  ${row("Cautious ceiling (80% of what's left)", money(a.cautiousCeiling))}
  ${a.cautiousCeiling ? row(`Roughly the most that ceiling repays at ${a.apr}% over ${a.term} months`, money(a.maxBorrowAtCeiling)) : ""}
  </tbody></table></div>
  ${a.borrow ? `<h3>The whole cost</h3><div class="finance-table-wrap"><table class="finance-table"><tbody>
  ${a.price ? row("Purchase price", money(a.price)) : ""}${row("Deposit", money(a.deposit))}${row("Amount borrowed", money(a.borrow))}${a.fees ? row("Fees added", money(a.fees)) : ""}
  ${row("APR modelled", a.aprEntered ? a.apr + "%" : "not entered (0%)")}${row("Term", a.term + " months")}${a.balloon ? row("Final / balloon payment", money(a.balloon)) : ""}
  ${row("Total repayable", money(a.totalRepayable), "strong")}${row("Cost of credit (interest + fees)", money(a.costOfCredit))}${row("Total cash cost including deposit", money(a.totalCashCost))}
  </tbody></table></div>
  <h3>Stress test</h3><ul class="finance-stress">${a.stress.map((s) => `<li class="${s.holds ? "ok" : "bad"}">${esc(s.label)}: ${money(s.remaining)} left — ${s.holds ? "still fits" : "doesn't fit"}</li>`).join("")}</ul>
  <p class="finance-muted">${esc(a.earlySettlement)}</p>` : ""}
  <p class="finance-muted">This is our maths on your numbers, not a provider's eligibility check and not a lender's decision. A lender accepting you doesn't make a payment affordable.</p>`;
}

// ---------- RENDER: CIRCUMSTANCES ----------
function renderCredit() {
  const f = E.circumstanceFactors(profile);
  const spec = E.isSpecialist(profile);
  if (profile.ageOk === "no") { $("credit-result").innerHTML = "<p><strong>You need to be 18 or over to take out credit in the UK.</strong> The calculators still work for planning.</p>"; return; }
  if (!f.length) { $("credit-result").innerHTML = "<p>Nothing you've told us stands out. Still check your credit report — errors are common.</p>"; return; }
  $("credit-result").innerHTML = `${spec ? `<p class="finance-mode"><strong>Specialist finance mode is on.</strong> We'll look for providers whose published criteria may accommodate your circumstances. No one can promise approval, and anyone advertising “guaranteed bad credit finance” is a warning sign.</p>` : ""}
  <ul class="finance-factors">${f.map((x) => `<li><strong>${esc(x.title)}</strong><br>${esc(x.detail)}</li>`).join("")}</ul>
  <p class="finance-muted">These are things that may matter. Only a provider can tell you what actually affects its decision.</p>`;
}

// ---------- RENDER: ROUTE ----------
function renderRoute(type) {
  const r = E.routeAdvice({ ...profile, purchaseType: type || profile.purchaseType });
  $("route-result").innerHTML = `<strong>${esc(r.name)}</strong>${r.specialist ? ' <span class="tag elig">specialist route</span>' : ""}
  <p>Compare: ${r.compare.map(esc).join(" · ")}</p><p>Ask:</p><ul>${r.ask.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
  <p>Next steps:</p><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`;
}
document.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => renderRoute(b.dataset.route)));

// ---------- PROVIDERS ----------
let providerFeed = null;
async function loadProviders() {
  try {
    const r = await fetch("/api/finance-providers", { headers: { accept: "application/json" } });
    providerFeed = r.ok ? await r.json() : { connected: false, message: "Live provider data not connected." };
  } catch {
    providerFeed = { connected: false, message: navigator.onLine ? "Live provider data not connected." : "You're offline. Live provider data not connected." };
  }
  renderProviders();
}
function renderProviders() {
  const box = $("provider-result");
  if (!providerFeed) return;
  const list = providerFeed.connected ? E.rankProviders(providerFeed.providers || [], profile) : [];
  if (!list.length) {
    box.innerHTML = `<p><strong>${esc(providerFeed.message || "Live provider data not connected.")}</strong></p>
    <p>We haven't connected a licensed provider feed yet, so we're showing no lenders rather than guessing. Until then: use the soft-search eligibility checker on a provider's own website or on an established comparison site, check the firm on the FCA Register below, and add its quote to the comparison.</p>
    <p class="finance-muted">Review feed: ${esc(providerFeed.reviews?.message || "not connected")}.</p>`;
    return;
  }
  box.innerHTML = `<p class="finance-muted">Source: ${esc(providerFeed.source)} · fetched ${esc(new Date(providerFeed.fetchedAt).toLocaleString("en-GB"))}. Ordered by fit and APR — never by commission.</p>
  <div class="finance-providers">${list.map((p) => providerCard(p)).join("")}</div>`;
}
function safeUrl(u) { try { const x = new URL(u); return x.protocol === "https:" ? x.href : ""; } catch { return ""; } }
function providerCard(p) {
  const v = (x) => (x === null || x === undefined || x === "" ? "<em>not published</em>" : esc(x));
  return `<article class="finance-provider">
  <h3>${esc(p.trading_name || p.legal_name)} <span class="tag">${esc(p.provider_type)}</span>${p.inRange === false ? ' <span class="tag dec">outside amount range</span>' : ""}</h3>
  <p class="finance-muted">${esc(p.legal_name)} · FCA ${v(p.fca_status)} ${p.fca_reference ? "· ref " + esc(p.fca_reference) : ""} · verified ${esc(String(p.last_verified).slice(0, 10))} (${p.ageDays} days ago)</p>
  <dl><dt>Product</dt><dd>${v(p.product_type)}</dd><dt>Representative APR</dt><dd>${v(p.representative_apr)}%</dd><dt>Amounts</dt><dd>${v(p.minimum_amount)} – ${v(p.maximum_amount)}</dd><dt>Term</dt><dd>${v(p.term_range)}</dd><dt>Fees</dt><dd>${v(p.fees)}</dd><dt>Deposit</dt><dd>${v(p.deposit_requirement)}</dd><dt>Final payment</dt><dd>${v(p.final_payment)}</dd>
  <dt>Published criteria</dt><dd>${v(p.eligibility_criteria)}</dd><dt>Soft search</dt><dd>${p.soft_search_available ? "Available" : "Not stated"}</dd><dt>Hard search</dt><dd>${v(p.hard_search_warning)}</dd><dt>Commission</dt><dd>${v(p.commission_disclosure)}</dd></dl>
  <p><strong>Customer feedback</strong> (separate from suitability and price): ${v(p.review_summary)} ${p.review_date ? "· " + esc(p.review_date) : ""}</p>
  ${safeUrl(p.source_url) ? `<a class="finance-btn secondary" href="${esc(safeUrl(p.source_url))}" target="_blank" rel="noopener nofollow">Provider's own page</a>` : ""}
  </article>`;
}
$("fca-check").addEventListener("click", async () => {
  const frn = $("fca-frn").value.trim();
  const out = $("fca-result");
  const link = `<a href="https://register.fca.org.uk/s/" target="_blank" rel="noopener">Open the official FCA Register</a>`;
  if (!/^\d{6,7}$/.test(frn)) { out.innerHTML = `An FCA reference number is 6 or 7 digits. ${link}`; return; }
  out.textContent = "Checking the FCA Register…";
  try {
    const r = await fetch(`/api/finance-providers?frn=${frn}`);
    const d = await r.json();
    if (!d.connected) out.innerHTML = `${esc(d.message || "Register lookup not connected.")} ${link}`;
    else if (!d.found) out.innerHTML = `<strong>${esc(d.message)}</strong> Be very careful with any firm that gives a reference that doesn't check out. ${link}`;
    else out.innerHTML = `<strong>${esc(d.name)}</strong> — status: ${esc(d.status)}${d.type ? " · " + esc(d.type) : ""}<br><span class="finance-muted">From the ${esc(d.source)}, checked ${esc(new Date(d.checkedAt).toLocaleString("en-GB"))}. Check the firm's permissions on the register too: being listed doesn't mean it's allowed to do everything.</span> ${link}`;
  } catch { out.innerHTML = `Couldn't reach the register just now. ${link}`; }
});

// ---------- QUOTES / COMPARISON ----------
let quotes = store.get(KEYS.quotes, []);
if (!Array.isArray(quotes)) quotes = [];
const quoteForm = $("quote-form");
quoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(quoteForm));
  const q = {
    id: Math.random().toString(36).slice(2, 10),
    provider: String(f.provider || "").trim().slice(0, 120) || "Unnamed quote",
    kind: ["lender", "broker"].includes(f.kind) ? f.kind : "unknown",
    amount: f.amount, monthly: f.monthly, payments: f.payments, apr: f.apr, deposit: f.deposit, fees: f.fees, balloon: f.balloon,
    commission: String(f.commission || "").slice(0, 120), fca: /^\d{6,7}$/.test(f.fca || "") ? f.fca : "",
    url: safeUrl(String(f.url || "").trim()), paid: f.paid === "on",
  };
  quotes.push(q); store.set(KEYS.quotes, quotes); quoteForm.reset(); renderQuotes();
});
$("quote-sort").addEventListener("change", renderQuotes);
function budget() { const a = E.affordability(profile); return E.num(profile.preferredMonthly) || a.cautiousCeiling || 0; }
function renderQuotes() {
  const box = $("c-result");
  if (!quotes.length) { box.textContent = "No quotes yet. Add the figures from any quote you've been given."; return; }
  const list = E.compareQuotes(quotes, budget(), $("quote-sort").value);
  box.innerHTML = `<p class="finance-muted">Budget used for “fits”: ${budget() ? money(budget()) + " a month" : "none yet — save your profile"}. <span class="tag est">Planning estimate</span> Commission is shown but never changes the order.</p>
  <div class="finance-quotes">${list.map((q, i) => `<article class="finance-quote-card${q.paid ? " paid" : ""}">
   <h3>${i + 1}. ${esc(q.provider)} <span class="tag">${esc(q.kind === "unknown" ? "lender or broker? ask" : q.kind)}</span>${q.paid ? ' <span class="tag dec">Paid placement</span>' : ""}${q.fits === true ? ' <span class="tag est">fits budget</span>' : q.fits === false ? ' <span class="tag dec">above budget</span>' : ""}</h3>
   <dl><dt>Monthly</dt><dd>${money(q.monthly)} × ${q.n}</dd><dt>APR</dt><dd>${q.apr === null ? "not given — ask" : q.apr + "%"}</dd><dt>Deposit</dt><dd>${money(q.deposit)}</dd><dt>Fees</dt><dd>${money(q.fees)}</dd><dt>Final payment</dt><dd>${money(q.balloon)}</dd>
   <dt>Total repayable</dt><dd><strong>${money(q.totalRepayable)}</strong></dd><dt>Total cash cost</dt><dd>${money(q.totalCash)}</dd><dt>Cost of credit</dt><dd>${money(q.costOfCredit)}</dd><dt>Commission</dt><dd>${q.commission ? esc(q.commission) : "not disclosed — ask"}</dd></dl>
   ${q.problems.length ? `<ul class="finance-warn">${q.problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
   <div class="finance-actions"><button type="button" class="finance-btn" data-handoff="${esc(q.id)}">Hand off</button><button type="button" class="finance-btn secondary" data-track="${esc(q.id)}">Track</button><button type="button" class="finance-btn secondary" data-remove="${esc(q.id)}">Remove</button></div>
  </article>`).join("")}</div>`;
}
$("c-result").addEventListener("click", (e) => {
  const t = e.target.closest("button"); if (!t) return;
  const q = quotes.find((x) => x.id === (t.dataset.handoff || t.dataset.track || t.dataset.remove)); if (!q) return;
  if (t.dataset.remove) { quotes = quotes.filter((x) => x !== q); store.set(KEYS.quotes, quotes); renderQuotes(); }
  if (t.dataset.handoff) { renderHandoff(q); $("handoff").scrollIntoView(); }
  if (t.dataset.track) {
    const a = E.analyseQuote(q);
    saveTracker({ provider: q.provider, status: "Researching", quote: `${money(a.monthly)} × ${a.n}${a.apr !== null ? ` at ${a.apr}% APR` : ""}`, totalCost: a.totalCash });
    $("tracker").scrollIntoView();
  }
});

// ---------- HANDOFF ----------
function readyDocs() { return [...document.querySelectorAll("[data-doc]:checked")].map((x) => x.dataset.doc); }
function renderHandoff(q) {
  const a = E.analyseQuote(q, budget());
  const all = ["Proof of identity", "Proof of address", "Income evidence", "Bank statements", "Existing credit details", ...(profile.purchaseType === "car" ? ["Vehicle / purchase details"] : [])];
  const ready = readyDocs();
  const missing = all.filter((d) => !ready.includes(d));
  const m = E.summariseMoney(profile);
  const fca = q.fca ? `https://register.fca.org.uk/s/search?q=${encodeURIComponent(q.fca)}&type=Companies` : "https://register.fca.org.uk/s/";
  $("handoff-result").innerHTML = `<h3>${esc(q.provider)}</h3>
  <div class="finance-handoff-grid">
  <div><strong>What you want</strong><p>${esc(E.ROUTES[profile.purchaseType]?.name || "Finance")}${profile.purpose ? " for " + esc(profile.purpose) : ""}: ${money(a.amount)} at ${money(a.monthly)} × ${a.n}. Total cash cost ${money(a.totalCash)}.</p></div>
  <div><strong>What you've worked out</strong><p>Income ${money(m.income)}/month, ${money(m.disposable)} left after essentials and credit. <span class="tag est">Planning estimate</span></p></div>
  <div><strong>Documents ready</strong><p>${ready.length ? ready.map(esc).join(", ") : "None ticked yet"}</p></div>
  <div><strong>Still outstanding</strong><p>${missing.length ? missing.map(esc).join(", ") : "Nothing on our list — the provider may ask for more."}</p></div>
  <div><strong>What the provider decides</strong><p>Eligibility, the actual rate you're offered, affordability checks, and whether to lend. That's the <span class="tag dec">Lender decision</span>.</p></div>
  <div><strong>What to ask them</strong><ul>${(E.ROUTES[profile.purchaseType]?.ask || E.ROUTES.other.ask).map((x) => `<li>${esc(x)}</li>`).join("")}<li>Is this a soft or hard search?</li><li>${q.commission ? "Can you confirm the commission you disclosed?" : "Are you paid commission for this, and how much?"}</li></ul></div>
  <div class="wide"><strong>What will be shared</strong><p>Nothing by us. Pleading Sanity sends no data to ${esc(q.provider)}. You'll type your own details on their site, or speak to them directly. Give only true information, and only what they need.</p></div>
  </div>
  <label class="finance-check-inline"><input type="checkbox" id="handoff-consent"> I understand I'm now dealing with ${esc(q.provider)} directly, and they make the decision.</label>
  <div class="finance-actions">${q.url ? `<a class="finance-btn" id="handoff-go" href="${esc(q.url)}" target="_blank" rel="noopener nofollow" aria-disabled="true">Go to ${esc(q.provider)}</a>` : `<span class="finance-muted">No application link saved for this quote. Go to the provider's own website directly — don't follow links from unexpected messages.</span>`}
  <a class="finance-btn secondary" href="${esc(fca)}" target="_blank" rel="noopener">Check them on the FCA Register</a></div>`;
  const go = $("handoff-go");
  if (go) {
    go.addEventListener("click", (e) => { if (!$("handoff-consent").checked) { e.preventDefault(); $("handoff-consent").focus(); } });
    $("handoff-consent").addEventListener("change", (e) => go.setAttribute("aria-disabled", String(!e.target.checked)));
  }
}

// ---------- WHY DID I FAIL? ----------
const declineForm = $("decline-form");
let lastDecline = null;
declineForm.addEventListener("submit", (e) => {
  e.preventDefault();
  lastDecline = Object.fromEntries(new FormData(declineForm));
  const r = E.declineReport(lastDecline, profile);
  const list = (title, items, tag = "ul") => `<h3>${title}</h3><${tag}>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</${tag}>`;
  $("decline-result").innerHTML = `<p class="finance-mode">${esc(r.disclaimer)}</p>
  ${r.safety.stop ? `<p class="finance-verdict over"><strong>${esc(r.safety.headline)}</strong> See the free help at the top of your results.</p>` : ""}
  ${list("What we know", r.known)}${list("What we don't know", r.unknown)}${list("Possible blockers", r.possible)}
  ${list("Questions to ask the lender", r.ask, "ol")}${list("Documents to check", r.documents)}${list("Credit report checks", r.creditChecks)}
  <h3>Affordability check</h3><p>${esc(r.affordability)}</p>
  ${list("What you can legitimately change", r.change)}${list("What not to do", r.dont)}${list("Next best route", r.next, "ol")}
  ${list("Don't apply again yet if…", r.waitIf)}
  <div class="finance-actions"><button type="button" class="finance-btn secondary" id="decline-copy">Copy report</button><button type="button" class="finance-btn secondary" id="decline-track">Add to tracker as ${esc(lastDecline.outcome === "referred" ? "Referred" : "Declined")}</button></div>`;
  $("decline-copy").addEventListener("click", () => copyText($("decline-result").innerText, $("decline-copy")));
  $("decline-track").addEventListener("click", () => { saveTracker({ provider: lastDecline.provider || "Unknown provider", status: lastDecline.outcome === "referred" ? "Referred" : "Declined", date: lastDecline.date, notes: lastDecline.told }); $("tracker").scrollIntoView(); });
});
$("decline-ai").addEventListener("click", () => {
  const f = Object.fromEntries(new FormData(declineForm));
  $("a-question").value = `I was ${f.outcome === "referred" ? "referred" : "declined"} by ${f.provider || "a provider"} (${f.search === "hard" ? "full application" : f.search === "soft" ? "soft search" : "not sure which check"}). What do I know, what can't I know, and what should I do next?`;
  $("a-quote").value = f.told || "";
  ask("decline");
  $("adviser").scrollIntoView();
});

// ---------- DOCUMENTS ----------
const docSelect = $("doc-type");
docSelect.innerHTML = Object.entries(E.DOCUMENT_TYPES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
function currentDoc() {
  return E.buildDocument(docSelect.value, { profile, ready: readyDocs(), quotes, note: $("letter").value, decision: $("doc-decision").value });
}
$("make-letter").addEventListener("click", () => { $("pack-result").textContent = currentDoc() + "\n\nCheck every statement before you send it."; });
$("copy-pack").addEventListener("click", (e) => copyText(currentDoc(), e.currentTarget));
$("download-pack").addEventListener("click", () => {
  const blob = new Blob([currentDoc()], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `sane-finance-${docSelect.value}-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$("print-pack").addEventListener("click", () => { $("pack-result").textContent = currentDoc(); document.body.classList.add("finance-printing"); window.print(); });
window.addEventListener("afterprint", () => document.body.classList.remove("finance-printing"));
async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); flash(btn, "Copied"); }
  catch {
    const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select();
    const ok = document.execCommand("copy"); t.remove(); flash(btn, ok ? "Copied" : "Copy failed");
  }
}
function flash(btn, msg) { if (!btn) return; const old = btn.textContent; btn.textContent = msg; setTimeout(() => (btn.textContent = old), 1600); }

// ---------- TRACKER ----------
let tracker = store.get(KEYS.tracker, []);
if (!Array.isArray(tracker)) tracker = [];
tracker = tracker.map(E.cleanTrackerEntry);
const trackerForm = $("tracker-form");
const tf = (name) => trackerForm.elements.namedItem(name);
tf("status").innerHTML = E.TRACKER_STATUSES.map((s) => `<option>${esc(s)}</option>`).join("");
function saveTracker(entry) {
  const clean = E.cleanTrackerEntry(entry);
  const i = tracker.findIndex((x) => x.id === clean.id);
  if (i >= 0) tracker[i] = clean; else tracker.unshift(clean);
  store.set(KEYS.tracker, tracker); renderTracker();
}
trackerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(trackerForm));
  if (f.status === "Approved" && !confirm("Only mark Approved if the provider has actually told you it's approved. Has it?")) return;
  saveTracker(f); trackerForm.reset(); tf("id").value = "";
});
function renderTracker() {
  const box = $("tracker-list");
  if (!tracker.length) { box.innerHTML = '<p class="finance-muted">Nothing tracked yet.</p>'; return; }
  box.innerHTML = tracker.map((t) => `<article class="finance-track-card"><h3>${esc(t.provider)} <span class="tag s-${esc(t.status.toLowerCase().replace(/\s+/g, "-"))}">${esc(t.status)}</span></h3>
  <p class="finance-muted">${esc(t.date)}${t.quote ? " · " + esc(t.quote) : ""}${t.totalCost ? " · total " + money(t.totalCost) : ""}</p>
  ${t.decision ? `<p><strong>My decision:</strong> ${esc(t.decision)}</p>` : ""}${t.notes ? `<p>${esc(t.notes)}</p>` : ""}
  <div class="finance-actions"><button type="button" class="finance-btn secondary" data-edit="${esc(t.id)}">Edit</button><button type="button" class="finance-btn secondary" data-del="${esc(t.id)}">Delete</button></div></article>`).join("");
}
$("tracker-list").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const t = tracker.find((x) => x.id === (b.dataset.edit || b.dataset.del)); if (!t) return;
  if (b.dataset.del) { if (!confirm(`Delete the entry for ${t.provider}?`)) return; tracker = tracker.filter((x) => x !== t); store.set(KEYS.tracker, tracker); renderTracker(); }
  if (b.dataset.edit) { for (const [k, v] of Object.entries(t)) if (tf(k)) tf(k).value = v || ""; tf("provider").focus(); }
});

// ---------- AI ADVISER ----------
function profileSummary() {
  const m = E.summariseMoney(profile);
  const a = E.affordability(profile);
  const f = E.circumstanceFactors(profile).map((x) => x.title).join(", ") || "none given";
  return `Product: ${E.ROUTES[profile.purchaseType]?.name}. Borrowing ${a.borrow} over ${a.term} months. Monthly income ${m.income.toFixed(0)}, essentials ${m.essentials.toFixed(0)}, existing credit ${m.commitments.toFixed(0)}, left ${m.disposable.toFixed(0)}. Work: ${profile.employment}. Circumstances: ${f}. Behind on bills: ${profile.behindOnBills}.`;
}
async function ask(mode = "general") {
  const question = $("a-question").value.trim();
  const quote = $("a-quote").value.trim();
  const out = $("a-result");
  if (!question && !quote) { out.textContent = "Type a question or paste a quote first."; return; }
  if (!navigator.onLine) { out.textContent = "You're offline. The AI family needs a connection — every calculator on this page still works."; return; }
  out.textContent = "The family is checking the question — one mind drafts, another checks…";
  $("ask-adviser").disabled = true;
  try {
    const r = await fetch("/api/finance-adviser", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, quote, mode, profile: $("a-consent").checked ? profileSummary() : "" }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "The AI family can't be reached right now.");
    out.innerHTML = `<p class="finance-muted"><span class="tag">AI explanation</span> Not advice and not a lender decision. Check anything important with the provider.</p><div class="finance-ai-text"></div><p class="finance-muted">Answered by: ${esc(d.provider || "the family")}</p>`;
    out.querySelector(".finance-ai-text").textContent = d.reply || "";
  } catch (e) {
    out.textContent = (e && e.message) || "The AI family can't be reached right now. Everything else on this page still works.";
  } finally { $("ask-adviser").disabled = false; }
}
$("ask-adviser").addEventListener("click", () => ask("general"));
document.querySelectorAll(".finance-chip").forEach((b) => b.addEventListener("click", () => { $("a-question").value = b.dataset.question; $("a-question").focus(); }));
$("save-brief").addEventListener("click", () => {
  store.set(KEYS.brief, { question: $("a-question").value.trim(), quote: $("a-quote").value.trim(), savedAt: new Date().toISOString() });
  $("a-result").textContent = "Your brief was saved on this device only.";
});
const brief = store.get(KEYS.brief, null);
if (brief) { if (brief.question) $("a-question").value = String(brief.question); if (brief.quote) $("a-quote").value = String(brief.quote); }

// ---------- PRIVACY ----------
$("export-data").addEventListener("click", () => {
  const data = { exportedAt: new Date().toISOString(), profile, quotes, tracker, brief: store.get(KEYS.brief, null) };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-sane-finance-data.json"; document.body.append(a); a.click(); a.remove();
});
$("delete-data").addEventListener("click", () => {
  if (!confirm("Delete your finance profile, quotes, tracker and saved brief from this device? This can't be undone.")) return;
  Object.values(KEYS).forEach(store.drop);
  profile = { ...E.EMPTY_PROFILE }; quotes = []; tracker = [];
  form.reset(); fillProfile(); $("a-question").value = ""; $("a-quote").value = "";
  renderAll(); $("handoff-result").textContent = "No provider chosen yet."; $("decline-result").innerHTML = ""; $("pack-result").textContent = "";
  $("privacy-result").textContent = "Deleted. Nothing from the Sane Finance GBT is left on this device.";
});

// ---------- BOOT ----------
function renderAll() { renderSafety(); renderAffordability(); renderCredit(); renderRoute(); renderProviders(); renderQuotes(); }
fillProfile(); applyConditional(); showStep(0); renderAll(); renderTracker(); loadProviders();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
