# PLEADING SANITY — Founder continuity and disaster recovery (public-safe plan)

Status: planning document; **not proof that succession, backups, legal ownership or recovery access are configured**. This document deliberately contains no successor names, personal email addresses, secrets or private records. Follow the current `.github/AI-OPERATING-CHARTER.md` and `AGENTS.md`.

## Mission and non-negotiables
Preserve the free mental-health sanctuary, crisis support, Arron companion boundaries, privacy, original founder voice, user-owned content and the principle **Evolution, Not Erasure**. Never replace production with an untested rebuild. Do not alter protected PR #92 or read-only `staging`.

## Human succession — private legal record required
The founder has designated equal intended family successors and a temporary adult custodian if successors are not legally able to administer accounts. **Names, identities, contact details, ages, verification documents, inheritance instructions and recovery credentials belong in a separately controlled private succession record, not in this public repository.** Confirm the founder's wishes with an appropriately qualified UK solicitor, especially where beneficiaries are minors, and with the relevant service providers. Establish a named alternate custodian, scope of powers, consent, and a legally valid handover process. Do not automatically grant access based on inactivity or an unverified death report. No AI agent can override identity checks, inheritance law, account terms or provider ownership rules.

## Private asset inventory and access register
Keep a current, access-controlled inventory outside public GitHub for registrar and domain renewals, DNS, Netlify, GitHub organisation and repositories, Firebase, email, billing, payment providers, storage, licensed fonts/artwork, social accounts and any AI/API services. Record the **service name, legal owner, recovery mechanism, renewal/billing owner, backup custodian and last verification date**, not raw passwords or API keys. Use MFA/passkeys, recovery codes in an appropriate secure vault and least-privilege delegated accounts. Provider-supported succession or estate procedures must be followed.

## Preservation of code, founder prompts and original work
Maintain versioned Git history and independent, encrypted backups of the repository, issues/PRs, relevant docs, original assets, licensed artwork, AI handoffs and founder-authored prompts **where legally and technically accessible**. A Git repository does not automatically contain every past ChatGPT, Grok, Claude or Gemini conversation; export those separately through each provider's supported tools with consent. Do not ingest private conversations or third-party data into public GitHub. Preserve metadata and source attribution. Use redundant encrypted storage with access separation and periodic restore tests; define retention, deletion requests and encryption-key recovery. No service can promise indefinite retention without funding, provider availability and tested backups.

## Resilience and recovery
1. Establish baseline availability and recovery objectives (RTO/RPO), operational budget and emergency contacts.
2. Monitor DNS/registrar expiry, TLS certificates, GitHub workflows, Netlify deploy health, critical static pages, and crisis/support availability without tracking visitors.
3. Preserve a known-good production commit and deploy identifier; test rollback on a preview or safe environment before any production rollback.
4. Test restoring a repository snapshot, critical static content, and authorised user data from backups without exposing private records.
5. Document outage escalation: monitor alert → human verification → safe read-only diagnosis → tested PR or approved rollback → post-incident record.
6. Keep crisis resources accessible via a static fallback when dynamic AI services fail. Do not claim 100% uptime.
7. Never introduce new paid infrastructure, ownership transfers, DNS edits, private-data migration, or security-sensitive changes without the required explicit founder/authorised successor approval.

## AI stewardship and limits
Agents may inspect, test, draft, and make narrowly scoped changes only under the current charter's delegated permissions. Agents do not gain legal ownership, unbounded control or eternal background operation. Scheduled workflows must be explicitly installed and monitored. Preserve audit trails, approvals and rollback paths. Keep `AI_HANDOFF.md` append-only and verify live state each session.

## Visitor feedback and contributor credit
Track optional, accessible thank-you/feedback after suitable user actions, not disruptive exit popups. Anonymous by default; public contributor credit requires explicit revocable consent and moderation. Do not expose feedback containing private health information or customer contact details in public GitHub issues. See the separately tracked feedback requirements.

## Verification checklist — currently NOT PROVEN
- [ ] Solicitor-approved succession instructions and custodian permissions
- [ ] Provider-supported ownership/recovery paths tested
- [ ] Private asset register and secure vault set up
- [ ] Encrypted off-provider backups of code, assets and permitted exports
- [ ] Recovery-key escrow and successor access drill
- [ ] Domain/billing continuity and funding arranged
- [ ] Production outage alerting and tested recovery/rollback
- [ ] Prompt and conversation exports inventoried with privacy safeguards
- [ ] Responsible human available for emergency decisions

This is a non-sensitive engineering handoff, **not a will, legal transfer, guarantee of permanent service, or grant of production access**.
