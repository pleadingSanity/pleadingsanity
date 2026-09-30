# 🗄️ Archive — Evolution, Not Erasure

Code from earlier builds that no page loads any more. It is kept here, not deleted,
so ideas can be picked back up later. Nothing in this folder runs on the live site.

## legacy-js/
| File | What it was |
|---|---|
| `analytics-monitoring.js` | Early analytics/monitoring layer (not used — the site is privacy-first, no tracking) |
| `content-media-system.js` | Media library experiments, superseded by `cosmic-scroll.js` and `video-feed.js` |
| `maintenance-system.js` | Self-healing checks, superseded by the service worker and Netlify |
| `partnership-api-system.js` | Partner API router, superseded by Netlify AI Gateway in `netlify/functions/arron.mts` |
| `performance-optimizer.js` | Client-side perf tweaks, now handled by lazy loading and caching headers |
| `research-analytics-framework.js` | Research data framework concept |
| `sanctuary-bridge.js` | Cross-site bridge concept |
| `script.js` | Original frontend-repo script, merged into `site.js` |
| `security-hardening.js` | Client-side hardening, now handled by `netlify.toml` security headers |

To bring one back: move it into `/js`, add a `<script>` tag to the page, and add it to `sw.js` precache.
