#!/usr/bin/env python3
"""Idempotently adds the shared support strip to root pages that lack visible support numbers."""
import glob, re

MARK = 'class="ps-support-strip"'
LINK = '<link rel="stylesheet" href="/css/support-strip.css">'
STRIP = (
    '<aside class="ps-support-strip" aria-label="Support">'
    '<p>Need someone right now? Emergency: <a href="tel:999">999</a> · '
    'Samaritans <a href="tel:116123">116 123</a> · '
    'Text SHOUT to <a href="sms:85258?body=SHOUT">85258</a> · '
    'NHS <a href="tel:111">111</a> (option 2 for mental health). '
    '<a href="/crisis.html">More help</a>'
    '<small>Arron is an AI companion, not a therapist.</small></p></aside>\n'
)

changed = []
for f in sorted(glob.glob("*.html")):
    s = open(f, encoding="utf-8").read()
    if MARK in s or not re.search(r"mental\s+health|\bcrisis\b|\barron\b", re.sub(r"<[^>]+>", " ", s), re.I):
        continue
    text = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>", " ", s)
    if all(re.search(p, text) for p in (r"116\s*123", r"85258", r"\b111\b", r"\b999\b")):
        continue
    if "</body>" not in s or "</head>" not in s:
        continue
    s = s.replace("</head>", LINK + "\n</head>", 1)
    i = s.rfind("</body>")
    s = s[:i] + STRIP + s[i:]
    open(f, "w", encoding="utf-8").write(s)
    changed.append(f)
print(len(changed), "pages updated")
