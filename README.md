# Cosmic Showcase

Small demo: a focused, well-tested leaderboard module you can present as a showcase of automated improvements.

Files:
- `leaderboard.js` - core logic (well-documented)
- `leaderboard.test.js` - Jest tests
- `example.js` - small runner to demo output
- `package.json` - minimal devDeps + scripts

Try it locally:

```powershell
cd "c:/Users/deliv/cosmic-showcase"
npm install
npm test
node example.js
```

## ArronLink shared context bridge

ArronLink is the lightweight bridge for sharing workspace awareness between assistants. It stores context in `arronlink-context.json` (override with the `ARRONLINK_CONTEXT_PATH` env var if you need a custom location).

Key commands:
- `npm run arronlink:update` updates the file with the current repo path, branch, and HEAD commit (use `--project`/`--branch`/`--commit` flags for manual overrides).
- `npm run arronlink:read` prints the context in a human-friendly format (pass `--file` or toggle `--pretty` via the underlying script as needed).

The helper scripts live under `scripts/` so other tools, like Copilot or Arron, can read and write the same JSON payload. Each update refreshes the `updatedAt` timestamp so downstream agents can detect staleness before trusting the data.
