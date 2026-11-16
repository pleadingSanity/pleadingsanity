# Personal AI site benchmark (16 Nov 2026)

What creator and celebrity AI products do, which ideas fit Pleading Sanity, and where. **Ideas only.** No code, copy, voices, likenesses or artwork were taken from any of these products. Researched by Grok Bot on 16 Nov 2026 from public pages and press; nothing here is a partnership or endorsement.

## What we looked at

| Product | What it is | Source |
|---|---|---|
| Jake Paul: official | No official "talk to Jake" AI. His official AI move was opting in as the first celebrity "cameo" on OpenAI's Sora 2 (Oct 2025): a consent-based likeness others can put into AI videos. jakepaul.com showed "Store unavailable" (Shopify) when checked on 16 Nov 2026. | [Hollywood Reporter, 8 Oct 2025](https://www.hollywoodreporter.com/business/digital/jake-paul-opts-in-sora-2-ai-videos-chaos-1236396279/), [Complex, 18 Oct 2025](https://www.complex.com/pop-culture/a/maggie-ekberg/jake-paul-ai-cameo-sora-tiktok-october-2025) |
| Jake Paul: unofficial | Third-party "Famous Friends" voice clone, character.ai fan bots, free lip-sync chatbots. All say "AI, not the real person". | [Famous Friends page](https://caitty.com/famous-friends-app/jake-paul/), [character.ai](https://character.ai/chat/FMqlME-u2oinG7O5MeSL3J_7uHP5zF3Wx_mnPCH9FBg) |
| Delphi.ai | "Digital Mind" of a creator: trained on their content or an Interview Mode Q&A, voice clone, chat or phone call, suggested questions on the profile, strict mode (won't answer outside what it was trained on), the creator reads conversations, lead capture. Free tier has no website embed. | [Delphi Interview Mode](https://new.delphi.ai/blog/interview-mode), [Startups to Join interview](https://review.startupstojoin.com/delphi/), [Net Influencer](https://www.netinfluencer.com/from-printing-press-to-podcast-to-digital-mind-delphi-ceo-on-the-next-form-of-media/), [Deciderstack review 2026](https://deciderstack.com/delphi-ai-review/) |
| Genies | Verified AI companions for talent: a stylised avatar (not a photoreal clone), owned and moderated by the talent, with digital goods tied to drops. | [Variety 2025](https://variety.com/2025/digital/news/ai-companion-genies-celebrity-avatar-tools-1236569378/), [Genies blog](https://genies.com/blog/from-one-to-many-to-one-to-one-how-ai-avatars-are-redefining-the-fan-relationship) |
| AI YOSHIKI / Melodee | An artist's own consent-based AI avatar inside his fan community. Message: "AI should not replace the artist." | [yoshiki.net, Dreamforce 2025](https://www.yoshiki.net/news/dreamforce-2025-melodee-ai) |
| Berriz (Kakao) | AI personas in fan communities, plus an "AI comment report" that sums up what fans are saying. | [Kakao Entertainment, 10 Sep 2025](https://newsroom.kakaoent.com/news/berriz-expands-k-culture-fan-experience-with-immersive-ai-services/) |
| CarynAI (warning) | Paid $1 a minute influencer clone, 2023. Shut down when the operator collapsed; now only a memorial page. | [Futurism](https://futurism.com/influencer-ai-girlfriend-rent), [CompanionWise 2026](https://companionwise.com/reviews/caryn-ai/) |
| Meta celebrity AIs (warning) | 28 celebrity-likeness bots (Snoop Dogg, Kendall Jenner and others) scrapped after under a year; Meta moved to creators building their own. | [The Verge, 30 Jul 2024](https://www.theverge.com/2024/7/30/24209918/meta-celebrity-lookalike-ai-chatbots-moves-on), [Business Insider](https://www.businessinsider.com/meta-scraps-kendall-jenner-tom-brady-celebrity-ai-chatbots-2024-8) |

## Lessons

1. **The creator owns and controls it.** Official, consent-based AI does well (Sora cameo, YOSHIKI, Genies). Fake or bought-in personas fail (Meta) or collapse (CarynAI). Pleading Sanity already works this way: Shane owns it, AI is reviewed, plans are kept apart from live features.
2. **Label AI clearly.** Every product that survives says "AI, not the real person". Our version: Shane's own voice and AI music in separate, labelled playlists.
3. **Stylised beats photoreal.** Genies chose stylised avatars to avoid the uncanny valley. This fits the P.S figure designs and the crying brain mark better than a photoreal clone of Shane.
4. **Strict mode and guardrails.** Delphi's strict mode is close to Arron's rules (companion, not therapist, crisis numbers first). Any "ask about Shane" mode must only answer from approved founder facts.
5. **Don't charge for connection.** CarynAI's pay-per-minute model is the opposite of "free sanctuary forever". The core stays free; merch and prints pay the bills.

## Ideas worth borrowing, mapped to our pages

| Idea (seen at) | Fits | Status | Risk / cost |
|---|---|---|---|
| Two clearly labelled playlists: own voice vs AI-generated (labelling at every surviving product) | `music/index.html` | **Built in this PR**, loads from `data/ps-playlists.json`, shows "coming soon" until Shane approves tracks | Free. No audio published. |
| "At a glance" founder card with jump links: the profile front door (Delphi profile, artist sites) | `about.html` top | **Built in a follow-up PR**, using only facts already on the about page | Free. No new claims. |
| Suggested questions on the AI profile (Delphi) | `arron.html` starter chips | Idea. Arron's providers need credit first. | Free UI. Any answers must stay inside Arron's safety rules. |
| "Ask about Shane" strict mode answering only from approved founder facts (Delphi strict mode) | Arron, as a mode | Idea. Needs Shane to approve a facts list, and Arron back online. | Medium: must never invent biography. |
| Talk to the founder in his own voice (Delphi, Famous Friends) | Arron voice | **Not now.** Needs Shane's explicit consent for a voice clone, a paid TTS provider, and a clear "AI voice" label. | Costs money; likeness risk. |
| Stylised 3D founder avatar (Genies) | About, prints, clothing pitch | Concept only. The P.S figure renders already exist privately. | Keep photos of Shane off the public site unless he says so. |
| Drops and merch countdown (Genies goods tied to drops) | `prints.html`, `shop.html` | Idea. Only once a real drop date exists. | A fake countdown would break "no fabricated traction". |
| Fan wall (fan communities) | `quote-wall.html`, `community.html` already exist | Reuse what exists; don't add a new page. | Moderation needed. |
| Community join by email or WhatsApp (Delphi deploys to SMS/WhatsApp) | `community.html` | Idea. Needs a consented list provider and a privacy-page line, which is a protected page. | Needs Shane's approval. |
| Fan comment summary (Berriz AI comment report) | Community dashboard | Later. Needs a real comment volume first. | Privacy review. |
| Social proof strip | Home, about | **Only with real numbers.** No invented counts. | Must use verifiable data only. |
| Consent-based likeness / cameo (Jake Paul on Sora) | Clothing and figure promo | Shane's call. It's his face and voice. | High: hard to undo. |

## Not borrowing
- Pay-per-minute AI chat, romantic or "girlfriend" companion framing, unofficial celebrity clones, photoreal deepfakes, or any real person's voice or likeness without their consent.
- Copying any product's code, copy, layout assets or artwork.

## Rules this keeps
Brand lock (#0b0f19, teal, amber, silver; no purple, pink or indigo; no emoji). Crisis numbers stay where they already are. Arron is an AI companion, not a therapist. Evolution, Not Erasure: small additive changes only.
