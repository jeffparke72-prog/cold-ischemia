import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
TEAL='#0e8fb0'; AMBER='#c96a14'; INK='#1c2b3a'; MUTE='#5f6b78'; SAND='#f6efe3'; GREY='#c9d1da'
plt.rcParams.update({'text.parse_math':False,'font.family':'DejaVu Sans','font.size':11,'axes.edgecolor':'#9aa5b1','axes.labelcolor':INK,'text.color':INK,'xtick.color':MUTE,'ytick.color':MUTE})
OUT='/home/user/cold-ischemia/_paper4/fig/'
def save(fig,n): fig.savefig(OUT+n+'.png',dpi=220,bbox_inches='tight',facecolor='white'); plt.close(fig)
def clean(ax,left=True):
    for s in ('top','right'): ax.spines[s].set_visible(False)
    if not left: ax.spines['left'].set_visible(False)
def hbars(name,title,labels,vals,colors,fmt,note=None,xmax=None,figsize=(7.4,2.9)):
    fig,ax=plt.subplots(figsize=figsize); y=list(range(len(vals)))[::-1]
    b=ax.barh(y,vals,color=colors,height=.52)
    for r,v in zip(b,vals): ax.text(v+max(vals)*.015,r.get_y()+r.get_height()/2,fmt(v),va='center',fontweight='bold')
    ax.set_yticks(y,labels); ax.set_xlim(0,xmax or max(vals)*1.22); ax.set_xticks([]); clean(ax,False); ax.tick_params(left=False)
    ax.set_title(title,loc='left',fontweight='bold',fontsize=12)
    if note: fig.text(0.02,-0.04,note,fontsize=8,color=MUTE)
    save(fig,name)
# ledger: unused vs removals
hbars('ledger','Kidneys unused vs. people removed from the list, 2024',['Kidneys recovered\nbut not used (estimate)','Candidates removed:\ndied or too sick'],[8800,8644],[AMBER,TEAL],lambda v:f'{v:,.0f}',note='Unused kidneys: author arithmetic from registry rates (see text). Removals: OPTN/SRTR 2024 (3,743 died + 4,901 too sick). Not a one-for-one match.',xmax=11000)
# SIA
fig,ax=plt.subplots(figsize=(7.4,3.2)); import numpy as np
x=np.arange(2); w=.34
ax.bar(x-w/2,[26.9,33.9],w,color=AMBER,label='Before'); ax.bar(x+w/2,[22.1,44.4],w,color=TEAL,label='After')
for i,(a,b) in enumerate([(26.9,22.1),(33.9,44.4)]):
    ax.text(i-w/2,a+1,f'{a}%',ha='center',fontweight='bold'); ax.text(i+w/2,b+1,f'{b}%',ha='center',fontweight='bold')
ax.set_xticks(x,['14 programs under a\nSystems Improvement Agreement','28 matched comparison\nprograms']); ax.set_yticks([]); clean(ax,False); ax.tick_params(left=False); ax.set_ylim(0,52); ax.legend(frameon=False,loc='upper left')
ax.set_title('Share of kidney offers accepted, two years before and after',loc='left',fontweight='bold',fontsize=12)
fig.text(0.02,-0.14,'Bowring et al., American Journal of Transplantation, 2018; SRTR data 2006 to 2015.',fontsize=8,color=MUTE); save(fig,'sia')
# memo: recovery per day
hbars('memo','Kidneys recovered per day around the August 2025 memorandum',['Before the memo','After the memo'],[85,76],[TEAL,AMBER],lambda v:f'about {v}',note='Analysis summarized by an advocacy group for donation science; early data, short window. See Chapter 5.',xmax=105)
# pump
fig,(a,b)=plt.subplots(1,2,figsize=(7.4,3.1))
r=a.bar(['Cold storage\n(ice)','Machine\nperfusion'],[73,79],color=[GREY,TEAL],width=.55)
for x_,v in zip(r,[73,79]): a.text(x_.get_x()+x_.get_width()/2,v+1.5,f'{v}%',ha='center',fontweight='bold')
a.set_ylim(0,100); a.set_yticks([]); clean(a,False); a.tick_params(left=False); a.set_title('Kidneys still working\nat 10 years',loc='left',fontsize=10.5,fontweight='bold')
r=b.bar(['Pumped','Not pumped'],[39,61],color=[TEAL,GREY],width=.55)
for x_,v in zip(r,[39,61]): b.text(x_.get_x()+x_.get_width()/2,v+1.5,f'{v}%',ha='center',fontweight='bold')
b.set_ylim(0,100); b.set_yticks([]); clean(b,False); b.tick_params(left=False); b.set_title('US deceased-donor kidneys\nby preservation method',loc='left',fontsize=10.5,fontweight='bold')
fig.text(0.02,-0.12,'Left: 10-year follow-up of the Machine Preservation Trial (investigators\' summary). Right: OPTN-based analysis, data through 2023.',fontsize=8,color=MUTE); save(fig,'pump')
# hdf
hbars('hdf','Deaths over a median 30 months, CONVINCE trial',['Standard high-flux\nhemodialysis','High-dose\nhemodiafiltration'],[21.9,17.3],[GREY,TEAL],lambda v:f'{v}%',note='Blankestijn et al., New England Journal of Medicine, 2023; 1,360 patients; hazard ratio 0.77.',xmax=28)
# duopoly
hbars('duopoly','Share of US dialysis held by the two largest companies',['2005','2019'],[59.1,77.1],[GREY,AMBER],lambda v:f'{v}%',note='Peer-reviewed market-structure analysis; other estimates range from about 72% to 80%.',xmax=95,figsize=(7.4,2.4))
# cost
hbars('cost','Annual Medicare cost per person, 2021',['In-center\nhemodialysis','Peritoneal\ndialysis','Functioning\ntransplant'],[99325,86976,43913],[AMBER,AMBER,TEAL],lambda v:f'${v:,.0f}',note='USRDS 2023 Annual Data Report; traditional Medicare.',xmax=125000)

import textwrap
def wrapitems(body,w):
    items=[x for x in body.split('    ') if x]; lines=[]; cur=''
    for it in items:
        if cur and len(cur)+len(it)+4>w: lines.append(cur); cur=it
        else: cur=(cur+'    '+it) if cur else it
    lines.append(cur); return '\n'.join(lines)
def rows(name,items,figsize,tabw=27,fs=8.6,wrapw=62):
    fig,ax=plt.subplots(figsize=figsize); ax.axis('off'); n=len(items); ax.set_xlim(0,100); ax.set_ylim(0,n*14)
    for i,(c,tab1,tab2,body) in enumerate(items):
        y=n*14-(i+1)*14+1
        ax.add_patch(FancyBboxPatch((0.5,y),tabw,12,boxstyle='round,pad=0.15,rounding_size=1.0',fc=c,ec='none'))
        ax.text(0.5+tabw/2,y+8.3,tab1,ha='center',color='white',fontsize=7.8,fontweight='bold')
        ax.text(0.5+tabw/2,y+4.6,tab2,ha='center',va='center',color='white',fontsize=9.2,fontweight='bold')
        ax.add_patch(FancyBboxPatch((tabw+2.5,y),97-tabw,12,boxstyle='round,pad=0.15,rounding_size=1.0',fc=SAND,ec=c,lw=1.2))
        ax.text(tabw+4,y+6,wrapitems(body,wrapw),va='center',fontsize=fs,color=INK,linespacing=1.5)
    save(fig,name)
rows('map',[
 (TEAL,'PART ONE','The Throwaway','What is happening:  1  The Number    2  Anatomy of a No    3  The Clock Has No Owner'),
 (AMBER,'PART TWO','The Scoreboard','Why it happens:  4  When a Measure Becomes a Target    5  Forty-Eight Days    6  The Procurement Problem    7  The Business of the Wait'),
 (TEAL,'PART THREE','The Shelf','What was left unused:  8  The Other Door    9  The Pump    10  The Worm, the Cow, and the Blood That Wasn\'t    11  The Pig, the Cell, and the Waiting Room    12  The Fast Idea and the Slow Idea'),
 (AMBER,'PART FOUR','The Way Out','What must be done:  13  Fifteen Moves    14  The Ninety Days    15  The Last Hour')],(7.6,4.8))
rows('moves',[
 (TEAL,'MOVES 1 TO 3','Pay for what works','1 Pay for the pump and the donor    2 Make early referral the default    3 Fund the trials'),
 (AMBER,'MOVES 4 TO 8','Make the clock and\nthe list visible','4 Publish the clock    5 Replace the memo with a pathway    6 Guarantee perfusion    7 Take the second look    8 Give every candidate an offer ledger'),
 (TEAL,'MOVES 9 TO 11','Fix the scoreboard','9 Count the shadow    10 Risk-adjust for time and perfusion    11 Put an expiry date on every rule'),
 (AMBER,'MOVES 12 AND 13','Front door and\nshow the work','12 Safety officers and a public pause log    13 Show the declines'),
 (TEAL,'MOVES 14 AND 15','The industry and\nthe voice','14 Open the books on dialysis    15 Seat the patients')],(7.6,5.0))
