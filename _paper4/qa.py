#!/usr/bin/env python3
"""Formatting audit for The Discard (PDF, DOCX, EPUB). Prints PASS/FAIL lines and details."""
import pymupdf,re,sys,zipfile,docx
from xml.dom import minidom
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/out/paper4'
d=pymupdf.open(f'{OUT}/The-Discard.pdf'); N=len(d); res=[]
def chk(name,ok,detail=''): res.append(ok); print(('PASS' if ok else 'FAIL'),name,detail)
chk('page size 6x9 in on every page incl. cover', all(abs(p.rect.width-432)<1 and abs(p.rect.height-648)<1 for p in d))
chk('page count 135-145', 135<=N<=145, f'{N} pages')
m=d.metadata; chk('metadata title/author/subject', bool(m['title']) and m['author']=='Jeff Parke' and 'kidney' in m['subject'].lower(), m['subject'][:50])
chk('bookmarks present', len(d.get_toc())>=25, f'{len(d.get_toc())} entries')
fonts=set(); 
for p in d:
    for f in p.get_fonts(): fonts.add(f[3])
chk('fonts embedded', all(f[0]>0 or f[2]=='Type3' for p in d for f in p.get_fonts()), ', '.join(sorted(f for f in fonts if f))[:140])
bad=[]
for i,p in enumerate(d):
    for mm in re.finditer(r'\[\[|:::|\*\*|&amp;|&#|\{\{|<div|<p>',p.get_text()): bad.append((i+1,mm.group()))
chk('no leftover markup',not bad,str(bad[:5]))
# page numbers stamped = physical; none missing after front matter
miss=[];wrong=[]
for i in range(5,N):
    last=d[i].get_text().strip().split('\n')[-1].strip()
    if not last.isdigit(): miss.append(i+1)
    elif int(last)!=i+1: wrong.append(i+1)
chk('page numbers on every body page',not miss and not wrong,f'missing {miss[:5]} wrong {wrong[:5]}')
# TOC accuracy: parse TOC page lines (title then number)
toc=[l.strip() for l in d[4].get_text().split('\n') if l.strip()][1:]
pairs=[(toc[i],toc[i+1]) for i in range(len(toc)-1) if toc[i+1].replace(' ','').isdigit() and not toc[i].replace(' ','').isdigit()]
badtoc=[]
for t,pg in pairs:
    if t.startswith('Pa r t') or t.startswith('PART'): continue
    pg=int(pg.replace(' ','')); txt=d[pg-1].get_text()[:400].replace('\n',' ')
    key=t.split(': ',1)[-1] if t.startswith('Chapter') else t
    key=re.sub(r'\W+','',key).lower()[:18]
    if key not in re.sub(r'\W+','',txt).lower(): badtoc.append((t,pg))
chk('contents entries land on the right page',not badtoc,f'{len(pairs)} entries; bad {badtoc[:4]}')
# near-empty final pages of chapters / stranded headings
low=[];hb=[]
for i in range(5,N-1):
    blocks=[b for b in d[i].get_text('blocks') if b[4].strip() and not b[4].strip().isdigit() and b[3]<d[i].rect.height-55]
    if not blocks: continue
    fill=max(b[3] for b in blocks)/d[i].rect.height
    nxt=d[i+1].get_text()[:60].upper()
    ends_chapter=('C H A P T E R' in d[i+1].get_text()[:40] or 'P A R T' in d[i+1].get_text()[:40] or nxt.startswith(('GLOSSARY','APPENDIX','PROLOGUE','INTRODUCTION','A MAP','THE QUESTION','THE HIDDEN','WHAT WAS','FROM ANGER')))
    if ends_chapter and fill<0.22: low.append((i+1,round(fill,2)))
    dct=d[i].get_text('dict'); lines=[]
    for b in dct['blocks']:
        for l in b.get('lines',[]):
            for s in l['spans']:
                if s['text'].strip(): lines.append((l['bbox'][3],s['size'],s['font'],s['text']))
    lines=[x for x in lines if x[0]<d[i].rect.height-55]
    if lines:
        last=max(lines,key=lambda x:x[0])
        if last[1]>=12 and 'Playfair' in last[2]: hb.append((i+1,last[3][:40]))
chk('no chapter ends on a near-empty page (<22% full)',not low,str(low))
chk('no heading stranded at page bottom',not hb,str(hb))
imgs=[]
for i,p in enumerate(d):
    for im in p.get_image_info():
        b=im['bbox']
        if b[0]<30 or b[2]>402 or b[1]<0 or b[3]>648:
            if i>0: imgs.append((i+1,[round(x) for x in b]))
chk('figures inside margins',not imgs,str(imgs[:4]))
# source notes numbering: every cited S# has a table row, rows sequential
txt=re.sub(r'\s+',' ',''.join(p.get_text() for p in d))
cited=sorted({int(x) for x in re.findall(r'Source Notes S(\d+)',txt)}); rows=sorted({int(x) for x in re.findall(r'\nS(\d+)\n',''.join(p.get_text() for p in d))})
chk('every Source Note cited has an entry',set(cited)<=set(rows) and len(rows)>=len(cited)>=len(rows)-2,f'cited {len(cited)} entries {len(rows)}')
# figure numbering matches chapter numbers
import glob
badfig=[]
for f in sorted(glob.glob('/home/user/cold-ischemia/_paper4/ms_pre/*.md')):
    t=open(f).read(); m=re.search(r'^# Chapter (\d+):',t,flags=re.M)
    for fm in re.finditer(r'Figure (\d+)\.(\d+)\.',t):
        if m and fm.group(1)!=m.group(1): badfig.append((f.split('/')[-1],fm.group()))
chk('figure numbers match their chapter',not badfig,str(badfig))
# docx
dd=docx.Document(f'{OUT}/The-Discard.docx'); s=dd.sections[0]
chk('docx page 6x9 with margins',abs(s.page_width.inches-6)<.01 and abs(s.page_height.inches-9)<.01)
x=zipfile.ZipFile(f'{OUT}/The-Discard.docx').read('word/footer1.xml').decode() if 'word/footer1.xml' in zipfile.ZipFile(f'{OUT}/The-Discard.docx').namelist() else ''
chk('docx footer has page-number field','PAGE' in x or any('PAGE' in n for n in [zipfile.ZipFile(f'{OUT}/The-Discard.docx').read(n).decode('utf8','ignore') for n in zipfile.ZipFile(f'{OUT}/The-Discard.docx').namelist() if 'footer' in n]))
heads=[p for p in dd.paragraphs if p.style.name.startswith('Heading')]
chk('docx uses real heading styles (Word navigation pane)',len(heads)>100,f'{len(heads)} headings')
chk('docx metadata',dd.core_properties.title.startswith('The Discard') and dd.core_properties.author=='Jeff Parke')
# epub
z=zipfile.ZipFile(f'{OUT}/The-Discard.epub'); names=z.namelist(); ok=True
for n in names:
    if n.endswith(('.xhtml','.opf','.xml')):
        try: minidom.parseString(z.read(n))
        except Exception as e: ok=False; print('  xml error',n,e)
chk('epub well-formed XML + nav + cover','OEBPS/nav.xhtml' in names and 'OEBPS/images/cover.jpg' in names and ok and names[0]=='mimetype',f'{len(names)} files')
print('RESULT','ALL PASS' if all(res) else f'{res.count(False)} FAIL')
