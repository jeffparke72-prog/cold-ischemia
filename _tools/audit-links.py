#!/usr/bin/env python3
"""Checks every internal link/asset/anchor in the site's HTML. Run: python3 _tools/audit-links.py"""
import glob, os, re, sys, collections
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.links = []; s.ids = set()
    def handle_starttag(s, tag, attrs):
        a = dict(attrs)
        if a.get('id'): s.ids.add(a['id'])
        if tag == 'a' and a.get('name'): s.ids.add(a['name'])
        for k in ('href', 'src', 'action', 'data-src', 'poster'):
            if a.get(k) is not None and tag in ('a', 'link', 'script', 'img', 'iframe', 'source', 'video', 'audio', 'form', 'embed', 'object'):
                s.links.append((tag, k, a[k], s.getpos()[0]))

pages = {}
for f in sorted(glob.glob('*.html')):
    p = P(); p.feed(open(f, encoding='utf-8', errors='ignore').read()); pages[f] = p

broken = []; ext = collections.Counter(); weak = []
for f, p in pages.items():
    for tag, k, v, line in p.links:
        v = v.strip()
        if v in ('', '#') or v.lower().startswith('javascript:'):
            if tag == 'a': weak.append((f, line, v or '(empty)'))
            continue
        if re.match(r'^(mailto:|tel:|sms:|data:|blob:)', v, re.I): continue
        if re.match(r'^(https?:)?//', v, re.I):
            host = urlsplit(v if not v.startswith('//') else 'https:' + v).netloc.lower()
            ext[host] += 1
            if host in ('localhost', '127.0.0.1') or host.startswith('localhost:'): broken.append((f, line, v, 'points at localhost'))
            if re.search(r'(^|\.)coldischemia\.foundation$', host): # own domain -> check path exists
                path = unquote(urlsplit(v if not v.startswith('//') else 'https:' + v).path.lstrip('/')) or 'index.html'
                if not os.path.exists(path) and not os.path.isdir(path): broken.append((f, line, v, 'own-domain path missing'))
            continue
        u = urlsplit(v); path = unquote(u.path)
        target = f if path == '' else ('index.html' if path.strip('/') == '' else path.lstrip('/') if path.startswith('/') else os.path.normpath(os.path.join(os.path.dirname(f), path)))
        if target.endswith('/'): target += 'index.html'
        if not os.path.exists(target):
            broken.append((f, line, v, 'file missing')); continue
        if u.fragment and target.endswith('.html'):
            ids = pages[target].ids if target in pages else set()
            if u.fragment not in ids and u.fragment != 'top': broken.append((f, line, v, 'anchor #%s missing' % u.fragment))

print('pages scanned: %d' % len(pages))
print('BROKEN (%d):' % len(broken))
for b in broken: print('  %-34s line %-5s %-60s %s' % b)
print('PLACEHOLDER/EMPTY anchors (%d):' % len(weak))
for w in weak[:40]: print('  %-34s line %-5s %s' % w)
print('EXTERNAL hosts:', ', '.join('%s×%d' % kv for kv in ext.most_common(25)))
sys.exit(1 if broken else 0)
