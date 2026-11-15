"""Synthetic health contracts; never contact production from these tests."""
import importlib.util
from email.message import Message
from pathlib import Path
import unittest
from urllib.error import URLError

spec = importlib.util.spec_from_file_location('public_health', Path(__file__).with_name('check-public-health.py'))
health = importlib.util.module_from_spec(spec)
spec.loader.exec_module(health)


class Response:
    def __init__(self, body=b'{}', mime='application/json', status=200):
        self.body, self.status = body, status
        self.headers = Message()
        self.headers['Content-Type'] = mime
    def read(self, size):
        return self.body[:size]
    def __enter__(self):
        return self
    def __exit__(self, *args):
        return False


class Client:
    def __init__(self, response=None, error=None):
        self.response, self.error, self.calls = response, error, []
    def open(self, request, timeout):
        self.calls.append((request.full_url, request.get_method(), timeout))
        if self.error:
            raise self.error
        return self.response


class HealthTests(unittest.TestCase):
    def test_public_page_is_get_with_bounded_timeout(self):
        client = Client(Response(mime='text/html'))
        self.assertTrue(health.check_target('/', 'html', client)[1])
        self.assertEqual(client.calls, [('https://pleadingsanity.co.uk/', 'GET', 8)])
    def test_optional_firebase_off_is_healthy(self):
        self.assertTrue(health.check_target('/api/firebase-public-config', 'firebase', Client(Response(b'{"configured":false}')))[1])
    def test_contracts_require_actual_boolean(self):
        for kind, path, body in [('arron', '/api/arron/health', b'{"ok":true}'),
                                 ('firebase', '/api/firebase-public-config', b'{"configured":true}')]:
            self.assertTrue(health.check_target(path, kind, Client(Response(body)))[1])
        for body in [b'{"ok":"true"}', b'[]', b'{"ok":false}', b'not-json', b'x'*4097]:
            self.assertFalse(health.check_target('/api/arron/health', 'arron', Client(Response(body)))[1])
    def test_failure_diagnostics_do_not_echo_remote_content(self):
        for client in [Client(error=URLError('private-fixture')), Client(Response(b'private-fixture', status=503)), Client(Response(b'private-fixture', mime='text/html'))]:
            result = health.check_target('/api/arron/health', 'arron', client)
            self.assertFalse(result[1])
            self.assertNotIn('private-fixture', str(result))
    def test_targets_and_redirects_cannot_expand_to_other_hosts(self):
        client = Client(Response())
        self.assertFalse(health.check_target('https://other.example/', 'html', client)[1])
        self.assertEqual(client.calls, [])
        for url in ['https://other.example/', 'http://pleadingsanity.co.uk/', 'https://user:pass@pleadingsanity.co.uk/']:
            with self.assertRaises(ValueError):
                health.SameOriginRedirects().redirect_request(None, None, 302, '', {}, url)


if __name__ == '__main__':
    unittest.main()
