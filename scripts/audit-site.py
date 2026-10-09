"""Dependency-free static checks. Does not certify API or browser behaviour."""
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
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
    result = subprocess.run(['node', '--check', '--input-type=' + kind],
                            input=source, text=True, capture_output=True)
    return f'{name}\n{result.stderr}' if result.returncode else None


pages = sorted(ROOT.glob('*.html'))
for path in pages:
    page = Page(path)
    page.feed(path.read_text(encoding='utf-8'))
    for identifier, count in Counter(page.ids).items():
        if count > 1:
            errors.append(f'{path.name}: duplicate id {identifier}')

files = sorted((ROOT / 'js').rglob('*.js'))
files += sorted((ROOT / 'netlify/functions').rglob('*.js'))
files += sorted((ROOT / 'netlify/functions').rglob('*.cjs'))
files += [ROOT / 'sw.js']
for path in files:
    scripts.append((str(path.relative_to(ROOT)), path.read_text(encoding='utf-8'),
                    'commonjs' if path.suffix == '.cjs' else 'module'))
with ThreadPoolExecutor(max_workers=4) as pool:
    errors.extend(filter(None, pool.map(check_script, scripts)))

print(f'Checked {len(pages)} HTML pages, static href/src targets, duplicate IDs, '
      f'and {len(scripts)} external/inline JavaScript blocks.')
if errors:
    print('\n'.join(errors), file=sys.stderr)
    sys.exit(1)
print('Static audit passed. API integrations and visual layout require separate checks.')
