# INSANE SOLAR — IMAGE, PRODUCT EVIDENCE AND TRADE HUB DESIGN CONTRACT
Updated: 2026-11-05 · Founder-approved direction · PR #224

## Why this document exists
Shane approved the second solar visual shown in chat as the preferred **premium commercial-scale direction** for the new Trade Buyers Hub. He questioned whether the first AI-generated image depicts actual UK solar products. This distinction is non-negotiable for all subsequent work.

## Visual decision (approved)
1. Place the **second visual / commercial rooftop and energy-storage visual direction** as the hero treatment for `/solar-trade.html`. The reference shown in chat was a search-result photograph; it is **not currently licensed, downloaded or committed to the repository**. Do not silently hotlink or copy it. Source a properly licensed replacement, obtain permission, or commission original artwork of the same aesthetic. The existing original inline SVG remains a safe placeholder until an approved asset exists.
2. The **first image was AI-generated**: a cinematic rooftop fitter, warehouse, battery units and sunset. Treat it as **illustrative only**, not as evidence of installed UK-approved products, compliant wiring, particular manufacturers or a genuine EnergyWin job. Generated file is chat-session-only; no repository asset has been uploaded.
3. Keep the hero aspirational; all purchasing/technical cards should show **genuine, exact manufacturer products** with attributable photographs used under appropriate rights, model numbers, dated specifications and datasheet links. Never use generic AI product renderings to imply an actual model.
4. Include genuine UK installation photographs only when permission and provenance are established; do not claim generated or stock images are Shane's, EnergyWin's or an installer partner's work.
5. Visual standard: polished, confident, dark navy/teal/solar gold, sophisticated editorial typography, generous spacing, accessible contrast, mobile-first, no distracting animation, no repeated stock filler. Add useful captions and descriptive alt text.

## UK equipment validation — before publishing product cards
- Candidate manufacturers for **research**, not automatic recommendations: GivEnergy (storage/inverters), Solis (inverters), Fox ESS (storage/inverters), JA Solar (modules). Verify the manufacturer, actual model, current UK availability, product documentation and compatibility before adding any SKU.
- Verify module Wp, dimensions, technology, efficiency, degradation, warranty and current datasheet; inverter MPPT, phase, voltage, current, export settings, grid compliance and monitoring; battery usable kWh, charge/discharge power, warranty, safety, backup requirements and firmware compatibility; mounting roof suitability, structural loads, wind zone and manufacturer-approved fixings.
- Check applicable UK requirements and relevant approvals for the exact installation, including DNO G98/G99/G100 as applicable, MCS scheme/product requirements where relevant, electrical and building regulations and installer certification. Do not label an entire brand 'UK approved' on the strength of a single model.
- Product photography must be genuine, attributed where required, and licensed or manufacturer-permitted. Provide links to official datasheets and indicate the last checked date.

## Trade procurement model
- Supplier search is a directory and research tool, not a live price feed. Never assert a particular wholesaler is cheapest without comparable, dated, account-specific quotes.
- Compare ex-VAT unit cost, freight, pallet/collection, stock, lead time, volume breaks, returns, warranty handling, credit, technical support and compatibility. Explain **why** PERC/TOPCon/HJT/back-contact, string/hybrid/microinverter, LFP storage and mounting choices differ in total installed cost.
- RFQs must be opt-in and nonbinding. No unapproved supplier API scraping or automatic purchasing. Preserve client-side privacy.
- Show how large firms could use standardised BOMs, multi-site procurement, approvals, installer handoffs, multi-user workflow and white-label offerings. Label any unbuilt features as roadmap, not live capability.
- EnergyWin inspiration can be acknowledged respectfully without implying endorsement, employment, an agreement or a current 50/50 partnership. Any actual partnership requires a written agreement. Human customer service and office roles are assets, not targets for replacement.

## Release gate
- Keep `insane-solar.html` existing homeowner flow, real job gallery, quote controls and payment integration intact.
- Run build validation, trade-hub tests, link checks, keyboard/screen-reader/mobile reviews, image rights checks and UK claim review before merging.
- Verify Netlify's published commit after merge; distinguish a green GitHub PR from a live deployed page.
- Do not replace the safe SVG hero until the intended licensed commercial photograph or approved original is actually available.
- When continuing in another AI tool, **read this file and AI_HANDOFF.md first**. Repo documentation is the persistent cross-tool handoff; chat memories are not automatically shared between Grok, Gemini and ChatGPT.

## Status
- PR #224 implements `solar-trade.html`, supplier directory, product technology guidance, RFQ and prominent link from Insane Solar.
- The approved hero-photo **direction is documented, not yet implemented as a licensed photograph**.
- Exact manufacturer product cards, image permissions, live price integrations and full browser tests are **future work**, not completed deliverables.
