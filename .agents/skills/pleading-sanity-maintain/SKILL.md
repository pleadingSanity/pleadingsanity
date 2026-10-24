---
name: pleading-sanity-maintain
description: Audit, fix and polish the existing Pleading Sanity website, GitHub repo, Netlify deploys and related brand assets. Use for Pleading Sanity maintenance, Firebase sidecar review, game or mobile polish, uploaded handoff reconciliation, and requests to check or push the site. Preserve the existing site and report verified evidence.
---

# Pleading Sanity maintenance

## Ground the work

Use `pleadingSanity/pleadingsanity` as the canonical repository and
`https://pleadingsanity.co.uk` as the primary site. Read current `AGENTS.md`,
`AI_HANDOFF.md` (Start Here and latest entries), `CLAUDE.md` and relevant source.
Resolve instruction conflicts using the current user's authorization and the
handoff's conflict ruling. Recheck remote branch heads, PRs and published deploy
SHAs; a successful build is not proof of runtime behaviour.

Treat uploaded snapshots and past handoffs as dated references. Read
[reference-inputs.md](references/reference-inputs.md) when these source attachments
or the character collection are relevant. Do not replace current pages with an
older full-page snapshot or copy unverified permission/ownership claims.

## Execute a small, reviewable improvement

1. Inspect existing pages, scripts, assets and open PRs before adding anything.
   Prefer updating the active relevant branch. Use a separate branch for unrelated
   work; never create another repository or hosted project by assumption.
2. Record the baseline, one concrete problem, affected paths and expected behaviour.
3. Preserve the crying-brain identity, existing page URLs, manifests/PWA scopes,
   Arron identity and configured GPT → Claude → Gemini → Grok order. Follow the
   current source contracts for crisis support, privacy and local saves.
4. Keep default extra spending at £0. Do not add subscriptions, billing methods,
   paid calls, telemetry or public user-data features without user authorization.
5. Preserve production Netlify Identity and existing database flows. Treat Firebase
   as optional until the current `docs/FIREBASE-SETUP.md` and actual configuration
   establish otherwise. Do not infer remote service/rule status from SDK startup.
6. Make scoped changes. Render user-provided strings with `textContent` or a proven
   safe DOM builder. Never paste private journals, credentials or birth details into
   public commits, generated image prompts or issue bodies.
7. Run `python3 scripts/audit-site.py`, `git diff --check` and tests relevant to the
   actual risk. If present and Firebase changed, run
   `node --experimental-vm-modules --test scripts/test-firebase.mjs` on Node 24.
   Exercise changed UI at phone/desktop widths, keyboard and reduced motion when
   browser tooling is available; state a missing browser test explicitly.
8. Append concise evidence to `AI_HANDOFF.md`. Push the tested branch and confirm
   checks/deploy preview for its exact SHA. Preserve draft status for #92. Follow
   the user's approval limits before a security/auth/data merge or production deploy.

## Handle astrology requests

Use the existing [cosmic-reflections.html](../../../cosmic-reflections.html)
request builder and its feature brief before proposing another page. Read
[astrology-feature.md](references/astrology-feature.md) for the boundary between
local reflection/request preparation and actual provider-calculated charts.
Do not infer a birth time or claim a connected ChatGPT app is a public website API.

## Report outcomes

Lead with what changed and why. Give the commit and PR/preview links, tests actually
run, production status and remaining blockers. Distinguish local mocks, preview
HTTP checks, browser flows and real provider tests. Never claim another AI was
contacted, every chat was updated, an image was installed, or a service will run
forever without evidence. A repository skill is a reusable workflow, not a grant
of account access or automatic propagation to every assistant.
