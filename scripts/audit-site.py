"""Dependency-free static checks. Does not certify API or browser behaviour."""
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
import fnmatch
import tomllib
import xml.etree.ElementTree as ET
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
errors = []
scripts = []


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = []
        self.inline = None
        self.kind = 'commonjs'

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        for key in ('href', 'src'):
            url = urlsplit(attrs.get(key, ''))
            if url.scheme or url.netloc or not url.path:
                continue
            if url.path.startswith(('/api/', '/.netlify/', '/@')):
                continue
            target = ((ROOT if url.path.startswith('/') else self.path.parent)
                      / unquote(url.path).lstrip('/'))
            if target.suffix and not target.exists():
                errors.append(f'{self.path.name}: missing {url.path}')
        if tag == 'script' and not attrs.get('src'):
            kind = attrs.get('type', '').lower()
            if kind in ('', 'text/javascript', 'application/javascript', 'module'):
                self.inline = []
                self.kind = 'module' if kind == 'module' else 'commonjs'

    def handle_data(self, text):
        if self.inline is not None:
            self.inline.append(text)

    def handle_endtag(self, tag):
        if tag == 'script' and self.inline is not None:
            scripts.append((f'{self.path.name}: inline script', ''.join(self.inline), self.kind))
            self.inline = None


def check_script(item):
    name, source, kind = item
    if kind == 'typescript':
        # --check alone does not validate TypeScript on every Node 24 release.
        # Parse and strip explicitly, then syntax-check the resulting JS too.
        stripped = subprocess.run(
            ['node', '--input-type=module', '-e',
             "import {stripTypeScriptTypes} from 'node:module';"
             "import {readFileSync} from 'node:fs';"
             "process.stdout.write(stripTypeScriptTypes(readFileSync(0, 'utf8')));"],
            input=source, text=True, encoding='utf-8', capture_output=True)
        if stripped.returncode:
            return f'{name}\n{stripped.stderr}'
        source = stripped.stdout
        kind = 'commonjs' if name.endswith('.cts') else 'module'
    command = (['node', '--check', str(ROOT / name)] if kind == 'file'
               else ['node', '--check', '--input-type=' + kind])
    result = subprocess.run(command,
                            input=source, text=True, encoding='utf-8', capture_output=True)
    return f'{name}\n{result.stderr}' if result.returncode else None


pages = sorted(ROOT.glob('*.html'))
for path in pages:
    page = Page(path)
    page.feed(path.read_text(encoding='utf-8'))
    for identifier, count in Counter(page.ids).items():
        if count > 1:
            errors.append(f'{path.name}: duplicate id {identifier}')

# Check backend helpers and TypeScript as well as browser JavaScript. Node 24
# parses erasable TypeScript without executing imports or requiring
# API credentials. This is syntax coverage, not a type-check or integration test.
extensions = {'.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'}
files = sorted({path for folder in ('js', 'netlify', 'db')
                for path in (ROOT / folder).rglob('*')
                if path.suffix in extensions}
               | {path for path in ROOT.iterdir() if path.suffix in extensions})
for path in files:
    is_typescript = path.suffix in {'.ts', '.mts', '.cts'}
    scripts.append((str(path.relative_to(ROOT)),
                    path.read_text(encoding='utf-8') if is_typescript else None,
                    'typescript' if is_typescript else 'file'))
with ThreadPoolExecutor(max_workers=4) as pool:
    errors.extend(filter(None, pool.map(check_script, scripts)))

# ─── HOUSE GUARDS — the promises in AI_HANDOFF.md, checked on every push ───
# Added 2026-10-16 after arron.html and poker.html were committed as one line
# of shell text ("$(cat /tmp/...)") and still passed the checks above.
def text(rel):
    p = ROOT / rel
    return p.read_text(encoding='utf-8') if p.exists() else ''

def guard(ok, message):
    if not ok:
        errors.append('HOUSE GUARD: ' + message)

for path in pages:
    body = path.read_text(encoding='utf-8')
    guard(not body.lstrip().startswith('$('),
          f'{path.name} is a shell placeholder, not a page. Restore it from git history.')
    guard('<html' in body.lower() and '</html>' in body.lower(),
          f'{path.name} is not a whole HTML page (missing <html> or </html>).')

arron = text('arron.html')
for needle in ('116 123', '85258', 'not a therapist'):
    guard(needle in arron, f'arron.html lost "{needle}".')
for script in ('/js/arron-companion.js', '/js/arron-speak.js'):
    guard(f'src="{script}"' in arron, f'arron.html no longer loads {script}.')

signpost = re.search(r'const CRISIS_SIGNPOST = "([^"]*)"', text('netlify/functions/arron.mts'))
guard(bool(signpost), 'CRISIS_SIGNPOST is missing from netlify/functions/arron.mts.')
if signpost:
    for needle in ('999', '116 123', '85258', '111'):
        guard(needle in signpost.group(1), f'CRISIS_SIGNPOST lost "{needle}".')

order = '["openai", "anthropic", "gemini", "grok"]'
guard(f'const PROVIDERS: Provider[] = {order};' in text('netlify/lib/ai-chain.ts'),
      'ai-chain.ts provider order changed. It must stay GPT → Claude → Gemini → Grok.')
try:
    chain = [c['provider'] for c in json.loads(text('arron-knowledge.json'))['covenant']['chain']]
    guard(chain[:4] == ['openai', 'anthropic', 'gemini', 'grok'],
          'arron-knowledge.json covenant.chain must start GPT → Claude → Gemini → Grok.')
except (ValueError, KeyError, TypeError):
    errors.append('HOUSE GUARD: arron-knowledge.json is not valid JSON with covenant.chain.')

for name, ident, start in (('manifest.json', '/', '/'),
                           ('manifest-arron.json', '/arron-app.html', '/arron-app.html?source=pwa'),
                           ('manifest-solitaire.json', '/sanity-solitaire.html', '/sanity-solitaire.html?source=pwa')):
    try:
        m = json.loads(text(name))
        guard(m.get('id') == ident and m.get('start_url') == start,
              f'{name} install id/start_url changed. Installed phones would lose the app.')
    except ValueError:
        errors.append(f'HOUSE GUARD: {name} is not valid JSON.')

# Search metadata must remain readable without JavaScript. Respect existing private
# routes and HTTP noindex policies; this check never changes access or indexability.
class SearchHead(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = False
        self.titles = 0
        self.metas = {}
        self.canonicals = []
        self.redirect = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'head':
            self.in_head = True
        if not self.in_head:
            return
        if tag == 'title':
            self.titles += 1
        if tag == 'meta':
            key = attrs.get('name', attrs.get('property', '')).lower()
            self.metas.setdefault(key, []).append(attrs.get('content', ''))
            self.redirect |= attrs.get('http-equiv', '').lower() == 'refresh'
        if tag == 'link' and attrs.get('rel', '').lower() == 'canonical':
            self.canonicals.append(attrs.get('href', ''))

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False

headers = tomllib.loads(text('netlify.toml')).get('headers', [])
search_heads = {}
def http_noindex(path):
    return any(fnmatch.fnmatchcase(path, h.get('for', '')) and
               'noindex' in h.get('values', {}).get('X-Robots-Tag', '').lower()
               for h in headers)

for path in pages:
    head = SearchHead()
    head.feed(path.read_text(encoding='utf-8'))
    search_heads[path.name] = head
    for key in ('description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'):
        if len(head.metas.get(key, [])) > 1:
            errors.append(f'{path.name}: duplicate search/social metadata {key}')
    indexable = not (head.redirect or http_noindex('/' + path.name) or
                    any('noindex' in v.lower() for v in head.metas.get('robots', [])))
    if indexable:
        if head.titles != 1 or not any(v.strip() for v in head.metas.get('description', [])):
            errors.append(f'{path.name}: public page needs one title and a description')
        if len(head.canonicals) != 1 or not head.canonicals[0].startswith('https://pleadingsanity.co.uk/'):
            errors.append(f'{path.name}: public page needs one canonical house URL')

try:
    sitemap = ET.fromstring(text('sitemap.xml'))
    locations = [node.text or '' for node in sitemap.findall('{*}url/{*}loc')]
    if len(locations) != len(set(locations)):
        errors.append('sitemap.xml: duplicate URLs')
    for location in locations:
        url = urlsplit(location)
        name = url.path.lstrip('/') or 'index.html'
        head = search_heads.get(name)
        if url.scheme != 'https' or url.netloc != 'pleadingsanity.co.uk' or not head:
            errors.append(f'sitemap.xml: unexpected or missing page {location}')
        elif (http_noindex(url.path) or head.redirect or
              any('noindex' in v.lower() for v in head.metas.get('robots', [])) or
              head.canonicals != [location]):
            errors.append(f'sitemap.xml: noncanonical, redirected or noindexed URL {location}')
except ET.ParseError as exc:
    errors.append(f'sitemap.xml: invalid XML ({exc})')

print(f'Checked {len(pages)} HTML pages, static href/src targets, duplicate IDs, '
      f'and {len(scripts)} external/inline JavaScript and TypeScript blocks.')
if errors:
    print('\n'.join(errors), file=sys.stderr)
    sys.exit(1)
print('Static audit passed. API integrations and visual layout require separate checks.')
