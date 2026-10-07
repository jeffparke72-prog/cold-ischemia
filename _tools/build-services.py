#!/usr/bin/env python3
"""Builds services.html and the shareable infographic from one data table. PNG: node _tools/render-services.js"""
import html, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
I = {  # 40x40 line icons
 'compass': '<circle cx="20" cy="20" r="15"/><path d="M26 14l-4 9-9 3 4-9z"/>',
 'list': '<rect x="7" y="6" width="26" height="28" rx="3"/><path d="M13 14l3 3 5-6M13 25h14M13 30h9"/>',
 'shield': '<path d="M20 5l13 5v9c0 8-6 13-13 16C13 32 7 27 7 19v-9z"/><path d="M14 20l4 4 8-9"/>',
 'folder': '<path d="M5 12a3 3 0 013-3h8l4 4h12a3 3 0 013 3v13a3 3 0 01-3 3H8a3 3 0 01-3-3z"/>',
 'letter': '<rect x="5" y="9" width="30" height="22" rx="3"/><path d="M6 11l14 11 14-11"/>',
 'lens': '<circle cx="18" cy="18" r="11"/><path d="M26 26l9 9"/><path d="M13 18h10M18 13v10"/>',
 'scales': '<path d="M20 6v28M10 34h20M8 12h24"/><path d="M8 12l-5 12h10zM32 12l-5 12h10z"/>',
 'check': '<circle cx="20" cy="20" r="15"/><path d="M12 20l6 6 11-12"/>',
 'pen': '<path d="M7 33l4-1 20-20-3-3L8 29z"/><path d="M26 10l4 4"/>',
 'play': '<rect x="4" y="8" width="32" height="24" rx="3"/><path d="M17 15l9 5-9 5z"/>',
 'people': '<circle cx="13" cy="15" r="5"/><circle cx="27" cy="15" r="5"/><path d="M4 33c0-6 4-9 9-9s9 3 9 9M18 33c0-6 4-9 9-9s9 3 9 9"/>',
 'ring': '<circle cx="20" cy="20" r="13" stroke-dasharray="2 5"/><circle cx="20" cy="7" r="3"/><circle cx="33" cy="20" r="3"/><circle cx="20" cy="33" r="3"/><circle cx="7" cy="20" r="3"/><circle cx="20" cy="20" r="4"/>',
}
S = [  # name, icon, free, price, price note, long description, numeric base prices (US-average area)
 ('Navigation Calls','compass','20-minute orientation call and a personal roadmap.','$20','per hour, extended sessions','We listen, map where you are in the process, and tell you the next three honest steps. Longer sessions are billed by the hour.',[20]),
 ('Evaluation-Day Prep','list','Question lists and a pre-visit checklist.','$30','flat · 60-min prep + written plan','A one-hour prep session, a mock visit, and a written plan for the day you walk into the transplant program.',[30]),
 ('Insurance Appeals','shield','Appeal guide and letter tool.','$40','per appeal letter, fully cited','We draft the appeal letter with the policy language, the deadlines and the evidence, ready for your signature.',[40]),
 ('Records & Paper Trail','folder','Request templates and a running log.','$30','flat · done-with-you setup','We set up your records system and write the first round of records requests with you.',[30]),
 ('Advocacy Letters','letter','Sourced demand-letter templates.','$50 / $200','family / organization','A custom, sourced demand letter to an agency, a legislator or an institution: facts, law, ask, deadline.',[50,200]),
 ('Funding & Independence Audit','lens','Five-minute self-check, plus three claims checked.','from $350','full sourced audit of one group','A written, sourced profile of who funds an organization and where its voice may be limited, with every claim cited. Built for organizations, journalists and researchers.',[350]),
 ('Policy Briefs & Comments','scales','Plain-language policy summaries.','$75 · $400+','comment letter · briefing paper','A formal public-comment letter, or a briefing paper for a legislator, board or newsroom.',[75,400]),
 ('Fact-Check & Source Review','check','Up to three claims checked, sources attached.','$25','per 1,000 words reviewed','We trace every claim in your document to a primary source and mark what is confirmed, disputed or only alleged.',[25]),
 ('Voice & Script Writing','pen','Voice guide and a sample paragraph.','$50 · $75','script · op-ed','Posts, speeches, three-minute scripts and op-eds in your own voice, with sources.',[50,75]),
 ('Cinematic Explainer Films','play','Script outline and storyboard.','from $600','3-minute film, score, captions','A fully produced three-minute explainer with motion graphics, original score and on-screen text, for groups and organizations.',[600]),
 ('Workshops & Talks','people','30-minute webinar for patient groups.','$150 · $350','90-minute · half-day','Live training for support groups, volunteers, classrooms and conferences.',[150,350]),
 ('Support-Circle Launch','ring','Full starter kit and meeting guide.','$100','four facilitated sessions','We help you start a trust-based circle and run its first four meetings.',[100]),
]
TIERS = [('01','FREE','Self-serve + one 20-min call','$0'),('02','GUIDED','About an hour of our time','$20–$40'),('03','CUSTOM','A few hours of real work','$50–$200'),('04','PROJECT','Days of work, built to order','from $350')]
e = html.escape
def icon(k, w=40): return '<svg viewBox="0 0 40 40" width="%d" height="%d" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>' % (w, w, I[k])
CSS_FONTS = '''@font-face{font-family:'Anton';src:url(fonts/anton-400-normal.woff2) format('woff2')}
@font-face{font-family:'IBM Plex Mono';font-weight:400 500;src:url(fonts/ibmplexmono-500-normal.woff2) format('woff2')}
@font-face{font-family:'Playfair Display';font-weight:900;src:url(fonts/playfairdisplay-900-normal.woff2) format('woff2')}
@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400;src:url(fonts/playfairdisplay-400-italic.woff2) format('woff2')}
@font-face{font-family:'Crimson Pro';font-weight:400 600;src:url(fonts/crimsonpro-400-normal.woff2) format('woff2')}
@font-face{font-family:'Crimson Pro';font-style:italic;src:url(fonts/crimsonpro-400-italic.woff2) format('woff2')}'''
# ---------- infographic ----------
tiles = ''
for n, (name, ic, free, price, note, _, _b) in enumerate(S, 1):
    tiles += '<div class="t"><div class="th"><span class="n">%02d</span><span class="ic">%s</span></div><h3>%s</h3><div class="f"><b>FREE</b><span>%s</span></div><div class="m"><b>MORE</b><div class="p">%s</div><div class="pn">%s</div></div></div>' % (n, icon(ic, 38), e(name), e(free), e(price), e(note))
lad = ''.join('<div class="l"><span class="ln">%s</span><b>%s</b><i>%s</i><em>%s</em></div>' % (a, b, c, d) for a, b, c, d in TIERS)
INFO = '''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Cold Ischemia Foundation: Services infographic</title><style>
%s
*{box-sizing:border-box;margin:0;padding:0}html,body{background:#050a14}
#g{width:1080px;min-height:1640px;padding-bottom:30px;position:relative;overflow:hidden;color:#f3ede4;font-family:'Crimson Pro',Georgia,serif;background:radial-gradient(900px 600px at 80%% -5%%,rgba(42,196,200,.16),transparent 60%%),radial-gradient(800px 600px at 0%% 38%%,rgba(232,184,74,.11),transparent 60%%),linear-gradient(180deg,#070d1b,#050a14)}
#g:before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 59px,rgba(143,216,255,.035) 59px 60px);pointer-events:none}
.in{position:relative;padding:44px 40px 0}
.k{font:500 15px 'IBM Plex Mono',monospace;letter-spacing:.34em;color:#e8b84a;display:flex;align-items:center;gap:14px}.k:before{content:'';width:40px;height:2px;background:#e8b84a}
h1{font:400 100px/.93 'Anton',Impact,sans-serif;letter-spacing:.01em;margin:18px 0 14px;text-transform:uppercase}h1 span{display:block}h1 .a{color:#2ac4c8}h1 .b{background:linear-gradient(180deg,#ffe6a8,#e8b84a 50%%,#a8761c);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{font:italic 400 27px/1.3 'Playfair Display',serif;color:#cfc6b6;max-width:900px}
.lad{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:26px 0 20px;border:1px solid rgba(232,184,74,.5);border-radius:10px;overflow:hidden;background:rgba(10,22,40,.85)}
.l{padding:14px 16px 13px;border-left:1px solid rgba(232,184,74,.25);position:relative}.l:first-child{border:0;background:linear-gradient(135deg,rgba(42,196,200,.22),transparent)}
.ln{font:500 13px 'IBM Plex Mono',monospace;color:#e8b84a;letter-spacing:.2em}.l b{display:block;font:400 30px/1.1 'Anton',sans-serif;letter-spacing:.06em;margin:3px 0}.l i{display:block;font-style:normal;font:400 15px/1.3 'Crimson Pro',serif;color:#b8b0a2;min-height:40px}.l em{display:block;font:400 26px 'Anton',sans-serif;color:#e8b84a;font-style:normal;margin-top:6px;letter-spacing:.03em}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.t{background:linear-gradient(160deg,rgba(15,30,56,.95),rgba(8,16,30,.95));border:1px solid rgba(143,216,255,.16);border-radius:10px;padding:13px 15px 13px;border-top:3px solid #e8b84a;min-height:246px;display:flex;flex-direction:column}
.th{display:flex;justify-content:space-between;align-items:center}.n{font:500 14px 'IBM Plex Mono',monospace;color:#e8b84a;letter-spacing:.14em}.ic{color:#2ac4c8;line-height:0}
h3{font:400 24px/1.08 'Anton',sans-serif;letter-spacing:.035em;text-transform:uppercase;margin:6px 0 8px;min-height:52px}
.f{font:400 16px/1.25 'Crimson Pro',serif;color:#d8cfc4;min-height:42px;margin-bottom:8px}.f b,.m b{display:inline-block;font:500 11px 'IBM Plex Mono',monospace;letter-spacing:.2em;padding:2px 7px;border-radius:3px;margin-right:6px;vertical-align:1px}.f b{background:rgba(42,196,200,.2);color:#2ac4c8}.m b{background:rgba(232,184,74,.2);color:#e8b84a}
.m{margin-top:auto;border-top:1px dashed rgba(243,237,228,.2);padding-top:8px}.p{font:400 30px/1.05 'Anton',sans-serif;color:#e8b84a;letter-spacing:.02em;margin-top:5px}.pn{font:500 12px/1.3 'IBM Plex Mono',monospace;color:#9fb0c4;letter-spacing:.03em;margin-top:3px}
.ft{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:14px}.r{border:1px solid rgba(232,184,74,.45);border-radius:10px;padding:12px 16px;background:rgba(10,22,40,.8)}.r small{display:block;font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.2em;color:#9fb0c4}.r strong{font:400 44px/1 'Anton',sans-serif;color:#e8b84a;display:block;margin:4px 0}.r span{font:400 15px/1.25 'Crimson Pro',serif;color:#cfc6b6}.r.h{border-color:#2ac4c8}.r.h strong{color:#2ac4c8;font-size:36px;padding:4px 0}
.col{margin-top:14px;border:1px dashed rgba(42,196,200,.6);border-radius:10px;padding:11px 16px;background:rgba(42,196,200,.08);font:400 17px/1.35 'Crimson Pro',serif;color:#e8e2d6}.col b{display:block;font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.22em;color:#2ac4c8;margin-bottom:4px}.col em{font-style:normal;color:#e8b84a;font-weight:600}
.vow{margin-top:14px;text-align:center;font:italic 400 26px/1.3 'Playfair Display',serif;color:#fff;padding:12px 10px;border-top:2px solid #e8b84a;border-bottom:2px solid #e8b84a}.vow b{font-weight:400;color:#e8b84a}
.url{display:flex;justify-content:space-between;gap:12px;margin:12px 4px 0;font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.07em;color:#8fa0b4;white-space:nowrap}
</style></head><body><div id="g"><div class="in">
<div class="k">COLD ISCHEMIA FOUNDATION &middot; SERVICES</div>
<h1><span>What we do.</span><span class="a">What&rsquo;s free.</span><span class="b">What costs.</span></h1>
<p class="sub">Twelve ways we help patients, donors and care partners. The basics are always free. When it takes real work, you pay a small, posted rate, scaled to your local cost of living.</p>
<div class="lad">%s</div>
<div class="grid">%s</div>
<div class="ft"><div class="r"><small>INDIVIDUALS</small><strong>$20/hr</strong><span>Patients, donors, care partners</span></div><div class="r"><small>ORGANIZATIONS</small><strong>$50/hr</strong><span>Nonprofits, schools, media, law firms, officials</span></div><div class="r h"><small>CAN&rsquo;T AFFORD IT?</small><strong>SAY SO.</strong><span>Hardship requests are reviewed, and often free</span></div></div>
<div class="col"><b>PRICED FOR WHERE YOU LIVE</b><span>Price = base price &times; your area&rsquo;s cost-of-living index &divide; 100 (U.S. BEA). Insurance appeal letter: <em>Arkansas $35</em> &middot; <em>U.S. average $40</em> &middot; <em>California $45</em></span></div><div class="vow">No donations. No industry funding. No strings. <b>Fees pay for our time, never for our opinions.</b></div>
<div class="url"><span>WE DO NOT WORK FOR DRUGMAKERS, DIALYSIS COMPANIES, INSURERS OR HOSPITAL SYSTEMS</span><span>COLDISCHEMIA.FOUNDATION</span></div>
</div></div></body></html>''' % (CSS_FONTS.replace('url(fonts/', 'url(../fonts/'), lad, tiles)
open(os.path.join(R, '_film2/services-infographic.html'), 'w', encoding='utf-8').write(INFO)
# ---------- page ----------
cards = ''
for n, (name, ic, free, price, note, long, _b) in enumerate(S, 1):
    cards += '<article class="sv reveal"><div class="sh"><span class="sn">%02d</span><span class="si">%s</span></div><h3>%s</h3><p class="ld">%s</p><div class="two"><div class="fr"><b>Free</b><p>%s</p></div><div class="pd"><b>When it takes more work</b><p class="pr">%s</p><p class="pnn">%s</p></div></div></article>' % (n, icon(ic, 34), e(name), e(long), e(free), e(price), e(note))
lad2 = ''.join('<div class="step"><span>%s</span><h3>%s</h3><p>%s</p><b>%s</b></div>' % (a, b, c, d) for a, b, c, d in TIERS)
import json
BASES = json.dumps([[x[0], x[6], x[5]] for x in S])
PAGE = open(os.path.join(R, '_book/services-template.html'), encoding='utf-8').read().replace('{{CARDS}}', cards).replace('{{LADDER}}', lad2).replace('{{BASES}}', BASES.replace('</','<\\/'))
open(os.path.join(R, 'services.html'), 'w', encoding='utf-8').write(PAGE)
print('ok', len(S), 'services')
