# Pleading Sanity — All-AI coordination handoff

Date: 12 October 2026
Audience: Shane Cooper (founder), Claude, GPT, Gemini, Grok
Repo: [pleadingSanity/pleadingsanity](https://github.com/pleadingSanity/pleadingsanity) on `main`
Site: https://pleadingsanity.co.uk
Motto: One source. One family. Evolution, not erasure. Love over money.

This file does not replace [AI_HANDOFF.md](https://github.com/pleadingSanity/pleadingsanity/blob/main/AI_HANDOFF.md). That file is the verified log. This one is the October coordination brief: what Shane does by hand, what Grok already wrote, and what the other minds must not break.

Nothing in this file was submitted to a company. Nothing here raises a bill. Default extra spend: £0.

## 1. Shane — do these by hand

Do not paste a key into chat, GitHub, or a doc.

1. Open the Netlify site `pleadingsanity`. Deploys. Confirm the published commit matches `main`. A successful deploy is not proof that every page journey works.
2. Leave these unset unless you have read the terms and chosen to spend: `PS_PAID_SPARES_APPROVED`, `PS_SPARES_PRIVACY_APPROVED`. `PS_IN_PROFIT` does not authorise a paid call. The chain already warns if someone sets it alone.
3. GPT is returning HTTP 429 in production (gateway and the stored key). Claude is the mind that is answering. Do not buy a higher OpenAI cap unless you decide the £0–£5 month is worth it. If you do, set a hard monthly limit in the OpenAI billing page. An email alert is not a cap.
4. Grok on the live site returns HTTP 403 because the xAI balance is empty. On 12 October 2026 both the chat endpoint and the responses endpoint, model `grok-4.7`, returned the vendor code `spending-limit`. Replacing the model name will not fix it. Add credit only if you choose to spend. In Netlify, do not add a second key. After you add credit yourself, redeploy once and send one Arron message. If the log still says `spending-limit`, stop.
5. Do not add a separate `GEMINI_API_KEY` "just in case". Gemini already goes through the Netlify AI Gateway (`gemini-3.8-flash` in the chain). A second key is a second bill.
6. Do not upgrade either Firebase project to Blaze. `pleading-sanity-36bfa` is the website backend and its Firestore API was still disabled when last probed. `pleading-sanity` is the separate AI Studio app. Do not paste one project's app id into the other.
7. `MAX_TOKENS_ARRON` is set on the site and, as of the 11 October handoff, no code reads it. Do not treat that variable as a spending cap.
8. Grants: do not click Apply until you have read the form. Details are in section 4. No one has agreed to sponsor this house.

## 2. What is actually connected

Verified from `netlify/lib/ai-chain.ts` on `main` and the 11 October handoff. Not re-tested against production in this session.

| Order | Who | How | Last known result |
|---|---|---|---|
| 1 | GPT `gpt-5.6-sol` | Netlify AI Gateway, then `OPENAI_API_KEY` if the gateway fails for a reason other than 402 or 429 | Production HTTP 429. Chain moves on. |
| 2 | Claude `claude-sonnet-5-5` (creator model `claude-opus-5-5`) | Netlify AI Gateway | Answered in production, 3 of 3, on 11 October. |
| 3 | Gemini `gemini-3.8-flash` | Netlify AI Gateway | Answered in a build-environment test. |
| 4 | Grok `grok-4.7`, then `grok-3` only if the first failure is not the account | xAI direct, `https://api.x.ai/v1` | HTTP 403 `spending-limit`. Credits are empty. Not a wrong URL. |
| 5 | OpenRouter names ending in `:free` | Only if `OPENROUTER_API_KEY` is set | Not exercised. Personal chats skip them unless `PS_SPARES_PRIVACY_APPROVED` is set. |
| Last | Local crisis lines and the quiet-house reply | Already in the Arron function | £0 |

The chain is one walk, not four calls at once. Each lab gets at most 8 seconds. The whole walk is capped (36 seconds unless the caller sets less). SDK retries are off, because a retry on a 429 is a second bill. A daily admission counter lives in `netlify/lib/rate-limit.ts`.

Do not replace `netlify/functions` Arron with a new router that keeps rate limits in a memory `Map`. On Netlify that map dies with the isolate. It is not a cap. The file already on `main` is the router. Evolution, not erasure.

This Grok desk (the app in front of you) is a separate, smaller bot. It can open doors and point at an official register. It is not Arron, not a lender, and it does not write to the live database.

## 3. xAI 403 — found

It is an empty balance. The vendor says: run out of credits, or a Grok subscription is required. Both `POST /v1/chat/completions` and `POST /v1/responses` returned that same 403 for `grok-4.7`. So this is not a missing function, not a bad URL, and not a retired model name.

The code now logs `HTTP 403 spending-limit` and does not call the second Grok name after that. A second name would be the same account, and the same refusal. No credit was added. Default spend remains £0.

Grok answers again only after you add credit in the xAI console yourself. I cannot do that from here, and I will not do it without you choosing the spend.

## 4. Money — verified, and not verified

I cannot see your card statements from here. Do not treat the table below as an invoice.

| Service | What I could actually check | Hard cap? |
|---|---|---|
| Netlify | Static site plus functions. Free tier can stop when the allowance is gone. I did not read this month's invoice. | Yes, if you stay on a plan that cannot quietly raise itself. Confirm in the Netlify billing page. |
| OpenAI | Production chat returned 429. That is a limit or an empty quota, not a measured pound amount. | Only if you set a hard monthly limit. An alert email is not one. |
| Anthropic | Claude answered through the gateway. I did not read the Anthropic balance. | A prepaid balance with auto-reload off is a real stop. I have not seen yours. |
| Gemini | Gateway path exists. I did not read a Google bill. | The free AI Studio tier cannot bill until you attach billing. Do not attach it for this site while the gateway works. |
| xAI | 403. I did not read the xAI balance. | A prepaid balance with auto-reload off is a real stop. Replacing a dead key should not mean turning on uncapped billing. |
| Firebase `pleading-sanity-36bfa` | Firestore API was disabled. Spark cannot charge. | Yes, until someone switches on Blaze. Do not. |
| Firebase `pleading-sanity` | Separate AI Studio app. Not this website's database. | Keep Spark. |

Cheapest working setup: leave the chain as it is. Claude is carrying Arron. GPT sits out until the 429 is a choice you make. Grok sits out until the 403 key is replaced. No council button for visitors. `workAsOne` is two paid calls and only when you ask. `askCouncil` is owner-only and calls every mind. Do not wire either to a public button.

### Programmes worth reading — not applied

- Claude Startups, [claude.com/programs/startups](https://claude.com/programs/startups). As of 12 October 2026 their own FAQ says bootstrapped startups may apply, and that the free Team year and the $1,000 API credit are over capacity. They may re-review applications. Partner-VC credits are a different offer and do not apply here. Apply only from the Claude Console, and only if you want to.
- Google for Startups Cloud, [startup.google.com/cloud](https://startup.google.com/cloud/). Their page says the Start tier is up to $2,000 in credits for an early company that is not equity-funded. Scale and AI tiers are for funded companies. Credits are not cash. Do not turn on Blaze to "use" a credit you do not have yet.
- Netlify community sponsorship: I did not find a programme I can point you at tonight. Do not claim one exists.
- xAI: I did not find a social-impact credit programme to name. Do not invent one.

Pleading Sanity is not described here as a registered charity. I have not seen a charity number.

Income that stays honest: the shop, a voluntary gift, and grants you submit yourself. Crisis pages and Arron stay free. No sale of journals. No fee for sitting with someone who is not safe. No creator payout promise until the terms exist. The 11 October handoff already says that payout system is not built.

## 5. Grok — the work, already done

These are drafts. They are not on the live feed until you post them. No image call. No video call.

### MC Synapse — twelve verses

One voice. No other mind in the booth. Not a medical claim.

1. I did not come back polished. I came back breathing. That counted.
2. The night told a story. I wrote a truer one in the margin.
3. Love over money is not a slogan when the rent is real. It is the order of the list.
4. Three small coats on the stair. That is the board I answer to.
5. Evolution, not erasure. I keep the scar. I do not keep the script.
6. They sold me a louder mind. I bought a quieter kitchen.
7. If the bar needs me broken to clap, the bar can wait outside.
8. I pass the mic to the person still here. Survival is not a brand deal.
9. No one owns the night. We just refuse to leave each other in it.
10. Soft, not small. A frequency, not a fight. Turn it down when the body says no.
11. I will not rhyme a child into a lesson. I will rhyme the door that stays open.
12. One source. One family. If you are still reading, you are still in the room. Stay.

### Keep Kids Sane — three classroom beats

The timed pilots already live in `docs/kids-animation-ready.md`. Do not film these instead of those. These are the short lessons a parent can read tonight.

1. Breath. Picture a paper boat. In for four, out for six. If the hold scares them, drop the hold. Caption: "Longer out. That is the whole trick."
2. Water. A glass before a big feeling. Not a cure. A first kind thing. Caption: "Thirst tells crueller stories."
3. One person. Draw the person they would tell. If they cannot name one, the page says the Samaritans number is for grown-ups to call, and a child tells a teacher. Caption: "You do not have to be brave alone."

No episode is filmed. No YouTube upload is claimed.

### Four hub posts — newest would go first, no ranking

1. The house is open. Arron sits. He is not a doctor. If the night is heavy: Samaritans 116 123, or text SHOUT to 85258.
2. Twelve quiet bars from MC Synapse are in the book, not on a billboard. Love over money still means the rent gets named.
3. Keep Kids Sane is a story you can read at the table. It is not a cartoon yet. The script is the part we have.
4. The money desk does not lend. It shows a month, then the official register. A yes from a stranger is not a kindness if the month cannot hold it.

## 6. Claude, GPT, Gemini — do not close the loop by replacing it

Claude

- Do not drop in a second Arron router. Harden the one in `netlify/lib/ai-chain.ts` only if a test shows a hole.
- The image route still serves a blob to anyone who has the link. That fix is the open one. It needs a test, then a deploy preview. Not a rewrite.
- Analytics is off on every page. Google Analytics was removed from all remaining public pages on 12 October 2026, and `privacy.html` says so. Do not put the tag back. Any future analytics needs a default-denied consent step and must never load on the crisis, support, sanctuary, journal, Arron, finance, or account pages.
- The Survivor Journal (`journal-vault.html`) stores entries under the localStorage key `journalVault`. `ps_journal` / `ps_journal_entries` belongs only to archived code in `archive/legacy-js/sanctuary-bridge.js`. Briefings must use `journalVault`.
- Drizzle and Netlify Database stay inside the free allowance. No new table for chat logs "just to be safe". `arron_messages` still has no retention limit. A retention job is a design, not a cron you switch on tonight.

GPT

- Read `AI_HANDOFF.md` before any plan. The creator 90% offer is still a proposal. Do not write payout code.
- Do not recommend flagship models for Arron. The live models are already the ones in the chain. Swapping them for a cheaper name is a behaviour change and needs a preview test, not a find-and-replace.
- `ai-status` on an old branch imports `providerRegistry()`, which current `ai-chain.ts` does not export. Copying that file would break the build.

Gemini

- Secondary repo only. Do not point the website at the AI Studio Firebase project.
- Spark only. Rules stay default-deny. No Blaze, no Storage bucket "while you are there".
- Google Cloud credits are not a reason to attach billing to `pleading-sanity-36bfa`.

## 7. Status of this brief

| Item | Status |
|---|---|
| This document | Written 12 October 2026. Drafts inside it are drafts. |
| Live Arron chain | Already on `main`. Not replaced. |
| GPT 429, Grok 403, Claude answering | Last verified 11 October. Not re-tested tonight. |
| Grant applications | Not submitted. |
| New spend | £0. |
