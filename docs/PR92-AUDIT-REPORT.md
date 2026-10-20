# PR #92 — independent safety audit (2026-10-20)

**Decision: FIX FIRST / MORE TESTING NEEDED. DO NOT MERGE.** PR: https://github.com/pleadingSanity/pleadingsanity/pull/92. At review, PR was draft, GitHub reported `mergeable=false`; its head is behind a main branch that already changed the same function. No PR branch edits were made.

## 1. Full changed-file list
Exactly **one** changed file: `netlify/lib/ai-chain.ts` (+6, −7). PR title: *Fix Arron AI chain circuit-breaker failure counting and hop logs*. It does **not** change `arron-knowledge.json`, `poker.html`, `sanity-solitaire.html`, `docs/`, pages, routes, privacy, crisis text or static assets. This is a code-diff finding, not a runtime guarantee.

## 2. Verified safe intent
- Counts an exhausted provider hop once, instead of once per model attempt. Correct intended unit for provider circuit-breaker failures.
- Keeps the GPT → Claude → Gemini → Grok loop and existing `recordHop(provider,true)` on success.
- Does not log prompt content, user turns or API keys in its new logging statements.

## 3. Conflicts and outdated changes
- **Already fixed differently on main:** main currently uses `hopSucceeded`, `hopFailure` and a single `recordHop(provider,false,hopFailure)` after all models fail. The PR's `hopFailed`/ `exhausted` change duplicates this existing one-hop behaviour. Do not overwrite the newer main implementation.
- Main logs a sanitised reason from `why(error)` (e.g. HTTP status/category); the PR reduces all exhausted failures to `exhausted`, losing diagnostic specificity. Neither logs user content in the shown code path.
- PR changes the circuit-open log format and removes per-model diagnostic messages. Useful only if log-consumer requirements and privacy expectations are checked; not a demonstrated fix.
- GitHub reported `mergeable=false` at review. Rebase/conflict review is necessary **before** any future approval, but leave the draft untouched for now.

## 4. Possible breakage / unverified behaviour
- No missing new assets, links or routes in this one-file PR; game art/engine changes on main are unrelated.
- **Untested:** simulated model failure then success in the same provider; all models failing once; three failed provider hops and 60-second cooldown; circuit reopening; time-budget expiry; disabled Grok key; no paid spare use without approval; crisis response when every provider fails.
- Existing circuit-breaker state is **in-memory per serverless instance**. It is not globally shared, so cross-instance reliability is limited. This is an existing architecture constraint, not introduced by the PR.
- Timeout `OutOfTime` throws before recording that provider hop; whether to count it is a policy decision needing tests. Changing this blindly could cause false circuit trips.
- Main contains optional spare-provider logic gated by configuration; check cost and privacy approval independently before any runtime modifications. Do not treat it as a new canonical provider.
- This PR itself does not touch the authoritative root soul file, crisis page, disclaimer or privacy paths. Preserve all four crisis contacts: 999; Samaritans 116 123; SHOUT 85258; NHS 111 option 2. Arron is not a therapist.

## 5. Safe polish actually added elsewhere
- **No edits to PR #92.** Independently improved the existing production Poker page in `733e4ac685d68e1e21eaae5d06cbd697bc986fc6`: constrained full-page tavern artwork, added an opaque dark gameplay surface, reduced mobile hero height, improved responsive spacing and contrast. This responds to the founder's mobile screenshot; no engine JS was changed.
- No new meta titles, footers, navigation or status badges were added to PR #92 because it contains **no new pages**. No new files/services/paid tools added other than this explicitly requested report.

## 6. Recommendation and verification
**FIX FIRST / MORE TESTING NEEDED.** Keep PR #92 draft; main already implements its key provider-hop counting improvement. A later maintainer can close as superseded *only after* the test matrix above is green and Shane approves. Do not merge the old diff into newer main.

Test Poker on a real 360px Android viewport and desktop: hero contained, no distracting wallpaper behind controls, all seats and cards legible, Fold/Call/Raise/New Hand working, friend-room status honest, no horizontal overflow. Verify CI and Netlify SHA for `733e4ac` separately. Source inspection is **not** a browser playthrough.

**Founder decision remains final. Evolution Not Erasure.**
