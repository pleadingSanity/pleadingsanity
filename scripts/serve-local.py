#!/usr/bin/env python3
"""Tiny static server for local checks: serves the repo root and maps /page to /page.html like Netlify."""
import http.server, os, sys
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
    def send_head(self):
        p=self.path.split('?')[0].split('#')[0]
        if not os.path.splitext(p)[1] and p!='/' and not p.endswith('/') and os.path.exists('.'+p+'.html'):
            self.path=p+'.html'
        return super().send_head()
port=int(sys.argv[1]) if len(sys.argv)>1 else 4173
http.server.ThreadingHTTPServer(('127.0.0.1',port),H).serve_forever()
