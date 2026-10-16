#!/usr/bin/env python3
"""CIF weekly site audit: broken internal links, missing anchors, duplicate content.

Usage: python3 _tools/site_audit.py [--root .] [--out _audit/report.md]
Exit code 0 always; findings are in the report.
"""
import argparse, hashlib, os, re, sys, json
from collections import defaultdict
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

SKIP_DIRS = {'.git', 'node_modules', '_audit', '.claude', '.github'}
DUP_MIN_CHARS = 160  # paragraphs shorter than this are not flagged as duplicates


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.blocks = [], [], []
        self._buf, self._in_text, self._skip = [], 0, 0
        self.title = ''
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style'):
            self._skip += 1
        if tag == 'title':
            self._in_title = True
        for k in ('href', 'src'):
            if a.get(k):
                self.links.append((tag, a[k], self.getpos()[0]))
        if a.get('id'):
            self.ids.append(a['id'])
        if a.get('name') and tag == 'a':
            self.ids.append(a['name'])
        if tag in ('p', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote'):
            self._flush(); self._in_text += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self._skip = max(0, self._skip - 1)
        if tag == 'title':
            self._in_title = False
        if tag in ('p', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote'):
            self._flush(); self._in_text = max(0, self._in_text - 1)

    def handle_data(self, d):
        if self._in_title:
            self.title += d
        if self._in_text and not self._skip:
            self._buf.append(d)

    def _flush(self):
        t = re.sub(r'\s+', ' ', ''.join(self._buf)).strip()
        if t:
            self.blocks.append(t)
        self._buf = []


def html_files(root, drafts=False):
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS and (drafts or not x.startswith('_'))]
        for f in files:
            if f.lower().endswith(('.html', '.htm')):
                yield os.path.relpath(os.path.join(d, f), root)


def resolve(root, page, url):
    u = urlparse(url)
    path = unquote(u.path)
    if path.startswith('/'):
        target = path.lstrip('/')
    elif path == '':
        target = page
    else:
        target = os.path.normpath(os.path.join(os.path.dirname(page), path))
    full = os.path.join(root, target)
    if os.path.isdir(full):
        target = os.path.join(target, 'index.html')
        full = os.path.join(root, target)
    return target, full, u.fragment


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.')
    ap.add_argument('--out', default='_audit/report.md')
    ap.add_argument('--include-drafts', action='store_true', help='also scan _book, _paper* and other underscore draft folders')
    args = ap.parse_args()
    root = args.root

    pages = {}
    for p in sorted(html_files(root, args.include_drafts)):
        try:
            parser = Page()
            parser.feed(open(os.path.join(root, p), encoding='utf-8', errors='replace').read())
            parser._flush()
            pages[p] = parser
        except Exception as e:
            print(f'parse error {p}: {e}', file=sys.stderr)

    raw = {p: open(os.path.join(root, p), encoding='utf-8', errors='replace').read() for p in pages}
    broken, anchors, dup_ids, external = [], [], [], set()
    dead_buttons = []
    BUILTIN = {'alert', 'confirm', 'prompt', 'window', 'this', 'event', 'history', 'location', 'document',
               'print', 'setTimeout', 'if', 'for', 'while', 'switch', 'return', 'void', 'typeof', 'scrollTo', 'open', 'close', 'navigator', 'console', 'Object', 'JSON'}
    for p, s in raw.items():
        code = s
        for src in re.findall(r'<script[^>]+src="([^"]+)"', s):
            f = os.path.normpath(os.path.join(root, os.path.dirname(p), src))
            if os.path.exists(f):
                code += open(f, encoding='utf-8', errors='replace').read()
        for fn in set(re.findall(r'on(?:click|change|input|submit|keyup|keydown)="\s*(?:return\s+)?([A-Za-z_$][\w$]*)\s*\(', s)):
            if fn in BUILTIN:
                continue
            e = re.escape(fn)
            if not re.search(r'(function\s+%s\b|[\s,;{(]%s\s*=[^=]|window\.%s\s*=|\b%s\s*:)' % (e, e, e, e), code):
                dead_buttons.append((p, fn))
    for p, pg in pages.items():
        seen = defaultdict(int)
        for i in pg.ids:
            seen[i] += 1
        for i, n in seen.items():
            if n > 1:
                dup_ids.append((p, i, n))
        for tag, url, line in pg.links:
            low = url.strip().lower()
            if low.startswith(('mailto:', 'tel:', 'javascript:', 'data:', 'sms:', '{{')) or low in ('#', ''):
                continue
            if low.startswith(('http://', 'https://', '//')):
                host = urlparse(url if not low.startswith('//') else 'https:' + url).netloc.lower()
                if host.endswith('coldischemia.foundation') and host in ('coldischemia.foundation', 'www.coldischemia.foundation'):
                    path = urlparse(url).path or '/'
                    target, full, frag = resolve(root, p, path)
                    if not os.path.exists(full):
                        broken.append((p, line, url))
                else:
                    external.add(url)
                continue
            target, full, frag = resolve(root, p, url)
            if not os.path.exists(full):
                broken.append((p, line, url))
            elif frag and target in pages and frag not in pages[target].ids and tag == 'a' \
                    and ("'%s'" % frag) not in raw.get(target, '') and ('"%s"' % frag) not in raw.get(target, '').replace('id="%s"' % frag, ''):
                anchors.append((p, line, url))

    # duplicate whole files
    hashes = defaultdict(list)
    for p in pages:
        h = hashlib.sha256(open(os.path.join(root, p), 'rb').read()).hexdigest()
        hashes[h].append(p)
    dup_files = [v for v in hashes.values() if len(v) > 1]

    # duplicate titles
    titles = defaultdict(list)
    for p, pg in pages.items():
        t = pg.title.strip()
        if t:
            titles[t].append(p)
    dup_titles = {t: v for t, v in titles.items() if len(v) > 1}

    # duplicate paragraphs: within one page, and across pages
    within, across = [], defaultdict(set)
    for p, pg in pages.items():
        c = defaultdict(int)
        for b in pg.blocks:
            if len(b) >= DUP_MIN_CHARS:
                c[b] += 1
                across[b].add(p)
        for b, n in c.items():
            if n > 1:
                within.append((p, n, b))
    across = {b: sorted(v) for b, v in across.items() if len(v) > 1}

    os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
    L = []
    L.append('# CIF site audit\n')
    L.append(f'Pages scanned: {len(pages)}\n')
    L.append('| Check | Count |\n|---|---|')
    L.append(f'| Broken internal links | {len(broken)} |')
    L.append(f'| Buttons calling missing functions | {len(dead_buttons)} |')
    L.append(f'| Links to missing anchors | {len(anchors)} |')
    L.append(f'| Duplicate ids on a page | {len(dup_ids)} |')
    L.append(f'| Identical duplicate files | {len(dup_files)} |')
    L.append(f'| Pages sharing a title | {len(dup_titles)} |')
    L.append(f'| Paragraphs repeated within a page | {len(within)} |')
    L.append(f'| Paragraphs repeated across pages | {len(across)} |')
    L.append(f'| External links (not checked here) | {len(external)} |\n')

    def sec(title, rows):
        L.append(f'## {title}\n')
        L.extend(rows if rows else ['None.'])
        L.append('')

    sec('Broken internal links', [f'- `{p}` line {ln}: `{u}`' for p, ln, u in broken])
    sec('Buttons calling missing functions', [f'- `{p}`: `{fn}()` is not defined' for p, fn in dead_buttons])
    sec('Links to missing anchors', [f'- `{p}` line {ln}: `{u}`' for p, ln, u in anchors])
    sec('Duplicate ids', [f'- `{p}`: id `{i}` ×{n}' for p, i, n in dup_ids])
    sec('Identical duplicate files', ['- ' + ', '.join(f'`{x}`' for x in v) for v in dup_files])
    sec('Pages sharing a title', [f'- "{t}": ' + ', '.join(f'`{x}`' for x in v) for t, v in sorted(dup_titles.items())])
    sec('Paragraphs repeated within a page', [f'- `{p}` ×{n}: "{b[:140]}…"' for p, n, b in within])
    sec('Paragraphs repeated across pages', [f'- {len(v)} pages ({", ".join(v[:6])}{"…" if len(v) > 6 else ""}): "{b[:140]}…"' for b, v in sorted(across.items(), key=lambda kv: -len(kv[1]))[:60]])
    open(args.out, 'w').write('\n'.join(L) + '\n')
    json.dump(sorted(external), open(os.path.join(os.path.dirname(args.out) or '.', 'external-links.json'), 'w'), indent=1)
    print('\n'.join(L[:12]))


if __name__ == '__main__':
    main()
