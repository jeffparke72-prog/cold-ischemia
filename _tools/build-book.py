#!/usr/bin/env python3
"""Assembles the guide from _book/*.html into living-donor-guide.html (web + print). PDF is made by _tools/book-pdf.js."""
import glob, os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(R, '_book')
PARTS = {'I': ('The Question', 'Why a gift this old still has so many unanswered questions.'),
         'II': ('The Law', 'Statutes, regulations, policies, and the money around them.'),
         'III': ('The Medicine', 'What the evaluation, the operation and the numbers actually say.'),
         'IV': ('The System', 'Exchange, incentives, oversight, and who benefits.'),
         'V': ('The Human', 'Why people say yes, and what happens when it goes wrong.'),
         'VI': ('The Reform', 'What donors are owed, and how to get it.')}
chs = []
for f in sorted(glob.glob(os.path.join(B, 'ch*.html'))):
    s = open(f, encoding='utf-8').read()
    m = re.search(r'id="(ch\d+)" data-part="(\w+)" data-title="([^"]+)"', s)
    chs.append((m[1], m[2], m[3].replace('&amp;', '&'), s))
words = sum(len(re.sub(r'<[^>]+>', ' ', c[3]).split()) for c in chs)
toc = []; body = []; last = None
for cid, part, title, s in chs:
    if part != last:
        pn, pd = PARTS[part]
        body.append('<section class="part" id="part-%s"><div class="part-n">Part %s</div><h1>%s</h1><p>%s</p></section>' % (part, part, pn, pd))
        toc.append('<li class="toc-part">Part %s &middot; %s</li>' % (part, pn)); last = part
    num = re.search(r'Chapter (\d+)', s)[1]
    toc.append('<li><a href="#%s"><span>%s</span>%s</a></li>' % (cid, num, title.replace('&', '&amp;')))
    body.append(s)
front = open(os.path.join(B, 'front.html'), encoding='utf-8').read()
appx = open(os.path.join(B, 'appx.html'), encoding='utf-8').read()
toc.append('<li class="toc-part">Back matter</li>')
for a, t in [('appA', 'Appendix A &middot; Glossary'), ('appB', 'Appendix B &middot; Timeline'), ('appC', 'Appendix C &middot; Where To Verify'), ('appD', 'Appendix D &middot; How This Guide Was Made, and Its Limits')]:
    toc.append('<li><a href="#%s">%s</a></li>' % (a, t))
css = open(os.path.join(B, 'book.css'), encoding='utf-8').read()
html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not a Spare | The Living Donor&rsquo;s Field Guide | Cold Ischemia Foundation</title>
<meta name="description" content="A policy-deep, evidence-first guide to living organ donation in the United States: the law, the money, the medicine, the ethics and the reform agenda. Free, independent, no industry funding.">
<style>
%s
</style>
</head>
<body>
<div id="bar"><i></i></div>
<nav class="topnav"><a href="index.html">&larr; Cold Ischemia Foundation</a><span><a href="#contents">Contents</a> <a href="not-a-spare-living-donor-guide.pdf" download>Download PDF</a></span></nav>

<section class="cover" id="top" aria-label="Cover">
  <div class="frame"></div>
  <svg class="rings" viewBox="0 0 600 600" aria-hidden="true"><defs><radialGradient id="g1"><stop offset="0" stop-color="#e8b84a" stop-opacity=".28"/><stop offset="1" stop-color="#e8b84a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="300" cy="300" r="290" fill="url(#g1)"/><circle cx="240" cy="300" r="160" fill="none" stroke="#c8902a" stroke-width="1.4" opacity=".7"/><circle cx="360" cy="300" r="160" fill="none" stroke="#8fd8ff" stroke-width="1.4" opacity=".5"/>
    <path d="M300 160 A160 160 0 0 1 300 440 A160 160 0 0 1 300 160Z" fill="#e8b84a" opacity=".10"/></svg>
  <div class="c-top">Cold Ischemia Foundation &nbsp;&middot;&nbsp; First Edition &nbsp;&middot;&nbsp; 2026</div>
  <div class="c-mid">
    <div class="c-not">NOT</div>
    <h1 class="c-title">A SPARE</h1>
    <div class="c-rule"></div>
    <p class="c-sub">The Living Donor&rsquo;s Field Guide to Law, Risk, Money and Conscience in America</p>
    <p class="c-tag">What the pamphlets leave out. What the policy requires. What a giver is owed.</p>
  </div>
  <div class="c-bot"><img src="cold-ischemia-logo-clear.png" alt=""><span>Independent &middot; No industry funding &middot; Free to read</span></div>
</section>

<section class="titlepage"><div>
  <div class="t-over">The Cold Ischemia Foundation presents</div>
  <h1>Not a Spare</h1>
  <p class="t-sub">The Living Donor&rsquo;s Field Guide to Law, Risk, Money and Conscience in America</p>
  <div class="t-orn">&#10086;</div>
  <p class="t-by">A policy-deep, evidence-first guide for donors, patients, clinicians and the people who write the rules</p>
  <p class="t-pl">Ellenton, Florida<br>coldischemia.foundation</p>
</div></section>

<section class="legal"><div>
  <p><b>Not a Spare</b> &mdash; First Edition, October 2026.<br>&copy; 2026 Cold Ischemia Foundation, Ellenton, Florida.<br>Free to read and share. Please keep it whole and credit the Foundation.</p>
  <p>This guide is educational. It is not medical, legal, tax or financial advice. Laws, policies and statistics change; verify against the primary sources in Appendix C. The chapter-opening scenes are composites invented for illustration and depict no real person. This edition has not been reviewed by a physician or an attorney (see Appendix D).</p>
  <p>The Cold Ischemia Foundation accepts no funding from pharmaceutical companies, dialysis corporations, hospital systems or insurers, and does not solicit or accept donations.</p>
  <p class="dedic"><i>For the ones who gave and were never asked how they were afterward.<br>And for the ones still waiting.</i></p>
  <p class="meta">About %s words in %d chapters, plus preface and appendices.</p>
</div></section>

<section class="contents" id="contents"><h2 class="front-h">Contents</h2><ol class="toc"><li class="toc-part">Front matter</li><li><a href="#preface">Preface &middot; The book you were not handed</a></li>%s</ol></section>

%s

%s

<footer class="colophon"><p>Not a Spare &middot; Cold Ischemia Foundation &middot; coldischemia.foundation</p></footer>
<script>
(function(){var b=document.querySelector('#bar i');function u(){var h=document.documentElement,s=h.scrollTop||document.body.scrollTop,t=h.scrollHeight-h.clientHeight;b.style.width=(t>0?s/t*100:0)+'%%'}addEventListener('scroll',u,{passive:true});u()})();
</script>
</body>
</html>
''' % (css, '{:,}'.format(round(words, -2) + 3500), len(chs), '\n'.join(toc), front, '\n'.join(body) + appx)
open(os.path.join(R, 'living-donor-guide.html'), 'w', encoding='utf-8').write(html)
print('chapters', len(chs), 'chapter words', words, 'html bytes', len(html))
