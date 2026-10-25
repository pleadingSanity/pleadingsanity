"""Read-only public availability checks. No user data, credentials or model calls."""
from concurrent.futures import ThreadPoolExecutor
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, HTTPRedirectHandler, build_opener
from urllib.parse import urlsplit

ORIGIN = 'https://pleadingsanity.co.uk'
TARGETS = (('/', 'html'), ('/games.html', 'html'),
           ('/api/arron/health', 'arron'),
           ('/api/firebase-public-config', 'firebase'))


class SameOriginRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        parsed = urlsplit(newurl)
        if (parsed.scheme != 'https' or parsed.netloc != 'pleadingsanity.co.uk'
                or parsed.username or parsed.password):
            raise ValueError('Unexpected redirect')
        return super().redirect_request(request, fp, code, msg, headers, newurl)


def check_target(path, kind, opener=None):
    """Only return a fixed diagnostic; never log remote response bodies/errors."""
    if (path, kind) not in TARGETS:
        return path, False, 'unsupported target'
    try:
        client = opener or build_opener(SameOriginRedirects())
        request = Request(ORIGIN + path, headers={'User-Agent': 'PleadingSanity-PublicHealth/1.0'})
        with client.open(request, timeout=8) as response:
            if response.status != 200:
                return path, False, 'unexpected HTTP status'
            mime = response.headers.get_content_type()
            if kind == 'html':
                return path, mime == 'text/html', 'HTML response' if mime == 'text/html' else 'unexpected content type'
            if mime != 'application/json':
                return path, False, 'unexpected content type'
            body = response.read(4097)
            if len(body) > 4096:
                return path, False, 'oversized health response'
            payload = json.loads(body)
            if not isinstance(payload, dict):
                return path, False, 'unexpected health payload'
            if kind == 'arron':
                ok = payload.get('ok') is True
            else:
                # Optional Firebase being disabled is a supported healthy state.
                ok = type(payload.get('configured')) is bool
            return path, ok, 'health contract' if ok else 'unexpected health payload'
    except (HTTPError, URLError, TimeoutError, OSError, ValueError):
        return path, False, 'request or response unavailable'


def main():
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda item: check_target(*item), TARGETS))
    for path, ok, detail in results:
        print(f'{"PASS" if ok else "FAIL"} {path}: {detail}')
    print('Availability only; not model, auth, data, visual or full-game certification.')
    return 0 if all(ok for _, ok, _ in results) else 1


if __name__ == '__main__':
    sys.exit(main())
