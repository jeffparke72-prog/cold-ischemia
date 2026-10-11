import math
W,H=1950,2700
bean="M12 1C6 1 2 5 2 11C2 17 6 23 12 23C17 23 20 19 19 15C18.4 12.6 16 12.5 16 11C16 9.5 18.4 9.4 19 7C20 3 17 1 12 1Z"
cx,cy,R=975,1400,520
ticks=[]
for i in range(60):
    a=math.radians(i*6-90); major=i%5==0
    r1=R-(40 if major else 22); r2=R-4
    ticks.append(f'<line x1="{cx+r1*math.cos(a):.1f}" y1="{cy+r1*math.sin(a):.1f}" x2="{cx+r2*math.cos(a):.1f}" y2="{cy+r2*math.sin(a):.1f}" stroke="#f2b84b" stroke-width="{6 if major else 2.5}" stroke-linecap="round" opacity="{.95 if major else .5}"/>')
def hand(deg,l,w):
    a=math.radians(deg-90); return f'<line x1="{cx}" y1="{cy}" x2="{cx+l*math.cos(a):.1f}" y2="{cy+l*math.sin(a):.1f}" stroke="#f7efe0" stroke-width="{w}" stroke-linecap="round" opacity=".85"/>'
hands=hand(11*30+21,250,14)+hand(252,400,8)
# pictogram: 100 kidneys, 4 rows x 25, last 29 coral (row-major)
pic=[]
cols,rows=25,4; sx,sy=69,66; x0=(W-cols*sx)//2+8; y0=2010
for i in range(100):
    r,c=divmod(i,cols); x=x0+c*sx; y=y0+r*sy
    col='#ff6b57' if i>=71 else '#2b5f86'
    if i==70: col='url(#part)'
    pic.append(f'<path d="{bean}" transform="translate({x} {y}) scale(2.1)" fill="{col}"/>')
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:PF;src:url(../../fonts/playfairdisplay-900-normal.woff2);font-weight:900}}
@font-face{{font-family:PFI;src:url(../../fonts/playfairdisplay-400-italic.woff2);font-style:italic}}
@font-face{{font-family:CP;src:url(../../fonts/crimsonpro-400-italic.woff2);font-style:italic}}
@font-face{{font-family:BN;src:url(../../fonts/bebasneue-400-normal.woff2)}}
html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#07142a}}
</style></head><body>
<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e2a52"/><stop offset=".55" stop-color="#0a1f40"/><stop offset="1" stop-color="#06101f"/></linearGradient>
<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3fe0d4" stop-opacity=".55"/><stop offset=".45" stop-color="#1fb5b0" stop-opacity=".22"/><stop offset="1" stop-color="#1fb5b0" stop-opacity="0"/></radialGradient>
<radialGradient id="kid" cx="35%" cy="28%" r="85%"><stop offset="0" stop-color="#ff9a86"/><stop offset=".4" stop-color="#e8374a"/><stop offset=".8" stop-color="#a01a3c"/><stop offset="1" stop-color="#6a0f2c"/></radialGradient>
<linearGradient id="cool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d3c7"/><stop offset="1" stop-color="#128e9c"/></linearGradient>
<linearGradient id="cooldk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#169aa8"/><stop offset="1" stop-color="#0b6477"/></linearGradient>
<linearGradient id="lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9af2ea"/><stop offset="1" stop-color="#3cc8bf"/></linearGradient>
<linearGradient id="ttl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9dcc3"/></linearGradient>
<linearGradient id="part" x1="0" y1="0" x2="1" y2="0"><stop offset=".3" stop-color="#ff6b57"/><stop offset=".3" stop-color="#2b5f86"/></linearGradient>
<filter id="b40"><feGaussianBlur stdDeviation="40"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity=".5"/></filter>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<circle cx="{cx}" cy="{cy}" r="760" fill="url(#halo)"/>
<!-- frame -->
<rect x="64" y="64" width="{W-128}" height="{H-128}" fill="none" stroke="#f2b84b" stroke-width="4" opacity=".9"/>
<rect x="88" y="88" width="{W-176}" height="{H-176}" fill="none" stroke="#f2b84b" stroke-width="1.5" opacity=".55"/>
<!-- header -->
<line x1="200" y1="176" x2="520" y2="176" stroke="#f2b84b" stroke-width="3"/><line x1="{W-520}" y1="176" x2="{W-200}" y2="176" stroke="#f2b84b" stroke-width="3"/>
<text x="975" y="205" text-anchor="middle" font-family="BN" font-size="52" letter-spacing="14" fill="#f2b84b">A DATA-DRIVEN INVESTIGATION</text>
<text x="975" y="400" text-anchor="middle" font-family="PF" font-weight="900" font-size="150" letter-spacing="30" fill="#f7efe0">THE</text>
<text x="975" y="660" text-anchor="middle" font-family="PF" font-weight="900" font-size="305" letter-spacing="8" fill="url(#ttl)">DISCARD</text>
<rect x="760" y="705" width="430" height="6" fill="#ff6b57"/>
<text x="975" y="790" text-anchor="middle" font-family="CP" font-size="64" fill="#e6edf5">Why America throws away the kidneys it begs for,</text>
<text x="975" y="862" text-anchor="middle" font-family="CP" font-size="64" fill="#e6edf5">and the inventions waiting to stop it</text>
<g transform="translate(975 945) scale(.84) translate(-975 -880)">
<!-- clock -->
<circle cx="{cx}" cy="{cy}" r="{R}" fill="#0a1f40" fill-opacity=".35" stroke="#f2b84b" stroke-width="7"/>
<circle cx="{cx}" cy="{cy}" r="{R-70}" fill="none" stroke="#f2b84b" stroke-width="1.5" opacity=".4"/>
{''.join(ticks)}
{hands}
<!-- light shaft -->
<polygon points="790,1800 1160,1800 1260,1080 690,1080" fill="#9af2ea" opacity=".16" filter="url(#b6)"/>
<!-- kidney -->
<g filter="url(#sh)" transform="translate(790 1135) scale(.74) rotate(-8 245 390)">
<path d="M340 360 C440 330 500 260 490 170" stroke="#c4152f" stroke-width="58" fill="none" stroke-linecap="round"/>
<path d="M340 360 C440 330 500 260 490 170" stroke="#ff7a8a" stroke-width="12" fill="none" stroke-linecap="round" opacity=".55" transform="translate(-10 -8)"/>
<path d="M340 395 C480 400 560 330 580 230" stroke="#1f7bd8" stroke-width="50" fill="none" stroke-linecap="round"/>
<path d="M340 395 C480 400 560 330 580 230" stroke="#8fd0ff" stroke-width="11" fill="none" stroke-linecap="round" opacity=".55" transform="translate(-8 -8)"/>
<path d="M334 480 C420 500 480 590 470 700" stroke="#f2b84b" stroke-width="30" fill="none" stroke-linecap="round"/>
<path d="M250 10 C120 10 20 150 20 390 C20 630 120 770 250 770 C350 770 430 700 420 610 C412 540 336 510 336 450 C336 420 336 360 336 330 C336 270 412 240 420 170 C430 80 350 10 250 10 Z" fill="url(#kid)"/>
<g fill="none" stroke="#5a0a2a" stroke-linecap="round" opacity=".32"><path d="M300 40 C200 120 150 260 170 420" stroke-width="7"/><path d="M280 90 C230 200 240 330 260 450" stroke-width="5"/><path d="M200 650 C150 560 120 460 130 360" stroke-width="6"/><path d="M330 120 C380 190 380 270 350 330" stroke-width="5"/></g>
<path d="M120 200 C100 300 110 420 150 520" stroke="#ffd7cc" stroke-width="32" fill="none" stroke-linecap="round" opacity=".45" filter="url(#b6)"/>
<ellipse cx="180" cy="130" rx="80" ry="40" transform="rotate(-38 180 130)" fill="#fff" opacity=".42" filter="url(#b6)"/>
</g>
<!-- cooler -->
<g filter="url(#sh)">
<polygon points="600,1690 1350,1690 1420,1560 530,1560" fill="url(#lid)"/>
<path d="M540 1700 H1410 L1350 2000 Q1345 2020 1325 2020 H625 Q605 2020 600 2000 Z" fill="url(#cool)"/>
<path d="M540 1700 H1410 V1745 H540 Z" fill="#7beee2"/>
<path d="M590 1870 H1360 V1885 H590 Z" fill="#0b6477" opacity=".45"/>
<rect x="860" y="1905" width="230" height="64" rx="32" fill="#0b6477" opacity=".85"/>
<g fill="#e4fbff" opacity=".92"><rect x="660" y="1672" width="64" height="64" rx="10" transform="rotate(10 692 1704)"/><rect x="750" y="1684" width="52" height="52" rx="9" transform="rotate(-8 776 1710)"/><rect x="1130" y="1676" width="66" height="66" rx="10" transform="rotate(-12 1163 1709)"/><rect x="1225" y="1688" width="52" height="52" rx="9" transform="rotate(8 1251 1714)"/></g>
</g>
</g>
<!-- pictogram -->
<text x="975" y="1982" text-anchor="middle" font-family="BN" font-size="40" letter-spacing="10" fill="#8fb4d6">EVERY 100 KIDNEYS DONATED IN THE UNITED STATES, 2024</text>
{''.join(pic)}
<text x="975" y="2372" text-anchor="middle" font-family="BN" font-size="104" letter-spacing="9" fill="#ff6b57">29 WENT UNUSED</text>
<text x="975" y="2428" text-anchor="middle" font-family="CP" font-size="40" fill="#8fb4d6">Source: OPTN/SRTR 2024 annual data report</text>
<line x1="200" y1="2503" x2="560" y2="2503" stroke="#f2b84b" stroke-width="3"/><line x1="{W-560}" y1="2503" x2="{W-200}" y2="2503" stroke="#f2b84b" stroke-width="3"/>
<text x="975" y="2542" text-anchor="middle" font-family="BN" font-size="108" letter-spacing="26" fill="#f7efe0">JEFF PARKE</text>
</svg></body></html>'''
open('cover6.html','w').write(html)
