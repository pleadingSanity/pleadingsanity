# Insane Solar — self-service launch and AI office acceptance contract

**Owner:** Shane Cooper · **Customer email:** pleadingsanity1@gmail.com
**Status:** launch specification; not a live service, not regulatory certification.
**Integration:** Dola's pending `insane-solar.html` and `ai-social.html`. Do not recreate or overwrite those files. Keep existing `solar.html` (EnergyWin referral) unchanged until Shane explicitly approves any replacement.

## Customer journey — no telephone required
1. Visitor chooses **Get a quote online**, **Ask Solar AI**, or **Email Shane**. Telephone is optional, never required.
2. Online form asks for postcode (not full address initially), property type, roof type, approximate bill/usage, solar/battery interest, roof photo optional, preferred contact method (email default), consent to be contacted and privacy notice.
3. Show a clear summary, what is indicative versus surveyed, and an explicit **Submit enquiry** action. Do not pretend a WhatsApp link or `mailto:` alone guarantees delivery.
4. Submission reaches a **server-side Netlify Function**; validate and rate-limit, minimize PII, send notification to **pleadingsanity1@gmail.com** through an approved email provider, and show confirmation only after the provider acknowledges acceptance. No secret in HTML.
5. Auto-reply includes enquiry reference, summary, next steps, realistic response window, and no invented pricing, certifications, savings or appointment.
6. Human reviews scope and decides whether to request survey, issue a proposal or decline. Optional phone consultation only if customer requests it.
7. Quote and materials are estimates until roof, electrical, DNO and structural checks. Customer acceptance is explicit and recorded.
8. Qualified professionals perform design, electrical work, testing, certification and regulatory notifications. AI may prepare drafts and track evidence, **never issue or impersonate certificates**.

## Data and safety
- No public database containing customer contact details or roof images.
- Uploads must be consented, access-controlled, size/type-limited, and stripped of unnecessary metadata.
- Do not send customer contact details to third-party AI models without an appropriate privacy notice and lawful basis.
- Avoid unnecessary health data: this is a solar enquiry, not a mental-health assessment.
- Existing Netlify Identity, database, journal, Arron, games and PWA must remain unchanged.
- Human approval for outbound messages and financial commitments until automation is proven.
- No automatic promises of grants, SEG rates, tax eligibility, payback, MCS membership or warranties.

## Honest compliance handover
- Installer/surveyor: site survey, shading, roof condition, structural suitability, scaffold/access, materials and design.
- Competent electrician: electrical design, commissioning, testing, Electrical Installation Certificate and applicable Part P compliance route.
- DNO: G98/G99 notification/application and acknowledgement as applicable; export limitation where relevant.
- MCS-certified contractor (only if actually certified): applicable MCS installation documentation and certificate through authorised scheme processes.
- Product manufacturers: warranties and manuals; contractor provides workmanship terms.
- Customer: system diagram, shutdown/emergency instructions, monitoring setup, warranties, grid/export documentation and aftercare contact.
- AI office: checklist, reminders, draft documents, status tracking and secure customer portal; cannot certify.

## Editorial rules
- Brand: **Insane Solar**. Relationship to Pleading Sanity must be described accurately, without claiming a registered subsidiary or MCS membership without evidence.
- Headline: **Real installers. Real roofs. Straight answers.**
- Subheading: **Explore solar and battery options, send your details online, and get a human-reviewed quote. No sales call required.**
- CTA: **Get my quote online**. Secondary: **Email Shane** (mailto:pleadingsanity1@gmail.com).
- Real-job photos: publish only with permission to use, remove identifying house numbers/people/number plates where needed, use verifiable descriptions, and serve permanent local assets rather than temporary URLs.
- Do not claim comparison superiority over named competitors without substantiated evidence.
- Avoid promises that AI is a company owner or can issue official documents.

## Launch test gates
1. Confirm Dola files actually exist in repository and pass HTML validation.
2. Check all eight image files exist and load; no temporary URLs or fabricated captions.
3. Test 320px mobile, keyboard navigation, alt text, contrast and reduced motion.
4. Form rejects missing consent, invalid emails, oversized attachments and spam.
5. Email-only enquiry works without phone or WhatsApp.
6. Submit receives a real server acknowledgement and an email notification at pleadingsanity1@gmail.com.
7. Retry/failure paths never display false success; no duplicate leads.
8. Customer receives reference and can request deletion or correction.
9. Confirm privacy notice, data retention and access restrictions.
10. Check all quote estimates clearly labelled and no outdated tariffs.
11. Validate links to UK regulatory guidance and supplier sites.
12. Human review required before customer receives a binding quote.
13. Confirm no private keys in source, logs, browser or public API.
14. Confirm existing Pleading Sanity pages, sign-in, journal, Arron and PWA still work.
15. Run existing repo audit and Netlify deploy preview; owner signs off before main merge.

## Draft messages
**Enquiry received:** Thanks for contacting Insane Solar. We've received your enquiry [REFERENCE]. We'll review your property and requirements before discussing any firm price. You can reply to this email; a phone call isn't required.

**Request for survey:** To prepare an accurate proposal, we need to confirm your roof, electrical setup and access. Would you prefer to arrange this by email? We'll explain any visit and costs before booking.

**Aftercare:** Your installer will provide the verified commissioning documents, manuals and warranties relevant to your system. If something doesn't look right, contact us by email with your installation reference and a description of the issue. For electrical hazards, do not attempt repairs yourself.

## Blocking items
- Dola's two finished HTML files and the eight original job photos are not in the checked GitHub root.
- No verified production email-delivery service or tested lead endpoint.
- No confirmed trading entity, insurance, qualified electrical contractor or MCS accreditation.
- No verified live tariff catalogue or customer quote engine.
- **Do not claim the site is live or accepting enquiries until these gates pass.**
