import math
G='#a8761c';N='#0a1628';T='#17707a';R='#a23a46';P='#f8f4ea'
def _wrap(vb,body,cap,cls=''):
    return '<figure class="fig %s"><svg viewBox="%s" role="img" aria-label="%s" xmlns="http://www.w3.org/2000/svg">%s</svg><figcaption>%s</figcaption></figure>'%(cls,vb,cap.replace('"',''),body,cap)
def eco():
    W,H=760,520;cx,cy=W/2,H/2
    nodes=[('The recipient','',T),('Transplant program','surgeons, nurses, social work',N),('Independent donor advocate','required by federal policy',G),
           ('OPTN &amp; SRTR','rules and outcomes data',N),('HRSA &amp; CMS','oversight and certification',N),('Congress &amp; states','statutes, leave, tax credits',N),
           ('Payers','Medicare, private insurers',R),('Dialysis industry','a few large companies',R),('Paired-exchange registries','chains that start with a stranger',T),('Peers &amp; advocates','community and support',G)]
    s='<defs><radialGradient id="eg"><stop offset="0" stop-color="#e8b84a" stop-opacity=".35"/><stop offset="1" stop-color="#e8b84a" stop-opacity="0"/></radialGradient></defs><rect width="%d" height="%d" fill="#fffdf7" rx="6"/><circle cx="%d" cy="%d" r="150" fill="url(#eg)"/>'%(W,H,cx,cy)
    rx,ry=290,190
    pos=[]
    for i,(a,b,c) in enumerate(nodes):
        ang=-math.pi/2+i*2*math.pi/len(nodes)
        x=cx+rx*math.cos(ang);y=cy+ry*math.sin(ang);pos.append((x,y))
        s+='<line class="ln" x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.3" stroke-dasharray="4 4" opacity=".55"/>'%(cx,cy,x,y,c)
    for i,((a,b,c),(x,y)) in enumerate(zip(nodes,pos)):
        s+='<g class="nd" style="animation-delay:%.2fs"><rect x="%d" y="%d" width="148" height="%d" rx="8" fill="#fff" stroke="%s" stroke-width="1.6"/><text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="%s">%s</text>%s</g>'%(.1*i,x-74,y-22,44,c,x,y-3 if b else y+5,N,a,('<text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="10.5" fill="#6a6358">%s</text>'%(x,y+13,b)) if b else '')
    s+='<g class="nd"><circle cx="%d" cy="%d" r="66" fill="%s"/><text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="2" fill="#e8b84a">THE PERSON</text><text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#fff">WHO</text><text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#fff">GIVES</text></g>'%(cx,cy,N,cx,cy-14,cx,cy+8,cx,cy+30)
    return _wrap('0 0 %d %d'%(W,H),s,'Figure: the living-donor ecosystem. Ten actors surround the person who gives; the person with the most risk has the least institutional voice.')
def circle():
    W,H=700,460;cx,cy=350,230
    roles=[('The Anchor','attends with you'),('The Navigator','tracks paper &amp; money'),('The Steward','daily life'),('The Witness','tells you the truth'),('The Voice','speaks if you cannot')]
    s='<rect width="700" height="460" fill="#fffdf7" rx="6"/><circle cx="%d" cy="%d" r="155" fill="none" stroke="%s" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>'%(cx,cy,G)
    for i,(a,b) in enumerate(roles):
        ang=-math.pi/2+i*2*math.pi/5;x=cx+155*math.cos(ang);y=cy+155*math.sin(ang)
        s+='<g class="nd" style="animation-delay:%.2fs"><circle cx="%d" cy="%d" r="48" fill="#fff" stroke="%s" stroke-width="2"/><text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="%s">%s</text><text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="10.5" fill="#6a6358">%s</text></g>'%(.15*i,x,y,[G,T,G,T,G][i],x,y-2,N,a,x,y+14,b)
    s+='<g class="nd"><circle cx="%d" cy="%d" r="52" fill="%s"/><text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" fill="#fff">You</text></g>'%(cx,cy,N,cx,cy+9)
    s+='<text x="350" y="448" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="14" fill="#6a6358">Trust &middot; Transparency &middot; Reciprocity &middot; Exit</text>'
    return _wrap('0 0 %d %d'%(W,H),s,'Figure: the circle around a donor. Five roles, four rules.')
def bars(title,rows,cap,unit_w=420,fmt='{:,}',colors=None,vb_h=None,suffix=''):
    mx=max(v for _,v in rows);h=44*len(rows)+60;W=760
    s='<rect width="%d" height="%d" fill="#fffdf7" rx="6"/><text x="24" y="32" font-family="Georgia,serif" font-weight="700" font-size="15" fill="%s">%s</text>'%(W,h,N,title)
    for i,(l,v) in enumerate(rows):
        y=56+i*44;w=max(4,v/mx*unit_w);c=(colors or [T,G,N,R,'#5b7a2e'])[i%5]
        s+='<text x="24" y="%d" font-family="Georgia,serif" font-size="13" fill="%s">%s</text><rect class="bar" x="250" y="%d" width="%.1f" height="22" rx="3" fill="%s" style="animation-delay:%.2fs"/><text x="%.1f" y="%d" font-family="Georgia,serif" font-weight="700" font-size="13" fill="%s">%s%s</text>'%(y+16,N,l,y,w,c,.12*i,258+w,y+16,N,fmt.format(v),suffix)
    return _wrap('0 0 %d %d'%(W,h),s,cap)
def journey():
    ph=[('1','Decide','your time, your pace',G),('2','Evaluate','tests, advocate, social work. You may stop at any point',T),('3','Surgery','hospital stay, typically days',N),('4','Recover','weeks; work return varies; know your leave rights',T),('5','Follow up','federal reporting for two years; yearly checks advised for life',R)]
    W,H=780,250;s='<rect width="780" height="250" fill="#fffdf7" rx="6"/><line x1="40" y1="82" x2="740" y2="82" stroke="%s" stroke-width="3" stroke-linecap="round" opacity=".5"/>'%G
    for i,(n,a,b,c) in enumerate(ph):
        x=80+i*155
        words=b.split(' ');lines=[];cur=''
        for w in words:
            if len(cur+' '+w)>20:lines.append(cur);cur=w
            else:cur=(cur+' '+w).strip()
        lines.append(cur)
        s+='<g class="nd" style="animation-delay:%.2fs"><circle cx="%d" cy="82" r="26" fill="%s"/><text x="%d" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#fff">%s</text><text x="%d" y="140" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="%s">%s</text>'%(.15*i,x,c,x,n,x,N,a)
        for j,l in enumerate(lines):s+='<text x="%d" y="%d" text-anchor="middle" font-family="Georgia,serif" font-size="11.5" fill="#6a6358">%s</text>'%(x,162+j*15,l)
        s+='</g>'
    s+='<text x="390" y="236" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="13" fill="%s">Timelines vary by program. Ask yours for its own.</text>'%G
    return _wrap('0 0 %d %d'%(W,H),s,'Figure: the living-donor journey, from deciding to long-term follow-up.')
def orn():
    return '<svg class="orn" viewBox="0 0 120 60" aria-hidden="true"><circle cx="45" cy="30" r="24" fill="none" stroke="#c8902a" stroke-width="1.5"/><circle cx="75" cy="30" r="24" fill="none" stroke="#8fd8ff" stroke-width="1.5"/></svg>'
def wait():
    return bars('U.S. transplant system, 2025-2026 snapshot (people / procedures)',[('On the waiting list',109817),('Waiting for a kidney',95500),('All transplants, 2025',49064),('Living donors, 2025',7237),('Living-donor kidney transplants',6521)],'Figure: the arithmetic of waiting. Source: OPTN; verify current figures.')
def risk():
    return bars('Risk per 10,000 donors (see notes for sources and limits)',[('Death around surgery (about)',3.1),('Kidney failure, donors (15 yrs)',31),('Kidney failure, non-donors (15 yrs)',4)],'Figure: absolute risks are small and individual; ask the program for yours. Sources: Segev 2010; Muzaale 2014 (JAMA).',fmt='{:g}',colors=[N,R,T],unit_w=400)
FIGS={'eco':eco,'circle':circle,'wait':wait,'risk':risk,'journey':journey}
