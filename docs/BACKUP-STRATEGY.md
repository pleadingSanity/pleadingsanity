# Backup and rollback strategy

This guide describes recovery options for the existing Netlify site. A rollback restores a deployment; it does not replace a separate backup of the repository or private data.

## Netlify deployment rollback

1. In the Netlify dashboard, open the `pleadingsanity` site's **Deploys** list.
2. Find the last known good production deploy, check its commit and deploy details, then use **Publish deploy** to make that deploy live again.
3. Record the deploy ID here after a human has verified which deploy is safe to restore:

   `[SHANE: fill in last known good deploy ID]`

The Netlify CLI also documents rollback by deploy ID:

```sh
netlify rollback --deploy-id <ID>
```

This requires authenticated human access to the correct Netlify site and the necessary permissions. This command has **not been run** as part of preparing this guide. Confirm the selected deploy before restoring it, then smoke-test the live site.

## GitHub backup and history

Keep the canonical GitHub repository and its commit history intact. Use normal commits and reviewable changes; do not rewrite history or force-push. Git history helps recover source files and identify the commit used for a deployment, but a repository alone is not an independent backup. Keep a separate, access-controlled copy of important source/assets where appropriate, and never put secrets or private user data in that copy or in Git.

## Service-worker offline support

`sw.js` uses network-first handling for page navigation and scripts/styles/JSON, with cached responses or an offline page as fallbacks when the network request fails. This can keep previously cached public content available offline. It does not roll back Netlify, guarantee that every page or asset has been cached, or restore a known-good deployment while the site is online. A stale cached page may also use resources that have since changed.

## Smoke-test concept

After publishing or rolling back, check that the home page loads, a representative static asset resolves, and a public game page opens and responds. Check the browser console and network panel for page errors or failed required resources. Repeat the check in a private browser session or after clearing site data to distinguish the live deploy from previously cached content.

`package.json` currently defines `build`, `optimize`, and `dev` scripts; it does **not** define `test:smoke`. The existing build command is a static-site informational echo, not a build or smoke test. Treat the checks above as a manual smoke-test concept, not as an automated command.

## Future: account linking — NOT ACTIVE

This is a planning sketch only; account linking is not active. Use placeholders until an authenticated, reviewed implementation is approved:

- Primary email: `[primary@example.com]`
- Linked email: `[secondary1@example.com]`
- Firestore account record shape: `primaryUid`, `primaryEmail`, and `linkedEmails` (an array of verified linked email addresses).

After authenticating and reauthenticating the signed-in user as required, a future Firebase Auth flow could link a credential to that same user:

```js
const linkedUser = await linkWithCredential(currentUser, credential);
// Only after successful verification, update the account record:
// { primaryUid: linkedUser.user.uid, primaryEmail, linkedEmails }
```

Do not enable this sketch as-is. A future implementation must handle consent, reauthentication, already-in-use credentials, verified emails, Firestore ownership rules, and recovery safely.
