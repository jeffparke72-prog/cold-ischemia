#!/usr/bin/env python3
"""Assembles _book/*.html into living-donor-guide.html. Two-pass TOC page numbers: see _tools/book-pdf.js / book-merge.py (pass --pages pages.json)."""
import glob, os, re, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import book_figs as F
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(R, '_book')
ED = 'full' if '--full' in sys.argv else 'essay'
PAGES = json.load(open('/tmp/_pages.json')) if os.path.exists('/tmp/_pages.json') and '--pages' in sys.argv else {}
PARTS = {'P': ('Prelude', 'Where you are standing, before the facts begin.'),
         'I': ('The Question', 'Why a gift this old still has so many unanswered questions.'),
         'II': ('The Law', 'Statutes, regulations, policies, and the money around them.'),
         'III': ('The Medicine', 'What the evaluation, the operation and the numbers actually say.'),
         'IV': ('The System', 'Exchange, incentives, oversight, and who benefits.'),
         'V': ('The Human', 'Why people say yes, and what happens when it goes wrong.'),
         'VI': ('The Reform', 'What donors are owed, and how to get it.'),
         'VII': ('Closing', 'Who stands with you.')}
files = [B + '/essay.html'] if ED == 'essay' else sorted(glob.glob(B + '/pre*.html')) + sorted(glob.glob(B + '/ch*.html')) + sorted(glob.glob(B + '/close.html'))
chs = []
for f in files:
    raw = open(f, encoding='utf-8').read()
    for s in (re.findall(r'<section.*?</section>', raw, re.S) if ED == 'essay' else [raw]):
        m = re.search(r'id="(\w+)" data-part="(\w+)" data-title="([^"]+)"', s)
        num = re.search(r'class="ch-num">([^<]+)<', s)[1]
        chs.append((m[1], m[2], m[3], num, s))
def fig(name): return F.FIGS[name]() if name in F.FIGS else ''
words = 0; toc = []; body = []; last = None
for cid, part, title, num, s in chs:
    s = re.sub(r'<p class="figure-wrap" data-fig="(\w+)"></p>', lambda m: fig(m[1]), s)
    if ED == 'full' and cid == 'ch01': s = s.replace('<h3>', F.wait() + '<h3>', 1)
    if ED == 'full' and cid == 'ch10': s = s.replace('<ol class="notes">', F.risk() + '<ol class="notes">', 1)
    if ED == 'full' and cid == 'ch09': s = s.replace('<ol class="notes">', F.journey() + '<ol class="notes">', 1)
    words += len(re.sub(r'<[^>]+>', ' ', s).split())
    if ED == 'full' and part != last:
        pn, pd = PARTS[part]
        body.append('<section class="part" id="part-%s">%s<div class="part-n">%s</div><h1>%s</h1><p>%s</p></section>' % (part, F.orn(), 'Part ' + part if part not in 'PVII' or part in ('I', 'II', 'III', 'IV', 'V', 'VI') else '', pn, pd))
        toc.append('<li class="toc-part">%s%s</li>' % ('Part %s &middot; ' % part if part in ('I','II','III','IV','V','VI') else '', pn)); last = part
    label = {'One':'1','Two':'2','Three':'3','Four':'4','Five':'5','Six':'6','Seven':'7'}.get(num) or re.sub(r'\D', '', num) or ('P' + {'One':'1','Two':'2','Three':'3'}.get(num.split()[-1], '') if num.startswith('Prelude') else '&#9733;')
    pg = PAGES.get(cid, '')
    toc.append('<li><a href="#%s"><span>%s</span><em>%s</em><i class="dots"></i><b class="pg">%s</b></a></li>' % (cid, label, title.replace('&', '&amp;'), pg))
    body.append(s)
front = open(B + '/front.html', encoding='utf-8').read() if ED == 'full' else ''
appx = open(B + '/appx.html', encoding='utf-8').read() if ED == 'full' else ''
if ED == 'full': toc.append('<li class="toc-part">Back matter</li>')
for a, t in [] if ED == 'essay' else [('appA', 'Appendix A &middot; Glossary'), ('appB', 'Appendix B &middot; Timeline'), ('appC', 'Appendix C &middot; Where To Verify'), ('appD', 'Appendix D &middot; How This Guide Was Made, and Its Limits')]:
    toc.append('<li><a href="#%s"><span></span><em>%s</em><i class="dots"></i><b class="pg">%s</b></a></li>' % (a, t, PAGES.get(a, '')))
css = open(B + '/book.css', encoding='utf-8').read()
TITLE = 'The Living Kidney Donor&rsquo;s Field Guide to Law, Risk, Money and Conscience in America'
MED = '''<section class="medical"><div>
<div class="m-label">Please read this first</div>
<h2>We are not medical experts.</h2>
<p>The Cold Ischemia Foundation is a patient-led advocacy organization. Our authors are advocates, writers and researchers. <b>We are not doctors, nurses, attorneys or financial advisors, and nothing in this guide is medical, legal, tax or financial advice.</b> It will not tell you whether you are healthy enough to donate, whether you should donate, or how to treat any condition.</p>
<p><b>For medical advice, talk to your own healthcare team.</b> That means your primary-care clinician and, if you are being evaluated, the transplant program&rsquo;s physicians, nurses, social workers and your independent living donor advocate. Ask them anything this guide raises. Bring it with you and write in the margins.</p>
<div class="m-box"><b>If it is an emergency, call 911.</b><br>Chest pain, trouble breathing, heavy bleeding, fainting, sudden severe pain, signs of stroke, or any situation where you believe a life is in danger. After any surgery, do not wait for office hours with a fever, worsening pain, a wound that opens, or little or no urine: call your surgical team or go to the nearest emergency department.<br><br><b>If you are in emotional crisis,</b> call or text <b>988</b> (Suicide &amp; Crisis Lifeline), any hour, anywhere in the United States.</div>
<p class="small">Laws, policies and statistics change. Verify anything you rely on at the primary sources listed in Appendix C. The scenes that open each chapter are invented composites. This edition has not yet been reviewed by a physician or an attorney.</p>
</div></section>'''
html = open(B + '/shell.html', encoding='utf-8').read()
for k, v in {'{{CSS}}': css, '{{TITLE}}': TITLE, '{{WORDS}}': '1,400' if ED == 'essay' else '{:,}'.format(round(words + 3500, -2)), '{{PREFACE}}': '' if ED == 'essay' else '<li><a href="#preface"><span></span><em>Preface &middot; The book you were not handed</em><i class="dots"></i><b class="pg">%s</b></a></li>' % PAGES.get('preface',''), '{{EDITION}}': 'First Edition' if ED == 'essay' else 'Extended Reference Edition', '{{OTHER}}': '<a href="living-donor-guide-full.html">Extended edition</a>' if ED == 'essay' else '<a href="living-donor-guide.html">Short edition</a>', '{{PDF}}': 'not-a-spare-living-donor-guide.pdf' if ED == 'essay' else 'not-a-spare-extended-edition.pdf', '{{COUNTLINE}}': 'A 1,400-word essay &middot; with figures' if ED == 'essay' else 'About %s words &middot; %d chapters' % ('{:,}'.format(round(words + 3500, -2)), len(chs)), '{{NCH}}': str(len(chs)), '{{TOC}}': '\n'.join(toc), '{{MED}}': MED, '{{FRONT}}': front, '{{BODY}}': '\n'.join(body) + appx}.items():
    html = html.replace(k, v)
open(R + ('/living-donor-guide.html' if ED == 'essay' else '/living-donor-guide-full.html'), 'w', encoding='utf-8').write(html)
print('sections', len(chs), 'words', words)
