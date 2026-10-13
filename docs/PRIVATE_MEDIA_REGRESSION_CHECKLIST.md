# Private media security — PR #86 test plan

NOT TESTED in staging. Do not merge yet.

| Viewer | Source | Expected |
|---|---|---|
| Guest | Live unhidden public post | 200 |
| Guest | Members/friends/private/hidden/pending/unlinked | 404 |
| Guest | Banner | 401 |
| Owner | Own uploaded media and banner | 200 |
| Signed-in unrelated member | Live public or members post | 200 |
| Signed-in unrelated member | Friends/private post | 404 |
| Accepted friend | Live friends post | 200 |
| Blocked user | Other person's post | 404 |
| Non-owner | Banner | 404 |

## Before merge
1. Deploy PR preview with disposable test identities and media.
2. Test every row using actual browser sessions and direct HTTP requests.
3. Verify changing a public post to private immediately revokes access, including browser caches.
4. Test images, video, upload, profile banners, deleted posts and unlinked blobs.
5. Check whether all media references use posts.imageKey; verify multi-image attachments.
6. Run TypeScript/Netlify function build, logs and mobile/browser smoke tests.
7. Review whether profile banners should be public under a separate privacy policy.
8. Approve, merge, verify Netlify production and independent backup; record rollback.

No test passes or deployment claimed. Rollback: revert the PR's changes to netlify/functions/images.mts. No migration or deletion.
