#!/usr/bin/env python3
"""Build DOCX, PDF and EPUB for 'The Cooler and the Clock' from the markdown manuscript in ms/."""
import re, os, sys, json, html, zipfile, subprocess, shutil, datetime
HERE=os.path.dirname(os.path.abspath(__file__)); MS=HERE+'/ms'; FIG=HERE+'/fig'; OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/out/paper'
os.makedirs(OUT,exist_ok=True)
TITLE='The Cooler and the Clock'
SUB="A Lean Six Sigma Audit of America’s Kidney Transplant System, and the People Who Absorb Its Defects"
AUTHOR='Jeff Parke'
ORDER=['00-front.md','01-part1.md','01b-ch3.md','02-part2.md','03-part3a.md','03c-ch9.md','03-part3b.md','04a1-part4-ch12.md','04c-ch13.md','04a2-ch14.md','04-part4b.md','05-appendices.md']
ALT={
'dmaic':'Five chevrons showing the Lean Six Sigma phases Define, Measure, Analyze, Improve and Control mapped to Parts One through Five of this book.',
'removals':'Grouped bar chart of kidney candidates removed from the waiting list, 2020 to 2023. Deaths fall from 4,891 to 3,803 while removals for being too sick rise from 3,814 to 4,672.',
'voc':'Tree diagram translating the patient’s need to live and afford living into six critical-to-quality requirements: access, timeliness, organ quality, affordability, trust and understanding.',
'sipoc':'SIPOC diagram of the kidney transplant process listing suppliers, inputs, ten process steps, outputs and customers.',
'nonuse':'Line chart of the share of recovered kidneys not transplanted: 18.2 percent in 2013, 26.6 in 2022, 27.9 in 2023 and 29.3 in 2024.',
'sigma':'Bar chart of the estimated sigma level of kidney nonuse: 2.41 in 2013, 2.12 in 2022, 2.09 in 2023 and 2.04 in 2024, with reference lines at three and four sigma.',
'hazard':'Line chart showing the relative hazard of graft failure and death rising with cold ischemia time from 6 to 36 hours, reaching 1.36 and 1.53 at 30 hours.',
'fishbone':'Ishikawa fishbone diagram of causes of a recovered kidney not being transplanted, grouped under people, policy, process, preservation, payment and patient data.',
'incentives':'Incentive map showing which payer or regulator measures or pays dialysis facilities, transplant hospitals, procurement organizations, the network board and living donors, and for what.',
'living':'Bar chart of living kidney donors per year: 6,867 in 2019, 6,290 in 2023, 6,419 in 2024 and 6,522 in 2025.',
'ladder':'Evidence ladder placing static cold storage, machine perfusion, oxygenated and normothermic perfusion, an oxygen-carrier additive, the BHOC concept and pig kidney xenotransplantation by stage of evidence.'}

# ---------- smart typography ----------
def smart(t):
    t=re.sub(r'(^|[\s(\[—–])"',lambda m:m.group(1)+'“',t)
    t=t.replace('"','”')
    t=re.sub(r"(^|[\s(\[—])'",lambda m:m.group(1)+'‘',t)
    t=t.replace("'",'’')
    return t

# ---------- parse ----------
def parse():
    blocks=[]
    for f in ORDER:
        lines=open(MS+'/'+f,encoding='utf-8').read().split('\n'); i=0
        while i<len(lines):
            L=lines[i].rstrip()
            if not L.strip(): i+=1; continue
            if L.startswith('@@'):
                tag=L[2:].strip(); i+=1; body=[]
                while i<len(lines) and lines[i].strip() and not lines[i].startswith('@@'): body.append(lines[i].strip()); i+=1
                blocks.append(('special',tag,body)); continue
            if L.startswith('## '): blocks.append(('h3',L[3:].strip())); i+=1; continue
            if L.startswith('# '): blocks.append(('h1',L[2:].strip())); i+=1; continue
            if L.startswith('EPIGRAPH:'):
                q=L[9:].strip(); by=''
                if i+1<len(lines) and lines[i+1].startswith('BY:'): by=lines[i+1][3:].strip(); i+=1
                blocks.append(('epi',q,by)); i+=1; continue
            m=re.match(r'\[\[FIG:([a-z]+)\|(.*)\]\]',L)
            if m: blocks.append(('fig',m.group(1),m.group(2))); i+=1; continue
            if L.startswith(':::note'):
                title=L[7:].strip(); i+=1; items=[]
                while i<len(lines) and not lines[i].startswith(':::'):
                    if lines[i].strip(): items.append(lines[i].strip())
                    i+=1
                i+=1; blocks.append(('note',title,items)); continue
            if L.startswith('|'):
                rows=[]
                while i<len(lines) and lines[i].startswith('|'):
                    cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
                    if not all(re.fullmatch(r'-+',c) for c in cells): rows.append(cells)
                    i+=1
                blocks.append(('table',rows)); continue
            blocks.append(('p',L.strip())); i+=1
    return blocks
BL=parse()

def classify(txt):
    if txt.startswith('PART '): return 'part'
    if txt.startswith('Chapter '): return 'chapter'
    return 'front'   # prologue, author's note, epilogue, appendices, about

# ---------- inline ----------
def inline_html(t):
    t=html.escape(smart(t),quote=False)
    t=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',t)
    t=re.sub(r'(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)',r'<em>\1</em>',t)
    return t
def inline_runs(t):
    t=smart(t); out=[]
    for part in re.split(r'(\*\*.+?\*\*|(?<!\*)\*(?!\s).+?(?<!\s)\*(?!\*))',t):
        if not part: continue
        if part.startswith('**') and part.endswith('**'): out.append((part[2:-2],'b'))
        elif part.startswith('*') and part.endswith('*') and len(part)>2: out.append((part[1:-1],'i'))
        else: out.append((part,''))
    return out

# heading registry for TOC
HEADS=[]  # (id, level, text)
def heads():
    n=0
    for b in BL:
        if b[0]=='h1':
            n+=1; kind=classify(b[1])
            lvl=2 if kind=='chapter' else 1
            HEADS.append((f's{n}',lvl,b[1]))
heads()

COPY=['<strong>'+TITLE+'</strong>', SUB, 'Copyright © 2026 Jeff Parke. All rights reserved.',
'Published by the Cold Ischemia Foundation, Ellenton, Florida. coldischemia.foundation',
'First edition, October 2026.',
'No part of this book may be reproduced, stored in a retrieval system, or transmitted in any form or by any means without the prior written permission of the publisher, except for brief quotations used in reviews or scholarly work with full attribution.',
'<strong>Educational purpose.</strong> This book analyzes systems and policy. It is not medical, legal, or financial advice and does not replace the counsel of your own clinicians. In a medical emergency call 911. If you or someone you love is in emotional crisis, call or text 988.',
'<strong>On accuracy.</strong> Statements about organizations, investigations, and legal matters describe the sources cited and are labeled in the text as facts, findings, allegations, or rumors. An allegation is not proof of wrongdoing. Sources marked with a dagger (†) have bibliographic details that should be completed from the original before any future edition. Corrections are welcome through the Foundation’s contact page.',
'<strong>Quotations.</strong> The epigraphs are drawn from works in the public domain.']

# =============== HTML (PDF + EPUB) ===============
CSS_COMMON='''
body{font-family:"Crimson Pro",Georgia,serif;color:#1b2430;line-height:1.5;font-size:11.2pt;text-align:justify;hyphens:auto}
p{margin:0 0 .55em;text-indent:1.3em;orphans:2;widows:2} p.first,p.noind{text-indent:0}
h1,h2,h3{font-family:"Playfair Display",Georgia,serif;color:#0f2742;text-align:left;hyphens:none}
h1.part{font-size:30pt;text-align:center;margin:3.2in 0 .3in;letter-spacing:2px;page-break-before:always}
h1.front{font-size:22pt;margin:.6in 0 .3in;page-break-before:always}
h2.chap{font-size:20pt;margin:.55in 0 .15in;page-break-before:always;line-height:1.15}
h3{font-size:13.5pt;margin:1.1em 0 .35em;line-height:1.25;page-break-after:avoid}
.epi{margin:.1in .5in .35in;font-style:italic;text-align:left;color:#3a4756} .epi .by{display:block;text-align:right;font-style:normal;font-size:9.5pt;letter-spacing:.5px;margin-top:.25em;color:#6b7684}
figure{margin:.9em 0;text-align:center;page-break-inside:avoid} figure img{width:100%;height:auto} figcaption{font-size:9pt;color:#4a5563;text-align:left;margin-top:.3em;line-height:1.35;font-style:italic}
.note{border-left:4px solid #c8902a;background:#f4efe4;padding:.7em 1em;margin:1em 0;page-break-inside:avoid;text-align:left} .note p{text-indent:0;margin:0 0 .4em;font-size:10.4pt} .note .nt{font-family:"Playfair Display",serif;font-weight:700;color:#0f2742;font-size:11pt;margin-bottom:.4em}
table{border-collapse:collapse;width:100%;margin:1em 0;font-size:9.4pt;page-break-inside:auto;text-align:left} th{background:#0f2742;color:#fff;padding:5px 7px;text-align:left} td{border-bottom:1px solid #cdd5de;padding:5px 7px;vertical-align:top} tr{page-break-inside:avoid}
.toc a{color:#0f2742;text-decoration:none} .toc div{display:flex;align-items:baseline;margin:2px 0} .toc .l1{font-weight:700;margin-top:7px} .toc .l2{padding-left:1.4em;font-size:10.4pt} .toc .dots{flex:1;border-bottom:1px dotted #8b97a6;margin:0 6px;transform:translateY(-3px)}
.title{text-align:center;margin-top:2.2in} .title h1{font-size:34pt;letter-spacing:2px;text-align:center;margin:0;line-height:1.05;page-break-before:auto} .title .sub{font-style:italic;font-size:14pt;margin:.35in .4in;color:#3a4756} .title .au{font-family:"Bebas Neue",sans-serif;letter-spacing:8px;font-size:22pt;margin-top:.9in;color:#0f2742} .title .fd{font-size:9pt;letter-spacing:3px;color:#6b7684;text-transform:uppercase}
.copy{margin-top:3.2in;font-size:9pt;text-align:left} .copy p{text-indent:0;margin-bottom:.7em}
.ded{margin-top:2.6in;text-align:center;font-style:italic;font-size:13pt;padding:0 .7in} .kel{margin-top:2.4in;padding:0 .5in;font-style:italic;font-size:12pt;text-align:left}.kel .by{display:block;text-align:right;font-style:normal;font-size:9.5pt;margin-top:.6em;color:#6b7684}
.refs p{text-indent:-1.3em;margin-left:1.3em;font-size:9.6pt;text-align:left;word-break:break-word}
'''
def render_html(toc_pages=None, epub=False):
    out=[]; hid=0; first_after_head=False; in_refs=False
    for b in BL:
        t=b[0]
        if t=='special':
            tag,body=b[1],b[2]
            if tag=='TITLEPAGE': out.append(f'<div class="title"><h1>{TITLE.upper()}</h1><div class="sub">{html.escape(SUB)}</div><div class="au">{AUTHOR.upper()}</div><div class="fd">Cold Ischemia Foundation</div></div>')
            elif tag=='COPYRIGHT': out.append('<div class="copy" style="page-break-before:always">'+''.join(f'<p>{c}</p>' for c in COPY)+'</div>')
            elif tag=='DEDICATION': out.append('<div class="ded" style="page-break-before:always">'+inline_html(' '.join(body))+'</div>')
            elif tag=='EPIGRAPH':
                q=body[0]; by=body[1] if len(body)>1 else ''
                out.append(f'<div class="kel" style="page-break-before:always">{inline_html(q)}<span class="by">{inline_html(by)}</span></div>')
            elif tag=='TOC':
                rows=[]
                for hid_,lvl,txt in HEADS:
                    pg=(toc_pages or {}).get(hid_,'')
                    label=html.escape(smart(txt))
                    if epub: rows.append(f'<div class="l{lvl}"><a href="{hid_}.xhtml">{label}</a></div>')
                    else: rows.append(f'<div class="l{lvl}"><a href="#{hid_}">{label}</a><span class="dots"></span><span>{pg}</span></div>')
                out.append('<h1 class="front" style="page-break-before:always" id="toc">Contents</h1><div class="toc">'+''.join(rows)+'</div>')
            continue
        if t=='h1':
            hid+=1; kind=classify(b[1]); cls={'part':'part','chapter':'chap','front':'front'}[kind]; tag='h2' if kind=='chapter' else 'h1'
            in_refs = b[1].startswith('Appendix C')
            out.append(f'<{tag} class="{cls}" id="s{hid}">{html.escape(smart(b[1]))}</{tag}>'); first_after_head=True; continue
        if t=='h3': out.append(f'<h3>{html.escape(smart(b[1]))}</h3>'); first_after_head=True; continue
        if t=='epi': out.append(f'<div class="epi">{inline_html(b[1])}<span class="by">{inline_html(b[2])}</span></div>'); continue
        if t=='fig':
            k=b[1]; out.append(f'<figure><img src="fig/{k}.png" alt="{html.escape(ALT[k])}"/><figcaption>{inline_html(b[2])}</figcaption></figure>'); continue
        if t=='note':
            ttl=f'<div class="nt">{inline_html(b[1])}</div>' if b[1] else ''
            out.append('<div class="note">'+ttl+''.join(f'<p>{inline_html(x)}</p>' for x in b[2])+'</div>'); continue
        if t=='table':
            rows=b[1]; h=''.join(f'<th>{inline_html(c)}</th>' for c in rows[0]); body=''.join('<tr>'+''.join(f'<td>{inline_html(c)}</td>' for c in r)+'</tr>' for r in rows[1:])
            out.append(f'<table><thead><tr>{h}</tr></thead><tbody>{body}</tbody></table>'); continue
        if t=='p':
            cls=' class="first"' if first_after_head else ''
            first_after_head=False
            wrap='refs' if in_refs else ''
            out.append(f'<p{cls}>{inline_html(b[1])}</p>' if not in_refs else f'<div class="refs"><p>{inline_html(b[1])}</p></div>')
    return '\n'.join(out)

# =============== PDF ===============
def build_pdf():
    fontcss=''.join(f'@font-face{{font-family:"{n}";src:url("file:///home/user/cold-ischemia/fonts/{f}");font-weight:{w};font-style:{s}}}' for n,f,w,s in [('Crimson Pro','crimsonpro-400-normal.woff2',400,'normal'),('Crimson Pro','crimsonpro-400-italic.woff2',400,'italic'),('Crimson Pro','crimsonpro-600-normal.woff2',700,'normal'),('Playfair Display','playfairdisplay-900-normal.woff2',700,'normal'),('Bebas Neue','bebasneue-400-normal.woff2',400,'normal')])
    def page(toc):
        body=render_html(toc)
        return f'<!doctype html><html><head><meta charset="utf-8"><base href="file://{HERE}/"><style>@page{{size:6in 9in;margin:0.8in 0.7in 0.85in 0.7in}}{fontcss}{CSS_COMMON}</style></head><body>{body}</body></html>'
    js="""const pw=require('/opt/node22/lib/node_modules/playwright');(async()=>{const b=await pw.chromium.launch();const p=await b.newPage();await p.goto('file://%s');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);await p.pdf({path:'%s',width:'6in',height:'9in',printBackground:true,preferCSSPageSize:true});await b.close()})()"""
    import fitz
    toc=None
    for ps in (1,2):
        hp=f'{OUT}/_body.html'; open(hp,'w',encoding='utf-8').write(page(toc)); bp=f'{OUT}/_body.pdf'
        open('/tmp/_pdfjs.js','w').write(js%(hp,bp)); subprocess.run(['node','/tmp/_pdfjs.js'],check=True)
        doc=fitz.open(bp); n=len(doc); toc={}
        # locate headings after the TOC pages
        start=0
        for pi in range(n):
            if 'Contents' in doc[pi].get_text()[:80]: start=pi+1; break
        cur=start+1
        for hid_,lvl,txt in HEADS:
            needle=smart(txt)
            found=None
            for pi in range(cur,n):
                if doc[pi].search_for(needle[:60]): found=pi; break
            if found is None: print('NOT FOUND',txt); found=cur
            toc[hid_]=found+2   # +1 for cover page, +1 for 1-based
            cur=found
    # merge cover + stamp numbers
    cover=fitz.open(); w,h=432,691.2; pg=cover.new_page(width=w,height=h); pg.insert_image(fitz.Rect(0,0,w,h),filename=HERE+'/cover.jpg')
    merged=fitz.open(); merged.insert_pdf(cover); merged.insert_pdf(fitz.open(bp))
    skip=set()
    for pi in range(len(merged)):
        txt=merged[pi].get_text()
        if pi<5: skip.add(pi)   # cover, title, copyright, dedication, epigraph
    for pi in range(len(merged)):
        if pi in skip: continue
        p=merged[pi]; r=p.rect
        p.insert_text((r.width/2-6,r.height-38),str(pi+1),fontsize=9,fontname='tiro',color=(.35,.4,.47))
    merged.set_metadata({'title':f'{TITLE}: {SUB}','author':AUTHOR,'subject':'A Lean Six Sigma audit of the American kidney transplant system','keywords':'kidney transplant, organ donation, Lean Six Sigma, policy'})
    merged.save(f'{OUT}/The-Cooler-and-the-Clock.pdf',deflate=True,garbage=3)
    print('PDF pages',len(merged))

# =============== EPUB ===============
def build_epub():
    css=CSS_COMMON.replace('page-break-before:always','page-break-before:always')
    # split html by h1/h2 headings into files s1..sN; frontmatter before first heading into f0
    body=render_html(None,epub=True)
    chunks=re.split(r'(?=<h[12] class="(?:part|chap|front)" id="s\d+">)',body)
    files=[]
    pre=chunks[0]; chunks=chunks[1:]
    # front: title, copyright, dedication, epigraph, contents
    files.append(('front','Title and contents',pre))
    for ch in chunks:
        m=re.match(r'<h[12] class="[a-z]+" id="(s\d+)">(.*?)</h[12]>',ch)
        files.append((m.group(1),html.unescape(m.group(2)),ch))
    mimetype='application/epub+zip'
    import uuid; uid='urn:uuid:'+str(uuid.UUID('c0de1c0d-2026-4a10-9c0a-5b7e2c1a0001'))
    mf=[];spine=[];nav=[]
    z=zipfile.ZipFile(f'{OUT}/The-Cooler-and-the-Clock.epub','w')
    z.writestr('mimetype',mimetype,compress_type=zipfile.ZIP_STORED)
    z.writestr('META-INF/container.xml','<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')
    ecss=re.sub(r'font-family:"[^"]*",',' font-family:',css)
    ecss=css+'\nbody{text-align:left}\nh1.part{margin:30% 0 1em}\n'
    ecss=ecss.replace('.toc div{display:flex;align-items:baseline;margin:2px 0}','.toc div{margin:3px 0}').replace('.toc .dots{flex:1;border-bottom:1px dotted #8b97a6;margin:0 6px;transform:translateY(-3px)}','')
    z.writestr('OEBPS/style.css',ecss)
    def xhtml(title,inner):
        return f'<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>{html.escape(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body>{inner}</body></html>'
    # cover page
    z.writestr('OEBPS/cover.xhtml',xhtml('Cover','<div style="text-align:center"><img src="images/cover.jpg" alt="Cover of The Cooler and the Clock" style="max-width:100%;height:auto"/></div>'))
    z.write(HERE+'/cover.jpg','OEBPS/images/cover.jpg')
    for k in ALT: z.write(f'{FIG}/{k}.png',f'OEBPS/fig/{k}.png')
    items=['<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>','<item id="css" href="style.css" media-type="text/css"/>','<item id="coverimg" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>','<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>']
    items+= [f'<item id="img_{k}" href="fig/{k}.png" media-type="image/png"/>' for k in ALT]
    spine=['<itemref idref="cover" linear="no"/>']
    navli=[]
    for fid,title,inner in files:
        fn=f'{fid}.xhtml'; z.writestr('OEBPS/'+fn,xhtml(title,inner)); items.append(f'<item id="{fid}" href="{fn}" media-type="application/xhtml+xml"/>'); spine.append(f'<itemref idref="{fid}"/>')
    # nav
    lvl={h[0]:h[1] for h in HEADS}
    nl=[]
    for fid,title,_ in files:
        if fid=='front': continue
        nl.append(f'<li><a href="{fid}.xhtml">{html.escape(smart(title))}</a></li>')
    z.writestr('OEBPS/nav.xhtml',xhtml('Contents',f'<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>{"".join(nl)}</ol></nav>'))
    spine.insert(1,'<itemref idref="nav"/>')
    opf=f'<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">{uid}</dc:identifier><dc:title>{TITLE}: {html.escape(SUB)}</dc:title><dc:creator>{AUTHOR}</dc:creator><dc:language>en-US</dc:language><dc:publisher>Cold Ischemia Foundation</dc:publisher><dc:date>2026-10-09</dc:date><dc:subject>Kidney transplantation; Health policy; Lean Six Sigma</dc:subject><meta property="dcterms:modified">2026-10-09T00:00:00Z</meta></metadata><manifest>{"".join(items)}</manifest><spine>{"".join(spine)}</spine></package>'
    z.writestr('OEBPS/content.opf',opf); z.close(); print('EPUB written',len(files),'sections')

# =============== DOCX ===============
def build_docx():
    from docx import Document
    from docx.shared import Pt, Inches, RGBColor, Emu
    from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
    from docx.enum.style import WD_STYLE_TYPE
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    d=Document(); sec=d.sections[0]; sec.page_width=Inches(6); sec.page_height=Inches(9)
    sec.left_margin=sec.right_margin=Inches(0.85); sec.top_margin=Inches(0.85); sec.bottom_margin=Inches(0.9)
    st=d.styles; N=st['Normal']; N.font.name='Georgia'; N.font.size=Pt(11); N.element.rPr.rFonts.set(qn('w:eastAsia'),'Georgia')
    N.paragraph_format.space_after=Pt(6); N.paragraph_format.line_spacing=1.25; N.paragraph_format.first_line_indent=Inches(0.25)
    def mkstyle(name,base='Normal',size=11,bold=False,italic=False,color=None,align=None,before=0,after=6,indent0=True,font=None,keep=False):
        s=st.add_style(name,WD_STYLE_TYPE.PARAGRAPH); s.base_style=st[base]; s.font.size=Pt(size); s.font.bold=bold; s.font.italic=italic
        if color: s.font.color.rgb=RGBColor.from_string(color)
        if font: s.font.name=font; s.element.rPr.rFonts.set(qn('w:eastAsia'),font)
        if align is not None: s.paragraph_format.alignment=align
        s.paragraph_format.space_before=Pt(before); s.paragraph_format.space_after=Pt(after)
        if indent0: s.paragraph_format.first_line_indent=Inches(0)
        s.paragraph_format.keep_with_next=keep
        return s
    for nm,sz,aft,bef in (('Heading 1',24,12,0),('Heading 2',20,10,0),('Heading 3',13.5,4,12)):
        s=st[nm]; s.font.name='Georgia'; s.font.size=Pt(sz); s.font.bold=True; s.font.color.rgb=RGBColor(0x0f,0x27,0x42); s.element.rPr.rFonts.set(qn('w:ascii'),'Georgia'); s.element.rPr.rFonts.set(qn('w:hAnsi'),'Georgia')
        s.paragraph_format.space_before=Pt(bef); s.paragraph_format.space_after=Pt(aft); s.paragraph_format.first_line_indent=Inches(0); s.paragraph_format.keep_with_next=True
    mkstyle('Epigraph',italic=True,size=10.5,color='3A4756',align=WD_ALIGN_PARAGRAPH.LEFT,after=2)
    s=st['Epigraph']; s.paragraph_format.left_indent=Inches(0.45); s.paragraph_format.right_indent=Inches(0.3)
    mkstyle('EpigraphBy',size=9,color='6B7684',align=WD_ALIGN_PARAGRAPH.RIGHT,after=14)
    mkstyle('Caption Fig',size=9,italic=True,color='4A5563',align=WD_ALIGN_PARAGRAPH.LEFT,after=10)
    mkstyle('Note',size=10,align=WD_ALIGN_PARAGRAPH.LEFT,after=4)
    mkstyle('NoteTitle',size=10.5,bold=True,color='0F2742',align=WD_ALIGN_PARAGRAPH.LEFT,after=4)
    mkstyle('Body First',after=6,align=WD_ALIGN_PARAGRAPH.LEFT)
    mkstyle('Reference',size=9.5,align=WD_ALIGN_PARAGRAPH.LEFT,after=5)
    st['Reference'].paragraph_format.left_indent=Inches(0.3); st['Reference'].paragraph_format.first_line_indent=Inches(-0.3)
    mkstyle('Centered',align=WD_ALIGN_PARAGRAPH.CENTER,after=8)
    mkstyle('TOC Part',size=11,bold=True,align=WD_ALIGN_PARAGRAPH.LEFT,after=2,before=6); mkstyle('TOC Chapter',size=10.5,align=WD_ALIGN_PARAGRAPH.LEFT,after=1); st['TOC Chapter'].paragraph_format.left_indent=Inches(0.3)
    def shade(p,fill='F4EFE4',bar='C8902A'):
        pPr=p._p.get_or_add_pPr(); sh=OxmlElement('w:shd'); sh.set(qn('w:val'),'clear'); sh.set(qn('w:color'),'auto'); sh.set(qn('w:fill'),fill); pPr.append(sh)
        bd=OxmlElement('w:pBdr'); l=OxmlElement('w:left'); l.set(qn('w:val'),'single'); l.set(qn('w:sz'),'24'); l.set(qn('w:space'),'6'); l.set(qn('w:color'),bar); bd.append(l); pPr.append(bd)
        p.paragraph_format.left_indent=Inches(0.15); p.paragraph_format.right_indent=Inches(0.1)
    def add_runs(p,text):
        for t,f in inline_runs(text):
            r=p.add_run(t);
            if f=='b': r.bold=True
            if f=='i': r.italic=True
    bm_id=[100]
    def bookmark(p,name):
        bm_id[0]+=1; s=OxmlElement('w:bookmarkStart'); s.set(qn('w:id'),str(bm_id[0])); s.set(qn('w:name'),name); e=OxmlElement('w:bookmarkEnd'); e.set(qn('w:id'),str(bm_id[0]))
        p._p.insert(1,s); p._p.append(e)
    def link(p,text,anchor):
        h=OxmlElement('w:hyperlink'); h.set(qn('w:anchor'),anchor); r=OxmlElement('w:r'); rpr=OxmlElement('w:rPr'); c=OxmlElement('w:color'); c.set(qn('w:val'),'0F2742'); rpr.append(c); r.append(rpr); t=OxmlElement('w:t'); t.text=text; t.set(qn('xml:space'),'preserve'); r.append(t); h.append(r); p._p.append(h)
    def pagebreak(): d.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
    # cover
    pc=d.add_paragraph(style='Centered'); pc.paragraph_format.space_after=Pt(0); pc.add_run().add_picture(HERE+'/cover.jpg',width=Inches(4.3))
    hid=0; first=False; in_refs=False
    d.core_properties.title=f'{TITLE}: {SUB}'; d.core_properties.author=AUTHOR; d.core_properties.subject='Lean Six Sigma audit of the American kidney transplant system'
    for b in BL:
        t=b[0]
        if t=='special':
            tag,body=b[1],b[2]
            if tag=='TITLEPAGE':
                pagebreak()
                for _ in range(5): d.add_paragraph(style='Centered')
                p=d.add_paragraph(style='Centered'); r=p.add_run(TITLE.upper()); r.bold=True; r.font.size=Pt(30); r.font.color.rgb=RGBColor(0x0f,0x27,0x42)
                p=d.add_paragraph(style='Centered'); r=p.add_run(SUB); r.italic=True; r.font.size=Pt(13)
                d.add_paragraph(style='Centered'); p=d.add_paragraph(style='Centered'); r=p.add_run(AUTHOR.upper()); r.bold=True; r.font.size=Pt(16)
                p=d.add_paragraph(style='Centered'); r=p.add_run('Cold Ischemia Foundation'); r.font.size=Pt(10)
            elif tag=='COPYRIGHT':
                pagebreak()
                for c in COPY:
                    p=d.add_paragraph(style='Body First'); p.alignment=WD_ALIGN_PARAGRAPH.LEFT
                    for part in re.split(r'(<strong>.*?</strong>)',c):
                        if part.startswith('<strong>'): r=p.add_run(part[8:-9]); r.bold=True
                        elif part: p.add_run(part)
                    for r in p.runs: r.font.size=Pt(9)
            elif tag=='DEDICATION':
                pagebreak()
                for _ in range(6): d.add_paragraph(style='Centered')
                p=d.add_paragraph(style='Centered'); r=p.add_run(smart(' '.join(body))); r.italic=True; r.font.size=Pt(12)
            elif tag=='EPIGRAPH':
                pagebreak()
                for _ in range(6): d.add_paragraph(style='Centered')
                p=d.add_paragraph(style='Epigraph'); p.add_run(smart(body[0])); p=d.add_paragraph(style='EpigraphBy'); p.add_run(smart(body[1]) if len(body)>1 else '')
            elif tag=='TOC':
                pagebreak(); p=d.add_paragraph(style='Heading 1'); p.add_run('Contents'); bookmark(p,'toc')
                for hid_,lvl,txt in HEADS:
                    p=d.add_paragraph(style='TOC Part' if lvl==1 else 'TOC Chapter'); link(p,smart(txt),hid_)
            continue
        if t=='h1':
            hid+=1; kind=classify(b[1]); in_refs=b[1].startswith('Appendix C')
            pagebreak() if False else None
            p=d.add_paragraph(style='Heading 2' if kind=='chapter' else 'Heading 1'); p.paragraph_format.page_break_before=True
            if kind=='part': p.paragraph_format.space_before=Pt(150); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
            p.add_run(smart(b[1])); bookmark(p,f's{hid}'); first=True; continue
        if t=='h3':
            p=d.add_paragraph(style='Heading 3'); p.add_run(smart(b[1])); first=True; continue
        if t=='epi':
            p=d.add_paragraph(style='Epigraph'); p.add_run(smart(b[1])); p=d.add_paragraph(style='EpigraphBy'); p.add_run(smart(b[2])); continue
        if t=='fig':
            k=b[1]; p=d.add_paragraph(style='Centered'); p.paragraph_format.keep_with_next=True; r=p.add_run(); pic=r.add_picture(f'{FIG}/{k}.png',width=Inches(4.7))
            dp=pic._inline.docPr; dp.set('descr',ALT[k]); dp.set('title',ALT[k][:60])
            c=d.add_paragraph(style='Caption Fig'); add_runs(c,b[2]); continue
        if t=='note':
            if b[1]: p=d.add_paragraph(style='NoteTitle'); add_runs(p,b[1]); shade(p)
            for x in b[2]: p=d.add_paragraph(style='Note'); add_runs(p,x); shade(p)
            d.add_paragraph().paragraph_format.space_after=Pt(2); continue
        if t=='table':
            rows=b[1]; tb=d.add_table(rows=len(rows),cols=len(rows[0])); tb.style='Table Grid'; tb.autofit=True
            for i,row in enumerate(rows):
                for j,c in enumerate(row):
                    cell=tb.cell(i,j); cell.text=''; p=cell.paragraphs[0]; p.paragraph_format.first_line_indent=Inches(0); p.paragraph_format.space_after=Pt(2); p.alignment=WD_ALIGN_PARAGRAPH.LEFT
                    add_runs(p,c)
                    for r in p.runs:
                        r.font.size=Pt(8.5)
                        if i==0: r.bold=True; r.font.color.rgb=RGBColor(255,255,255)
                    if i==0:
                        tcPr=cell._tc.get_or_add_tcPr(); sh=OxmlElement('w:shd'); sh.set(qn('w:val'),'clear'); sh.set(qn('w:color'),'auto'); sh.set(qn('w:fill'),'0F2742'); tcPr.append(sh)
            d.add_paragraph().paragraph_format.space_after=Pt(4); continue
        if t=='p':
            if in_refs: p=d.add_paragraph(style='Reference')
            else: p=d.add_paragraph(style='Body First' if first else 'Normal')
            first=False; add_runs(p,b[1])

    ORDER_PPR=['pStyle','keepNext','keepLines','pageBreakBefore','framePr','widowControl','numPr','suppressLineNumbers','pBdr','shd','tabs','suppressAutoHyphens','kinsoku','wordWrap','overflowPunct','topLinePunct','autoSpaceDE','autoSpaceDN','bidi','adjustRightInd','snapToGrid','spacing','ind','contextualSpacing','mirrorIndents','suppressOverlap','jc','textDirection','textAlignment','textboxTightWrap','outlineLvl','divId','cnfStyle','rPr','sectPr','pPrChange']
    def local(el): return el.tag.split('}')[1]
    for ppr in list(d.element.body.iter(qn('w:pPr')))+[x for x in d.styles.element.iter(qn('w:pPr'))]:
        kids=list(ppr); kids_sorted=sorted(kids,key=lambda e:(ORDER_PPR.index(local(e)) if local(e) in ORDER_PPR else 99))
        if kids!=kids_sorted:
            for k in kids: ppr.remove(k)
            for k in kids_sorted: ppr.append(k)
    d.save(f'{OUT}/The-Cooler-and-the-Clock.docx'); print('DOCX written')

def wordcount():
    n=0
    for b in BL:
        if b[0] in ('p','h1','h3'): n+=len(re.findall(r"[A-Za-z0-9’'\-]+",b[1]))
        elif b[0]=='epi': n+=len(re.findall(r"[A-Za-z0-9’'\-]+",b[1]+' '+b[2]))
        elif b[0]=='note': n+=sum(len(re.findall(r"[A-Za-z0-9’'\-]+",x)) for x in [b[1]]+list(b[2]))
        elif b[0]=='table': n+=sum(len(re.findall(r"[A-Za-z0-9’'\-]+",c)) for r in b[1] for c in r)
    return n

if __name__=='__main__':
    which=sys.argv[2:] or ['docx','epub','pdf']
    print('WORDS',wordcount())
    if 'docx' in which: build_docx()
    if 'epub' in which: build_epub()
    if 'pdf' in which: build_pdf()
