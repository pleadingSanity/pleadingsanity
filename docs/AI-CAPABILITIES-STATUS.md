# AI Capabilities Status

For the Pleading Sanity AI family. Owner: Shane Cooper.

**Read this first.** Capabilities vary by integration and by session. This document describes what is *typically* possible. It is **not proof** that any particular operation has been performed, that any integration is connected, or that any check has passed. Always record fresh evidence for the work you actually do.

## What an in-repository Copilot coding agent can typically do

- Inspect files that are committed to the repository.
- Prepare small, focused changes and commit them to a branch.
- Open a pull request for the owner to review.
- Run repository-local checks (syntax checks, linters, scripts, tests) when its environment supports them and the tooling is installed.
- Read GitHub Actions run results and logs for the repository when the session provides that access.

What it can do depends on the session. If a tool is not available in a given session, treat the capability as absent.

## What still needs a human (owner access or approval)

| Area | Why a human is needed |
|---|---|
| Merge approval | The owner reviews and approves every merge. Agents do not decide this. |
| Netlify dashboard, environment variables, deploys and rollback | Needs the owner's Netlify account. Agents cannot see or set live values. |
| Live, signed-in browser tests | Needs a real browser and a real account. Agent code reading is not a substitute. |
| Firebase Console and rules deployment | Needs the owner's Firebase/Google account. Rules in the repo are not proof they are deployed. |
| Email inbox access | Agents cannot read inboxes. If an email matters, the owner pastes the relevant non-secret part. |
| Credential rotation | Only the owner can revoke and reissue keys and tokens. |
| Legal or regulatory decisions | Owner decisions, with proper advice where needed. |

## Coordination checklist for other agents

- [ ] Record exact evidence: the command run, the file and line, the output, the date.
- [ ] Never claim a test passed if it was not run. Say "not run" and why.
- [ ] Never commit or reveal secrets: keys, tokens, passwords, private emails.
- [ ] If you suspect a secret is committed, stop and report where. Do not fix it quietly. The owner rotates it.
- [ ] Preserve history. No force pushes, no rewriting commits. Evolution, not erasure.
- [ ] Keep PRs small and focused, one purpose each.
- [ ] Identify owner decisions clearly and leave them to the owner.
- [ ] Mark anything you could not verify as unverified, with the reason.

## Limits of this document

It names no accounts, keys or endpoints and claims no access to any external account. It is guidance for working together honestly, nothing more.
