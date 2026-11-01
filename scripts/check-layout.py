#!/usr/bin/env python3
"""Layout check: every sitemap page at 360/390/768px must have no horizontal
overflow, a one-row header on phones, and no console errors / uncaught exceptions from same-origin code.
Usage: python3 scripts/check-layout.py [base_url]  (default http://127.0.0.1:4173)
Needs: pip install playwright && playwright install chromium (or CHROME_PATH)."""
import os, re, sys
from playwright.sync_api import sync_playwright
BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4173').rstrip('/')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
locs = re.findall(r'<loc>([^<]+)</loc>', open(os.path.join(ROOT, 'sitemap.xml')).read())
paths = sorted({re.sub(r'^https?://[^/]+', '', u) or '/' for u in locs})
WIDTHS = [360, 390, 768]
# Third-party / offline-environment noise that is not a site bug.
IGNORE = re.compile(r'(googletagmanager|google-analytics|youtube|tiktok|instagram|firebase|gstatic|identity|\.netlify/|net::ERR_|Failed to load resource|favicon)', re.I)
fails = []
with sync_playwright() as p:
    kw = {'executable_path': os.environ['CHROME_PATH']} if os.environ.get('CHROME_PATH') else {}
    b = p.chromium.launch(**kw)
    for w in WIDTHS:
        ctx = b.new_context(viewport={'width': w, 'height': 800}, is_mobile=w < 700, has_touch=w < 700)
        for path in paths:
            pg = ctx.new_page(); errs = []
            pg.on('console', lambda m: m.type == 'error' and not IGNORE.search(m.text + ' ' + (m.location or {}).get('url', '')) and errs.append('console: ' + m.text[:160]))
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:160]))
            try:
                pg.goto(BASE + path, wait_until='load', timeout=30000); pg.wait_for_timeout(700)
                sw = pg.evaluate('Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0)')
                # scrollWidth can be clipped by overflow-x:clip, so also check whether the page can actually pan sideways
                pg.evaluate('window.scrollTo(9999, 0)'); sx = pg.evaluate('window.scrollX')
                if w <= 420:
                    hh = pg.evaluate("(() => { const n = document.querySelector('.ps-nav .ps-nav-inner'); return n ? n.getBoundingClientRect().height : 0 })()")
                    if hh > 72: errs.append(f'header wraps: .ps-nav-inner {hh:.0f}px tall (one row is <= 72px)')
                if sw > w + 1 or sx > 0: errs.append(f'overflow: scrollWidth {sw} scrollX {sx} > {w}')
            except Exception as e:
                errs.append('load: ' + str(e)[:160])
            for e in errs: fails.append(f'{w}px {path} {e}')
            pg.close()
        ctx.close()
    b.close()
print(f'{len(paths)} pages x {len(WIDTHS)} widths checked')
for f in fails: print('FAIL', f)
sys.exit(1 if fails else 0)
