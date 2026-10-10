# My Digital Story — Social Import and AI Biography

**Status:** Product specification; not yet implemented. Preserve existing `profile.html`, `journal-vault.html`, `feed.html`, `creator.html`, `js/social.js`, `js/video-feed.js` and existing Firebase/Netlify services.

## Member experience
1. Member signs in and opens **My Digital Story** from their profile.
2. Connect supported accounts using official OAuth/API scopes, or upload their own platform exports. Offer link-only profiles for platforms with restricted import APIs.
3. Preview available posts, captions, images and videos, with source/date, rights and visibility. Never promise full lifetime history when API limits prevent it.
4. Member selects individual items, ranges or collections for import and separately selects private journal, private archive, friends or public feed visibility.
5. Store a read-only original with provenance, timestamps and source metadata. Preserve originals and provide clear deletion/export controls.
6. Offer opt-in AI-generated bios in **factual**, **reflective**, **motivational**, **creative** and **spiritual** styles. Mark imaginative interpretations; do not diagnose, infer sensitive traits or present spirituality as fact.
7. Let the member compare original and edited text or video, accept/reject changes and undo. No automatic rewriting or publishing.
8. Provide optional highlights, creator portfolio, video feed and journal entries linked back to approved sources.
9. Provide disconnect, revocation, account deletion and retention controls. Disconnection does not silently delete already imported items; explain and offer removal.

## Privacy and safety
- Default every import and AI summary to **private**. Separate import permission from public publishing permission.
- Obtain consent for processing, including sending selected content to any third-party AI provider; offer local/no-AI mode where practical.
- Minimise OAuth scopes and retention. Encrypt tokens at rest in server-side secret storage, never in browser localStorage or public Firestore documents.
- Respect platform terms, API rate limits, copyright, third-party privacy and data portability rights. Do not scrape private accounts or bypass access controls.
- Content involving children, health, relationships or other sensitive material requires heightened safeguards. Never automatically infer mental health or religious beliefs.
- Support moderation, abuse reporting and safe treatment of other people's faces, comments and messages.
- Provide a clear UK GDPR privacy notice, purpose, retention, lawful basis and user rights workflow before collecting social exports.
- Enforce per-user storage, compute and API quotas to prevent surprise bills.

## Suggested implementation slices
A. Profile links and a private manual upload/import preview, with clear source labels.
B. Member-approved import into journal and feed, preserving original files.
C. Optional AI bio generation from selected material with factual grounding, preview and edits.
D. Provider-specific OAuth connectors, one at a time, only after terms and permissions review.
E. Optional video processing and clips, behind usage limits and explicit opt-in.

## Acceptance criteria
- An unauthenticated user cannot import or view private data.
- User A cannot access User B's imports or AI summaries.
- Nothing becomes public without explicit per-item or collection approval.
- Originals are never overwritten by AI output.
- Provider outage does not hide or corrupt existing imports.
- Export and delete controls work and are tested.
- Browser tests cover mobile, upload errors, revoked access, duplicate import and accessible UI.
- Operating costs and provider limitations are disclosed before rollout.

## Existing codebase coordination
- Read open PRs #44, #46, #48, #57, #60 and #61; avoid overlapping modifications.
- Keep Firebase + Netlify as the existing production architecture unless the owner approves a change.
- Do not claim integrations, a full-history import or AI review is live until end-to-end tested.
