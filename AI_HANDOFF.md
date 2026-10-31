# PLEADING SANITY — AI HANDOFF (single source of truth)
# Every AI reads this FIRST. Last updated: 31 Oct 2026 by Dola.

## SITE
- Live: https://pleadingsanity.co.uk
- Repo: https://github.com/pleadingSanity/pleadingsanity (branch: main)
- Host: Netlify (git auto-deploy on push to main). Build guard: scripts/validate-build.cjs runs first.

## LIVE PAGES (all 200)
- / (index) — sanctuary, hero image: images/sanctuary-aurora-cabin.jpg
- /insane-solar.html — solar sales. PayPal £50 refundable deposit (client-side + verify-paypal.mts server-side). Quote form → WhatsApp + Netlify Forms capture (name=solar-enquiry). 8 real roof photos: images/solar01-08.jpg. Energy loop diagram: images/solar-energy-loop.jpg.
- /solar-ai-office.html — AI office helper/guider. Hero: images/crying-brain-cosmic.jpg.
- /ai-social.html — AI social network (6 personas, simulated counts labelled "locally simulated demo"). Hero: images/ai-social-hero.jpg.
- Arron AI: /api/arron/health → ok:true. 28 functions. arron-knowledge.json valid (45KB) — NEVER replace with placeholder.
- Shop, journal, games, creator, sanctuary — all live.

## CONTACT (CONFIG in insane-solar.html + ai-social.html + solar-ai-office.html)
- Phone: 07711147663 | WhatsApp: 447711147663 | Email: pleadingsanity1@gmail.com

## COMPLIANCE (UK — do not change)
- AI never certifies. MCS/NAPIT humans sign. "subject to eligibility" on VAT/SEG. 0% VAT to 31 Mar 2027 then 5%. EPC NOT required for SEG. HIES "where membership applies". Crisis numbers always visible: Samaritans 116 123, Shout 85258, NHS 111, 999. No invented reviews/savings/accreditations.

## PAYPAL
- Client ID wired in insane-solar.html. Server verify: netlify/functions/verify-paypal.mts (needs env vars PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET in Netlify → Site settings → Environment variables). Without them, deposits work but aren't server-verified.

## PRs
- #137 draft (CI guard) — merge when green. #92 — DO NOT TOUCH. #136 closed. Others: triage individually, no mass merge.

## IMAGES (Grok-generated, brand-locked: deep navy/black, teal #00fff0, amber #f59e0b, silver, no text, no purple-heavy)
- images/ai-social-hero.jpg, images/solar-energy-loop.jpg, images/crying-brain-cosmic.jpg, images/sanctuary-aurora-cabin.jpg, images/arron-ai-avatar.jpg, images/ollie-the-owl.jpg, images/zara-the-squirrel.jpg, images/cosmic-cards-games.jpg. Solar gallery = Shane's real photos only.

## LANES (stay in yours)
- GROK: images, social posts, recruitment, outreach, compliance watch, SEO. Permanent skill: ps-ecosystem-powerup.
- GPT: accuracy, audit, verification, tests, exact commits.
- GEMINI: mobile UX, accessibility, human-tone polish, image prompts.
- COPILOT: code edits in repo.
- DOLA: design, structure, deploys (Netlify), final verification.
- SHANE: final approval only. Does NOT click UIs — AIs do it via API.

## RULES (Evolution Not Erasure)
- Never delete working pages/features. Never replace arron-knowledge.json with placeholder. No private data in repo. No paid inference without Shane. No static-only ZIP deploys (must include functions). Report exact commits + test results — no "looks good".

## REMAINING (for any AI to pick up)
1. Shane adds PAYPAL_CLIENT_SECRET env var in Netlify.
2. Shane adds Netlify Form email notification → pleadingsanity1@gmail.com (UI or API).
3. Copilot: cross-navigation links, mobile 390px fixes, image compression/webp, WCAG AA.
4. Grok: daily posts + more images (games covers, clothing mockups, Arron).
5. Test one real enquiry → confirm email delivery.
