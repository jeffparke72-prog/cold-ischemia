#!/usr/bin/env python3
"""Regenerates the main navigation block in every page of the Cold Ischemia Foundation site.

Edit GROUPS below, then run:   python3 _tools/build-nav.py
Each page's nav lives between <!--CIFNAV--> and <!--/CIFNAV--> markers. Per-page layout tweaks (the
<style id="cifnav-pos"> block) and the "current page" highlight are preserved/recomputed automatically.
The _tools folder starts with an underscore, so GitHub Pages does not publish it.
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GROUPS = [
    ("About", [
        ("about.html", "Our Story"),
        ("independence.html", "What Independence Means"),
        ("cif-volunteer-page.html", "Volunteer"),
        ("volunteer-training.html", "Volunteer Training"),
        ("contact.html", "Contact"),
    ]),
    ("Advocacy", [
        ("command-center.html", "Command Center"),
        ("situation-room.html", "The Situation Room"),
        ("demand-letters.html", "Demand Letters"),
        ("congress-scorecard.html", "Congress Scorecard"),
        ("accountability.html", "Accountability Atlas"),
    ]),
    ("Learn", [
        ("research.html", "Research"),
        ("kidney-news.html", "Kidney News"),
        ("transplant-realities.html", "What Nobody Tells You"),
        ("transplant-line.html", "The Transplant Line"),
        ("donor-flow.html", "Project Donor-Flow"),
        ("living-donor-journey.html", "Living Donor Journey"),
        ("opo-directory.html", "U.S. OPO Directory"),
    ]),
    ("BHOC", [
        ("bhoc.html", "About BHOC"),
        ("field-notes.html", "BHOC Field Notes"),
    ]),
]
TOOLKIT = ("projects.html", "Toolkit")

OLD_BLOCK = re.compile(r'<style id="cifnav-css">(.*?)</style>\s*<nav(?: id="nav")? class="cifnav".*?</nav>', re.S)
NEW_BLOCK = re.compile(r'<!--CIFNAV-->(.*?)<!--/CIFNAV-->', re.S)


def render(page, tail, nav_id=False):
    on = lambda href: ' class="on"' if href == page else ''
    groups = []
    for gi, (label, items) in enumerate(GROUPS):
        active = any(h == page for h, _ in items)
        links = ''.join('<a href="%s"%s role="menuitem">%s</a>' % (h, on(h), t) for h, t in items)
        groups.append(
            '<div class="cn-g"><button type="button" class="cn-gb%s" aria-haspopup="true" aria-expanded="false">%s</button>'
            '<div class="cn-dd" role="menu">%s</div></div>' % (' on' if active else '', label, links))
    return (
        '<!--CIFNAV--><link rel="stylesheet" href="cif-nav.css">'
        '<style id="cifnav-pos">%s</style>'
        '<nav%s class="cifnav" aria-label="Main">'
        '<a href="index.html" class="cn-l"><img src="cold-ischemia-logo.png" alt="Cold Ischemia Foundation" '
        'onerror="this.style.display=\'none\'"><span class="cn-b">Cold Ischemia</span></a>'
        '<button type="button" class="cn-burger" aria-label="Open menu" aria-expanded="false" aria-controls="cn-menu">'
        '<span></span><span></span><span></span></button>'
        '<div class="cn-menu" id="cn-menu"><div class="cn-m">%s</div>'
        '<div class="cn-r"><a href="%s" class="cn-t"%s>%s</a></div></div>'
        '</nav><script src="cif-nav.js" defer></script><script src="cif-help.js" defer></script><!--/CIFNAV-->'
    ) % (tail, ' id="nav"' if nav_id else '', ''.join(groups), TOOLKIT[0], ' aria-current="page"' if page == TOOLKIT[0] else '',
         TOOLKIT[1])


def wants_id(text, own_block):
    rest = text.replace(own_block, '')
    uses = re.search(r'getElementById\((?:"|\')nav(?:"|\')\)', rest)
    taken = re.search(r'id="nav"', rest)
    return bool(uses) and not taken


def old_tail(css):
    """Keep only the per-page last rule(s) of the old inline nav stylesheet."""
    i = css.find('nav.cifnav{--cn-pos')
    return css[i:].strip() if i >= 0 else 'nav.cifnav{--cn-pos:sticky}'


def main():
    changed = skipped = 0
    for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
        page = os.path.basename(path)
        s = open(path, encoding='utf-8').read()
        m = NEW_BLOCK.search(s)
        if m:
            t = re.search(r'<style id="cifnav-pos">(.*?)</style>', m.group(1), re.S)
            tail = t.group(1) if t else 'nav.cifnav{--cn-pos:sticky}'
            new = s[:m.start()] + render(page, tail, wants_id(s, m.group(0))) + s[m.end():]
        else:
            m = OLD_BLOCK.search(s)
            if not m:
                skipped += 1
                continue
            new = s[:m.start()] + render(page, old_tail(m.group(1)), wants_id(s, m.group(0)) or 'id="nav" class="cifnav"' in m.group(0)) + s[m.end():]
        if new != s:
            open(path, 'w', encoding='utf-8').write(new)
            changed += 1
    print('pages updated: %d   pages without a main nav (left alone): %d' % (changed, skipped))


if __name__ == '__main__':
    sys.exit(main())
