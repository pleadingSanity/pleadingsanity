# Shard 1 Work Record — Backend Functions + Arron AI + Service Workers
# Full-power audit 2026-11-10 (UTC). Scope: netlify/functions, netlify/lib, js/arron*, js/crisis*, arron*.html, app.html, sw*.js, arron-knowledge*.json, tests/*arron*/*crisis*/*chain*/*kb*/*grok*.

## Baseline (main, before changes)
- npm test: 229 tests, 217 pass, 12 fail — ALL 12 failures are stale music/radio/playlist tests (out of this shard's scope, untouched).
- node scripts/validate-build.cjs: exit 0.

## Issues found + fixed (landed in this PR)

### 1. SECURITY — /api/ops/ai-probe (arron-health.mts) was unauthenticated
- probe=1 (credential GET) and probe=2 (real 1-token chat per provider) made 4 real provider calls per request with NO auth and NO rate limit. Anyone could burn AI budget continuously.
- FIX: probe=1/2 now require `?token=` matching `PS_PROBE_TOKEN` when that env var is set (403 otherwise); when unset, the `ai` rate-limit bucket (6/min) bounds abuse. probe=0 (key presence + budget) stays public — it never calls a provider. Invalid probe levels return 400. Provider error snippets are now run through `sanitizeProbeError()` which strips any credential-looking string (sk-/nfp_/ghp_/xox/Bearer) before it is ever returned.
- Note: probe=2 still does NOT increment the day:site budget counter (ops traffic, by design) — the token/rate-limit guard is the spend bound.

### 2. SECURITY — finance-providers.mts fetched env-configured feed URL with no host validation
- `FINANCE_PROVIDER_FEED_URL` was fetched directly. A misconfigured/compromised env value could point at a private/metadata host (SSRF-class, same class as #302's url_fetch fix which only covered arron-tools.ts).
- FIX: added `feedUrlAllowed()` guard (https-only, blocks localhost/private/link-local/metadata.google.internal/credentials-in-URL, same rules as #302). Blocked feeds return `connected:false` with a human message + a console.warn. Also added explicit `redirect:"follow"` + 8s timeout on getJSON.

### 3. LATENCY — Arron deploy-hook fetch (arron.mts) had no timeout
- `fetch(NETLIFY_BUILD_HOOK, {method:"POST"})` could hang and delay the whole chat reply. FIX: `AbortSignal.timeout(5000)`.

### 4. CRISIS COMPLETENESS — findahelpline.com missing from backend signpost + Arron pages
- CRISIS_SIGNPOST in arron.mts (used in crash/rate-limited/all-quiet replies) listed 999/116123/SHOUT85258/111/Childline/DA helpline but NOT findahelpline.com (required by house rule 4). FIX: added "International helplines: https://findahelpline.com/".
- arron.html, arron-app.html, app.html: all numbers already tappable (tel:+sms:85258) except findahelpline.com link was absent on all three. FIX: added findahelpline.com link to crisis footer/banner on all three. app.html's crisis-strip (line 135) had plain-text numbers — made every number tappable (tel:999, tel:116123, sms:85258, tel:111, tel:08001111, tel:08082000247).

### 5. REGRESSION TESTS added — tests/shard1-probe-guard.test.mjs (7 tests, all pass)
- Probe guard source-level assertions (PS_PROBE_TOKEN, allow("ai"), 403, probe=0 public, level whitelist).
- Behavioral: `sanitizeProbeError` strips sk-/nfp_/ghp_/xox/Bearer tokens (fixtures built by string concatenation — no literal secret in repo).
- Behavioral: `feedUrlAllowed` allows public https, blocks http/localhost/127.0.0.1/192.168/10/169.254/metadata.google.internal/credentials-in-URL/garbage.
- CRISIS_SIGNPOST completeness + deploy-hook timeout assertions.
- Arron pages tappable-crisis assertions (sms:85258, findahelpline.com, tel:999, tel:116123 on arron.html/arron-app.html/app.html).
- Pure helpers are extracted from source and eval'd, so the heavy Netlify/DB imports in the function files are never loaded during tests.

## Verified clean (no change needed)
- arron-tools.ts fetchUrl: #302 fix present — private/loopback/link-local/metadata block, DNS re-check with 800ms timeout, 3-redirect cap with per-hop re-validation, https-only, no user/pass, 8s per-hop timeout, never throws. Provider order GPT→Claude→Gemini→Grok unchanged.
- arron.mts /api/arron/health: booleans only (providerKeyPresence, length>8 threshold), no values. owner-ai-status/grok-test owner-gated. Chat crash handler returns JSON with crisis signpost, never a stack trace. Chat rate-limited (allow("chat") + allowToday("person"), owner exempt, crisis reserve).
- rate-limit.ts: IPs hashed, fail-closed, daily budget counters, crisis reserve. No raw IP stored.
- images.mts: no fetch (blob store), path traversal guarded, authz checked.
- ytFeed.mjs: fixed googleapis host, params encoded via searchParams.set, no SSRF. CORS * acceptable for public feed.
- All throw sites (ai-family-daily, ai-post, studio, studio-podcast-background) wrapped in try/catch; studio create() throw caught by outer handler try.
- sw.js / sw-arron.js: both skip /api/ and /.netlify/ from caching — no private API responses cached.
- arron-knowledge.json / content/arron-knowledge.json: founder truth correct — Shane stopped fitting solar; organises/oversees; trusted local MCS/NAPIT fitters install; AI Office paperwork only. No "we fit solar". No invented reviews/savings.
- No purple/violet/indigo/lavender in scope. No secret literals in scope (test fixtures concatenated).
- xAI_KEY empty handled: nonEmpty() requires length>8, so empty xAI_KEY → grok key false; probe/chain send empty Bearer and fail gracefully (no crash).

## Shane-action gaps (env vars / config to set)
1. **PS_PROBE_TOKEN** — set on Netlify to lock /api/ops/ai-probe?probe=1&2 behind ?token=. Until set, probes are rate-limited (6/min) but not token-locked.
2. **GROK_API_KEY / xAI_KEY** — xAI_KEY is present but EMPTY on this deploy (per house note). Grok will be quiet until a real key is set; chain degrades gracefully to next provider. Consider removing the empty xAI_KEY or setting GROK_API_KEY.
3. **FINANCE_PROVIDER_FEED_URL** — if set, must be a public https URL; private/localhost values are now blocked (by design). Verify any configured feed still loads.

## Validation results (clean clone, final)
- node scripts/validate-build.cjs: exit 0.
- npm test: 236 tests, 224 pass, 12 fail — the SAME 12 pre-existing music/radio failures as main baseline. 0 new failures. 7 new tests (shard1-probe-guard) all pass.
- grep diff: 0 secret literals, 0 purple, 0 "we fit solar", 0 glued words.
