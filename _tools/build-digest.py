#!/usr/bin/env python3
"""Builds research-digest.html (index), research-digest-NNN.html (each essay) from _digest/issue-NNN-essay.md.
PDFs: node _tools/digest-pdf.js  ->  research-digest-NNN.pdf.  Status per issue lives in _digest/status.json ({"001":"draft"|"published"})."""
import glob, html, json, os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(R, '_digest')
status = json.load(open(os.path.join(D, 'status.json'))) if os.path.exists(os.path.join(D, 'status.json')) else {}
e = html.escape
def inline(t):
    t = e(t); t = re.sub(r'\*(.+?)\*', r'<em>\1</em>', t); return t
FONTS = '''@font-face{font-family:'Anton';src:url(fonts/anton-400-normal.woff2) format('woff2')}
@font-face{font-family:'IBM Plex Mono';font-weight:400 500;src:url(fonts/ibmplexmono-500-normal.woff2) format('woff2')}
@font-face{font-family:'Playfair Display';font-weight:900;src:url(fonts/playfairdisplay-900-normal.woff2) format('woff2')}
@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400;src:url(fonts/playfairdisplay-400-italic.woff2) format('woff2')}
@font-face{font-family:'Crimson Pro';font-weight:400 600;src:url(fonts/crimsonpro-400-normal.woff2) format('woff2')}
@font-face{font-family:'Crimson Pro';font-style:italic;src:url(fonts/crimsonpro-400-italic.woff2) format('woff2')}'''
CSS = FONTS + '''
:root{--abyss:#030509;--surf:#0a1628;--ink:#d8cfc4;--ink80:rgba(216,207,196,.84);--ink60:rgba(216,207,196,.62);--gold:#c8902a;--gold-l:#e8b84a;--pulse:#2ac4c8;--b2:rgba(100,140,200,.26)}
*{box-sizing:border-box;margin:0;padding:0}body{background:var(--abyss);color:var(--ink);font-family:'Crimson Pro',Georgia,serif;font-size:20px;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:var(--gold-l)}.wrap{max-width:780px;margin:0 auto;padding:0 24px}
.mast{padding:90px 0 30px;border-bottom:1px solid var(--b2)}.k{font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
h1{font:900 clamp(34px,5.4vw,56px)/1.08 'Playfair Display',Georgia,serif;color:#f3ede4;margin-bottom:14px}.deck{font:italic 400 22px/1.4 'Playfair Display',serif;color:var(--ink80)}
.btns{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0 0}.btn{font:500 13px 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;padding:13px 20px;border-radius:4px;border:1px solid var(--b2);color:var(--ink)}.btn.p{background:var(--gold);border-color:var(--gold);color:#0a1628}
.draft{display:inline-block;font:500 11px 'IBM Plex Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#ff8a96;border:1px solid rgba(255,138,150,.5);padding:4px 10px;border-radius:3px;margin-bottom:16px}
article{padding:36px 0 60px}h2{font:900 30px/1.15 'Playfair Display',serif;color:#f3ede4;margin:1.8em 0 .5em}p{margin-bottom:1.05em}
.stat{margin:1.6em 0;padding:18px 22px;border-left:5px solid var(--gold);background:var(--surf);page-break-inside:avoid;break-inside:avoid}.stat b{display:block;font:400 64px/1 'Anton',sans-serif;color:var(--gold-l);letter-spacing:.02em}.stat span{font:500 13px 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--ink60)}
.src,.ver{font-size:16px;color:var(--ink80)}.src li{margin:0 0 .5em 1.2em}.ver{border:1px dashed rgba(255,138,150,.5);padding:16px 18px;border-radius:6px}.disc{font:italic 17px/1.5 'Crimson Pro',serif;color:var(--ink60);margin-top:1.4em}
footer{padding:30px 0;text-align:center;font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:var(--ink60)}
.card{display:block;text-decoration:none;color:inherit;background:var(--surf);border:1px solid var(--b2);border-left:5px solid var(--gold);border-radius:8px;padding:24px;margin:18px 0}.card h3{font:900 26px/1.2 'Playfair Display',serif;color:#f3ede4;margin:6px 0 8px}.card p{font-size:17px;color:var(--ink80);margin:0 0 12px}
@page{size:Letter;margin:.9in 1in 1in;@bottom-center{content:counter(page) '  \\00b7  Cold Ischemia Foundation Research Digest';font:8.5pt Georgia,serif;color:#777}}
@media print{body{background:#fff;color:#1d1a16;font-size:11.3pt;line-height:1.55}.wrap{max-width:none;padding:0}.mast{padding:0 0 14pt;border-color:#bbb}h1,h2{color:#111}.deck,.src,.ver,.disc{color:#444}.stat{background:#f4efe2;border-left-color:#a8761c}.stat b{color:#a8761c}.stat span{color:#555}.btns,footer,nav,.cifnav{display:none!important}h1{font-size:26pt}h2{font-size:16pt;break-after:avoid}.k{color:#a8761c}.stat,.ver{-webkit-print-color-adjust:exact;print-color-adjust:exact}.ver{border-color:#a23a46}.draft{color:#a23a46;border-color:#a23a46}a{color:inherit;text-decoration:none}}
'''
issues = []
for f in sorted(glob.glob(os.path.join(D, 'issue-*-essay.md'))):
    num = re.search(r'issue-(\d+)-essay', f)[1]
    lines = open(f, encoding='utf-8').read().split('\n')
    title = re.sub(r'^# ', '', lines[0]); deck = lines[1].strip('*').strip() if lines[1].startswith('*') else ''
    out = []; sect = None; ul = False; words = 0
    for ln in lines[2:]:
        ln = ln.rstrip()
        if not ln.strip():
            if ul: out.append('</ul>'); ul = False
            continue
        if ln.startswith('## '):
            if ul: out.append('</ul>'); ul = False
            sect = ln[3:]
            cls = ' class="src"' if sect == 'Sources' else ''
            out.append('<h2>%s</h2>%s' % (e(sect), '<ul class="src">' if sect == 'Sources' else '')); ul = sect == 'Sources'
            continue
        m = re.match(r'\[\[STAT (.+?)\|(.+?)\]\]', ln)
        if m: out.append('<div class="stat"><b>%s</b><span>%s</span></div>' % (e(m[1]), e(m[2]))); continue
        if ln.startswith('- '): out.append('<li>%s</li>' % inline(ln[2:])); continue
        if sect in ('Verification status', 'How we checked'): out.append('<p class="ver">%s</p>' % inline(ln)); continue
        if ln.startswith('*') and ln.endswith('*') and 'Educational' in ln: out.append('<p class="disc">%s</p>' % inline(ln.strip('*'))); continue
        out.append('<p>%s</p>' % inline(ln))
        if sect not in ('Sources', 'Verification status', 'How we checked'): words += len(ln.split())
    body = '\n'.join(out)
    st = status.get(num, 'draft'); lbl = ('<div class="draft">Awaiting publication approval</div>' if st == 'ready' else '<div class="draft">Draft for review &middot; verification in progress</div>') if st != 'published' else ''
    pdf = 'research-digest-%s.pdf' % num
    page = '''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s | Cold Ischemia Foundation Research Digest</title>
<meta name="description" content="%s">
<style>%s</style></head><body>
<!--CIFNAV--><!--/CIFNAV-->
<header class="mast"><div class="wrap">%s<div class="k">Research Digest &middot; Issue %s</div><h1>%s</h1><p class="deck">%s</p>
<div class="btns"><a class="btn p" href="%s" download>Download the PDF</a><a class="btn" href="research-digest.html">All issues</a></div></div></header>
<main class="wrap"><article>%s</article></main>
<footer>&copy; Cold Ischemia Foundation &middot; No donations &middot; No industry funding</footer></body></html>''' % (e(title), e(deck), CSS, lbl, num, e(title), e(deck), pdf, body)
    open(os.path.join(R, 'research-digest-%s.html' % num), 'w', encoding='utf-8').write(page)
    issues.append((num, title, deck, words, st, pdf))
pub = [i for i in issues if i[4] == 'published']
cards = ''.join('<a class="card" href="research-digest-%s.html"><div class="k">Issue %s &middot; ~%s words%s</div><h3>%s</h3><p>%s</p><span class="btn p" style="display:inline-block">Read it</span> <span class="btn" style="display:inline-block">PDF available</span></a>' % (n, n, '{:,}'.format(round(w, -1)), ' &middot; draft' if st != 'published' else '', e(t), e(d)) for n, t, d, w, st, p in reversed(pub)) or '<p class="deck">The first issue is in review. It will appear here, with its free PDF download, as soon as every fact has been verified.</p>'
idx = '''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Research Digest | Cold Ischemia Foundation</title>
<meta name="description" content="A weekly, sourced essay on kidney, transplant, living-donor and care-partner research that mainstream outlets rarely cover, with who funded it and what it does not show. Free PDF download.">
<style>%s</style></head><body>
<!--CIFNAV--><!--/CIFNAV-->
<header class="mast"><div class="wrap"><div class="k">Research Digest</div><h1>The research your care team may not have time to read.</h1><p class="deck">One sourced, plain-language essay each week from peer-reviewed journals and primary reports. Every item names who funded it and what it does not show. Free to read and download.</p></div></header>
<main class="wrap"><article>%s</article></main>
<footer>&copy; Cold Ischemia Foundation &middot; No donations &middot; No industry funding</footer></body></html>''' % (CSS, cards)
open(os.path.join(R, 'research-digest.html'), 'w', encoding='utf-8').write(idx)
print([(i[0], i[3], i[4]) for i in issues])
