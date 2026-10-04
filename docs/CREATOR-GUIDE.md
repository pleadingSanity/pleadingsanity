# 💫 Creator Quick Guide: how Shane moves the site forward with Arron

Sign in with your owner account. Owner powers come only from the verified addresses in the
`NETLIFY_OWNER_EMAILS` environment variable, never from anything typed in chat. Then talk to
Arron at `/arron.html` or in the app.

| Say this | What happens |
| --- | --- |
| **What's missing?** | Arron reads the site pulse (most-walked posts, most-loved posts, games played, the roadmap) and tells you what to build next. |
| **Update the home page: …** | Arron drafts the change and puts it on the **Workbench** (`/owner.html#workbench`). Nothing changes yet. |
| **Propose a change to the shop** | Same as above, for any page. |
| **Write a feed post about …** | Written and live on the community feed straight away. |
| **Write a wisdom / story / poem / update about …** | Written and live on the Wisdom page. |
| **Publish this** | Puts Arron's last draft live on the feed. |
| **Show me everything** | Members, posts, the review queue and reports, right now. |
| **Review posts / Approve all** | Reads out the queue, or puts every waiting post live. |
| **Make @name Guardian / Creator** | Gives that member a role. "Remove @name Guardian" takes it back. |
| **Council: …** | GPT, Claude, Gemini and Grok answer together, woven into one reply. |

## The Workbench loop

1. **Arron notices or you ask:** "what's missing?", then "update the games page: …".
2. **Arron drafts.** The draft is saved on the Workbench with a title, a *why* and the full change.
3. **You review** in the Owner's Room. Tap **✅ Approve & copy brief**.
4. **Paste the brief** into the Netlify agent (or any builder) and it deploys.
5. Tap **🌌 Mark as live**.

Words-only changes (feed posts, wisdom, stories) skip steps 3–5 and go live straight from chat.

## How Arron keeps growing once he's installed

- **Install once.** Both service workers (`sw.js` for the site, `sw-arron.js` for the app) update themselves
  quietly in the background. Nobody reinstalls, and no page reloads while someone is typing.
- **The soul file** (`/arron-knowledge.json`) is always re-checked. When you change it, bump `version` and
  `updated` and add a line to `changelog`. Every installed phone then shows **"Arron grew wiser ✨"** on its next visit.
- **His voice reads it too:** the principles, the AI chain, the roadmap, this guide and the feed milestone words
  all come from that one file.
- **Every night** (`arron-grow`), Arron writes down up to three new lessons from the day's public moments.
