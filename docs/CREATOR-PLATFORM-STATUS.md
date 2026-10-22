# Creator Stage & Social Platform — verified status

Last reviewed: 8 October 2026 — Phase C creator/community polish update  
Canonical site: https://pleadingsanity.co.uk  
Canonical repository: https://github.com/pleadingSanity/pleadingsanity  
Production branch: `main`

## Available foundations

- Netlify Identity email/password sign-up and sign-in.
- One-time email sign-in/recovery links.
- OAuth buttons are rendered only for social providers enabled in Netlify Identity settings. The UI supports Google, GitHub, GitLab, Bitbucket and Facebook provider identifiers; each provider still needs to be enabled and configured in the production Identity settings.
- Member profiles, profile visibility controls, public/member/friends/private post audiences, feed posts, friend requests, blocks, reports and moderation are implemented in the current codebase.
- The new `/live.html` page can preview public YouTube Live and Twitch channel URLs, and lets a signed-in, onboarded member share a stream link into the community feed. YouTube links use the existing video-post route; other stream links are shared as text posts with the URL included.
- The LIVE page now has Live Now / Scheduled / Past Lives tabs, local scheduling and replay-link controls, creator-side stream state/privacy/chat controls, a local chat foundation, and explicit native-broadcast "Coming Soon" messaging.
- A dedicated `/creator.html` dashboard now exposes stream status, clip status, earnings/90% offer status and a manual creator application route. The dashboard deliberately distinguishes UI foundations from live monetisation infrastructure.
- Scheduled lives, replay links, creator controls and browser chat are currently device-local foundations. They are not cross-device or real-time production services until the server-side live/community layer is connected.
- Public creator profiles now expose local **Follow** and **Notify me** preferences. These persist on the member's device; real-time cross-device delivery remains 🔜 COMING SOON until a notification service is connected.
- Community discovery now includes quick Live Now / Upcoming / Creators controls and a local notification centre. Live status shortcuts intentionally route to the dedicated LIVE hub until live presence is server-backed.
- Phase C creative direction is documented in `docs/PHASE-C-CREATIVE-PACK.md` with 12 image prompts and captions.

## Not yet verified as production capabilities

These must not be described as active until implemented and tested end-to-end:

1. Native camera/microphone broadcasting directly from Pleading Sanity.
2. One-button multistreaming to Pleading Sanity and other platforms simultaneously. External creators can start a stream on a supported provider and paste its public URL into the LIVE page, but this is not an ingest/relay service.
3. Automatic replay ingestion, AI highlight selection, caption generation, vertical reframing, rendering and download of polished 60-second clips.
4. Creator earnings ledger, traffic/revenue attribution, payout onboarding, fraud/chargeback handling, tax/payment eligibility and actual payouts.

## Founding Creator Bonus — offer activation requirements

The LIVE page presents the proposed 90% qualifying-income share for the first 1,000 eligible creators. Before treating this as an active, enforceable payout programme, publish the complete terms and implement:
- what counts as qualifying gross/net income and how traffic/content attribution works;
- fees, refunds, chargebacks, invalid traffic and fraud adjustments;
- enrolment timestamp and verified first-1,000 eligibility;
- creator identity/payment verification, minimum payout threshold, schedule and supported countries;
- tax responsibilities, disputes, privacy and account suspension/appeal handling;
- a creator dashboard showing attributable earnings, adjustments and payout status.

No income generated means no payout. No earnings should be promised or displayed before they are earned and verified.

## Required build path

1. Configure and test each desired OAuth provider in Netlify Identity; email password and one-time email links remain the fallback.
2. Select a compliant live-video provider that supports browser/RTMP ingest and permitted restreaming; configure server-side secrets, stream-key security, abuse reporting, moderation, recording and costs.
3. Build and test replay storage + transcription/highlight detection + 60-second vertical render/export pipeline. Keep creator consent and delete controls.
4. Implement revenue ledger and payout provider, legal terms, tax/payment checks, fraud controls and support process.
5. Run authenticated end-to-end tests on Android/mobile and desktop, including privacy audiences, blocked users, moderation/review mode, stream embeds, broken provider links, replay processing failures and payout accounting.

This status document distinguishes current working foundations from features that still need provider configuration or implementation. A visible button or roadmap entry is not proof of a working production service.


## 2026-10-21 — free-core funding and app-discovery polish, review branch
- Founder requested income without charging ordinary sanctuary users, including clothing, voluntary support, audience revenue and optional personal thank-yous.
- Existing shop and partnership form retained. Added an optional funding explanation, private-contact route and clear distinction between gross sales and net proceeds after costs. No donation destination was found or invented; a verified payment link is required before a donation checkout can be enabled. Existing external shop checkout and product availability were not verified.
- No live creator earnings ledger, ad-network approval, sponsorship contract, income guarantee or donation receipt is claimed. The core remains free, with no ad tracker added. Audience/view counts alone do not create earnings.
- A personal thank-you can be arranged privately through the founder's existing email. No personal WhatsApp number is exposed and no supporter list is published without consent.
- No donor-only prize draw is opened. Donations do not purchase entries or better odds. Prize rules, eligibility, funding and legal review are separate requirements. Source checked: Gambling Commission free-draw guidance, https://www.gamblingcommission.gov.uk/public-and-players/guide/page/free-draws-and-prize-competitions/ . No charity/Gift Aid status is asserted; see https://www.gov.uk/donating-to-charity/gift-aid .
- Homepage points directly to the existing App Hub/install page; catalogue uses the optimized local game art and a logo fallback. This remains an installable web app, not a claimed Apple/Google store listing.
- Connected AI social expansion is requested but API work is waiting for the explicit credential reuse/new choice required by the OpenAI API Key skill. No extra provider calls, public AI posts, schedules, spending limits or payment settings changed in this funding polish.
