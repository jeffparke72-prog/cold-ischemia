import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch, Polygon
import numpy as np, textwrap
NAVY='#0f2742'; BLUE='#2b6cb0'; ICE='#9ad0f5'; GOLD='#c8902a'; RED='#a8323c'; GRAY='#5b6572'; LIGHT='#eef3f8'; GREEN='#2f7d5b'
plt.rcParams.update({'text.parse_math':False,'font.family':'DejaVu Sans','font.size':11,'axes.edgecolor':GRAY,'axes.labelcolor':NAVY,'text.color':NAVY,'xtick.color':NAVY,'ytick.color':NAVY})
OUT='/home/user/cold-ischemia/_paper/fig/'
def save(fig,name): fig.savefig(OUT+name+'.png',dpi=220,bbox_inches='tight',facecolor='white'); plt.close(fig)
def wrap(s,w): return '\n'.join(textwrap.wrap(s,w))
def box(ax,x,y,w,h,txt,fc=LIGHT,ec=BLUE,fs=9,bold=False,tc=NAVY,lw=1.4,wrapw=None):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.02,rounding_size=0.06',fc=fc,ec=ec,lw=lw))
    if wrapw: txt=wrap(txt,wrapw)
    ax.text(x+w/2,y+h/2,txt,ha='center',va='center',fontsize=fs,fontweight='bold' if bold else 'normal',color=tc)

# 1 removals
fig,ax=plt.subplots(figsize=(7.2,4.0)); yrs=['2020','2021','2022','2023']; died=[4891,5032,4448,3803]; sick=[3814,3920,4396,4672]; x=np.arange(4); w=.36
b1=ax.bar(x-w/2,died,w,color=NAVY,label='Died while waiting'); b2=ax.bar(x+w/2,sick,w,color=GOLD,label='Removed as too sick')
for b in list(b1)+list(b2): ax.text(b.get_x()+b.get_width()/2,b.get_height()+60,f'{int(b.get_height()):,}',ha='center',fontsize=8.5)
ax.set_xticks(x,yrs); ax.set_ylim(0,6400); ax.set_ylabel('Kidney candidates removed'); ax.legend(frameon=False,loc='upper center',ncol=2); ax.spines[['top','right']].set_visible(False)
ax.set_title('Deaths fell while "too sick" removals rose',loc='left',fontweight='bold',fontsize=12); save(fig,'removals')

# 2 voc tree
fig,ax=plt.subplots(figsize=(8,5)); ax.set_xlim(0,10); ax.set_ylim(0,7); ax.axis('off')
box(ax,0.1,2.7,2.1,1.6,'"I want to live, and to be able to afford living."',fc=NAVY,ec=NAVY,tc='white',fs=8.6,bold=True,wrapw=17)
br=[('Access','Informed, referred, evaluated, listed'),('Timeliness','Offer before health declines'),('Organ quality','Cold ischemia, delayed graft function, graft life'),('Affordability','Surgery and lifelong medication'),('Trust','Clean, fair, honest process'),('Understanding','Options in plain language')]
ys=np.linspace(6.0,0.4,6)
for (h,m),y in zip(br,ys):
    ax.add_patch(FancyArrowPatch((2.2,3.5),(3.3,y+0.3),arrowstyle='-',color=GRAY,lw=1.2))
    box(ax,3.3,y,1.9,0.7,h,fc=ICE,ec=BLUE,fs=9,bold=True)
    box(ax,5.5,y,4.4,0.7,m,fc=LIGHT,ec=GRAY,fs=8.4,wrapw=44)
ax.text(0.1,6.9,'Voice of the customer  →  critical-to-quality requirements',fontsize=10.5,fontweight='bold'); save(fig,'voc')

# 3 sipoc
fig,ax=plt.subplots(figsize=(9,5.2)); ax.set_xlim(0,10); ax.set_ylim(0,6); ax.axis('off')
cols=[('SUPPLIERS',['Dialysis facilities and nephrologists','Donor hospitals and ICUs','Donor families','Living donors','55 procurement organizations','Network board, contractors','HRSA and CMS']),
('INPUTS',['Patients and their records','Organs and donor data','Offers and decisions','Policies and rules','Payments']),
('PROCESS',['1 Referral','2 Evaluation','3 Listing','4 Donor identification','5 Recovery','6 Allocation and offer','7 Acceptance','8 Transport and preservation','9 Surgery','10 Follow-up and medication']),
('OUTPUTS',['Transplants','Graft survival','Patient survival','Public data and reports']),
('CUSTOMERS',['Patients','Care partners','Donor families','Living donors','Payers and taxpayers'])]
xs=[0.05,2.05,4.05,6.35,8.2]; ws=[1.9,1.9,2.2,1.75,1.75]
for (t,items),x,wd in zip(cols,xs,ws):
    ax.add_patch(Rectangle((x,5.2),wd,0.6,fc=NAVY,ec=NAVY)); ax.text(x+wd/2,5.5,t,ha='center',va='center',color='white',fontweight='bold',fontsize=10)
    n=len(items); h=5.0/ max(n,7)
    for i,it in enumerate(items):
        y=5.1-(i+1)*h*0.98
        box(ax,x,y,wd,h*0.85,it,fc=LIGHT if t!='PROCESS' else ICE,ec=BLUE,fs=7.0,wrapw=22 if t!='PROCESS' else 28)
save(fig,'sipoc')

# 4 nonuse
fig,ax=plt.subplots(figsize=(7.2,4)); yr=[2013,2022,2023,2024]; v=[18.2,26.6,27.9,29.3]
ax.plot(yr[:2],v[:2],':',color=NAVY,lw=1.6); ax.plot(yr[1:],v[1:],'-',color=NAVY,lw=2.2); ax.scatter(yr,v,s=70,color=NAVY,zorder=3); 
for a,b in zip(yr,v): ax.text(a,b+0.9,f'{b}%',ha='center',fontweight='bold',fontsize=10)
ax.set_ylim(10,35); ax.set_xlim(2012,2025); ax.set_ylabel('Recovered kidneys not transplanted (%)'); ax.spines[['top','right']].set_visible(False)
ax.axhline(18.2,color=GOLD,ls='--',lw=1); ax.text(2016.2,18.8,'2013 level',color=GOLD,fontsize=9)
ax.set_title('Nonuse of recovered kidneys, selected years',loc='left',fontweight='bold',fontsize=12)
ax.text(2012,10.6,'Definitions differ slightly between report editions; 2022–2023 from the 2023 report, 2013 and 2024 from the 2024 report.',fontsize=7.5,color=GRAY)
save(fig,'nonuse')

# 5 sigma
fig,ax=plt.subplots(figsize=(7.2,4)); lab=['2013','2022','2023','2024']; s=[2.41,2.12,2.09,2.04]
bars=ax.bar(lab,s,color=[ICE,BLUE,BLUE,NAVY],width=.55)
for b,val in zip(bars,s): ax.text(b.get_x()+b.get_width()/2,val+0.06,f'{val:.2f}',ha='center',fontweight='bold')
for lv,tx in [(3,'3 sigma: 6.7% defects'),(4,'4 sigma: 0.6% defects')]:
    ax.axhline(lv,color=GOLD if lv==3 else GREEN,ls='--',lw=1.2); ax.text(3.45,lv+0.05,tx,ha='right',fontsize=9,color=GRAY)
ax.set_ylim(0,4.6); ax.set_ylabel('Estimated sigma level'); ax.spines[['top','right']].set_visible(False)
ax.set_title('Kidney nonuse expressed as a sigma level',loc='left',fontweight='bold',fontsize=12)
fig.text(0.12,0.0,'Author calculation; each unused recovered kidney treated as one defect; 1.5-sigma convention.',fontsize=7.5,color=GRAY); save(fig,'sigma')

# 6 hazard
fig,ax=plt.subplots(figsize=(7.2,4)); h=np.linspace(6,36,100)
ax.plot(h,1.013**(h-6),color=NAVY,lw=2.4,label='Graft failure (HR 1.013 per hour)'); ax.plot(h,1.018**(h-6),color=RED,lw=2.4,label='Death (HR 1.018 per hour)')
for hh in (12,24,30): ax.axvline(hh,color=GRAY,lw=.6,ls=':')
ax.text(30.8,1.013**24-0.07,f'{1.013**24:.2f}',color=NAVY,fontweight='bold'); ax.text(30.8,1.018**24+0.04,f'{1.018**24:.2f}',color=RED,fontweight='bold')
ax.set_xlabel('Cold ischemia time (hours)'); ax.set_ylabel('Relative hazard vs 6 hours'); ax.legend(frameon=False,loc='upper left'); ax.spines[['top','right']].set_visible(False)
ax.set_title('What each added hour compounds to',loc='left',fontweight='bold',fontsize=12)
ax.text(6,0.99,'Illustrative extrapolation of published per-hour hazard ratios; author calculation.',fontsize=7.5,color=GRAY); save(fig,'hazard')

# 7 fishbone
fig,ax=plt.subplots(figsize=(10,5.6)); ax.set_xlim(0,12); ax.set_ylim(-3.4,3.4); ax.axis('off')
ax.plot([0.3,9.6],[0,0],color=NAVY,lw=3.2)
box(ax,9.7,-0.75,2.2,1.5,'Recovered kidney\nnot transplanted\n(29.3%, 2024)',fc=NAVY,ec=NAVY,tc='white',fs=9.5,bold=True)
top=[('PEOPLE',1.9,['Acceptance varies (kappa 0.13, one survey)','Center-level acceptance gaps (12.5% vs 7.2%)']),('POLICY',4.9,['Broader sharing, longer cold time','Outcome-metric pressure (hypothesis)']),('PROCESS',7.9,['Median seven offers before acceptance','Weekend procurement; 3.3 to 29 h handoffs'])]
bot=[('PRESERVATION',1.9,['Static cold storage is the baseline','Oxygen delivery unproven; few large trials']),('PAYMENT',4.9,['Cost borne now, benefit later','Acceptance priced only since 2025']),('PATIENT DATA',7.9,['Biopsy-linked nonuse 40.8% vs 6.4%','Hep C stigma fell as drugs arrived'])]
for sign,grp in ((1,top),(-1,bot)):
    for name,x,causes in grp:
        ax.plot([x,x+1.5],[sign*2.7,0],color=BLUE,lw=2.2)
        box(ax,x-0.7,sign*2.7+(0.05 if sign>0 else -0.7),2.2,0.65,name,fc=ICE,ec=BLUE,fs=9.5,bold=True)
        for i,c in enumerate(causes):
            yy=sign*(1.9-0.9*i); xx=x+1.5*(1-abs(yy)/2.7)
            ax.plot([xx-0.35,xx],[yy,yy],color=GRAY,lw=1); ax.text(xx-0.4,yy,wrap(c,26),ha='right',va='center',fontsize=7.4)
save(fig,'fishbone')

# 8 incentives
fig,ax=plt.subplots(figsize=(10,5.6)); ax.set_xlim(0,12); ax.set_ylim(0,7); ax.axis('off')
payers=[('Medicare (CMS)',5.3),('HRSA and OPTN board',2.7),('Congress and HRSA',0.3)]
for t,y in payers: box(ax,0.1,y,2.6,1.3,t,fc=NAVY,ec=NAVY,tc='white',bold=True,fs=9.5)
acts=[('Dialysis facilities','ETC model: home dialysis, waitlisting, living-donor transplants (31% of regions). Margins rise with patients on dialysis (Gander 2019).',5.9,0),
('Transplant hospitals','IOTA: volume 60, offer acceptance 20, graft survival 20. Bonus up to $15,000; penalty up to $2,000.',4.3,0),
('Procurement organizations (55)','Tiers on donation and transplant rates; Tier 3 faces decertification.',2.7,0),
('Network board and contractors','Compliance with allocation policy; FY2027 fee $1,268 per candidate.',1.1,0),
('Living donors','Up to $6,000 per organ for travel, lost wages, dependent care (HOLD Act).',-0.5,0)]
for t,m,y,_ in acts:
    box(ax,4.0,y,2.4,1.1,t,fc=ICE,ec=BLUE,bold=True,fs=9,wrapw=22); box(ax,6.6,y,5.3,1.1,m,fc=LIGHT,ec=GRAY,fs=7.8,wrapw=60)
links=[(1,0),(1,1),(1,2),(1,3),(1,0),(2,3),(2,2),(0,4)]
ypay=[5.95,3.35,0.95]; yact=[6.45,4.85,3.25,1.65,0.05]
for p,a in [(0,0),(0,1),(0,2),(1,3),(2,4),(1,2)]:
    ax.add_patch(FancyArrowPatch((2.75,ypay[p]),(3.95,yact[a]),arrowstyle='-|>',mutation_scale=10,color=GRAY,lw=1))
ax.text(0.1,-1.3,'Each stream rewards a different segment. No arrow points at the patient\'s single question: a working kidney, in time.',fontsize=9,color=RED,fontweight='bold'); ax.set_ylim(-1.6,7.2)
save(fig,'incentives')

# 9 living
fig,ax=plt.subplots(figsize=(7.2,4)); yl=['2019','2023','2024','2025']; vl=[6867,6290,6419,6522]
bars=ax.bar(yl,vl,color=[ICE,BLUE,BLUE,NAVY],width=.55)
for b,val in zip(bars,vl): ax.text(b.get_x()+b.get_width()/2,val+40,f'{val:,}',ha='center',fontweight='bold')
ax.set_ylim(5500,7200); ax.set_ylabel('Living kidney donors'); ax.spines[['top','right']].set_visible(False)
ax.set_title('Living kidney donors per year',loc='left',fontweight='bold',fontsize=12)
ax.text(-0.4,5560,'Single news report of registry data; verify before citing. Axis starts at 5,500.',fontsize=7.5,color=GRAY); save(fig,'living')

# 10 ladder
fig,ax=plt.subplots(figsize=(10,6)); ax.set_xlim(0,10); ax.set_ylim(-0.6,8); ax.axis('off')
stages=['Concept','Preclinical','Early human','Randomized trials','Established practice']
for i,s in enumerate(stages):
    ax.add_patch(Rectangle((3.3+i*1.34,7.0),1.3,0.7,fc=NAVY if i%2==0 else BLUE,ec='white')); ax.text(3.3+i*1.34+0.65,7.35,wrap(s,12),ha='center',va='center',color='white',fontsize=7.6,fontweight='bold')
tech=[('Static cold storage',4,'Standard of care'),('Hypothermic machine perfusion',4,'Randomized evidence; 10-yr follow-up reported by maker'),('Oxygenated hypothermic perfusion',3,'Randomized: mixed results'),('Normothermic perfusion',3,'Two randomized trials: no benefit on main endpoint'),('Oxygen-carrier additive (HEMO2life)',2,'Small paired study; randomized results not found'),('BHOC oxygen carrier',1,'Research concept (Foundation\'s own statement)'),('Pig kidney (EXPAND trial)',2,'First transplant Nov 2025; no outcomes yet')]
for k,(t,stg,note) in enumerate(tech):
    y=6.3-k*0.98; ax.text(3.2,y,t,ha='right',va='center',fontsize=8.4,fontweight='bold')
    ax.plot([3.3,3.3+5*1.34],[y,y],color='#d5dde6',lw=.8,zorder=0)
    cx=3.3+stg*1.34+0.65; ax.scatter([cx],[y],s=140,color=GOLD if stg<4 else GREEN,zorder=3,edgecolor=NAVY)
    ax.text(cx+0.2 if stg<3 else cx-0.2,y-0.3,wrap(note,34),fontsize=6.8,color=GRAY,ha='left' if stg<3 else 'right',va='top')
save(fig,'ladder')

# 11 dmaic
fig,ax=plt.subplots(figsize=(10,2.8)); ax.set_xlim(0,10); ax.set_ylim(0,3); ax.axis('off')
ph=[('DEFINE','Customer, map,\nhow to read numbers','Part One'),('MEASURE','Nonuse, access,\nthe clock','Part Two'),('ANALYZE','Fishbone, incentives,\ngovernance, trust,\nliving donors','Part Three'),('IMPROVE','Innovation, method,\nawareness, cost,\na platform','Part Four'),('CONTROL','Dashboard and\nowner','Part Five')]
for i,(a,b,c) in enumerate(ph):
    x=0.15+i*1.95; pts=[(x,0.4),(x+1.6,0.4),(x+1.9,1.5),(x+1.6,2.6),(x,2.6),(x+0.3,1.5)] if i else [(x,0.4),(x+1.6,0.4),(x+1.9,1.5),(x+1.6,2.6),(x,2.6)]
    ax.add_patch(Polygon(pts,closed=True,fc=[NAVY,BLUE,'#3f83c8',ICE,GOLD][i],ec='white',lw=2))
    tc='white' if i!=3 else NAVY
    ax.text(x+0.95,2.15,a,ha='center',fontweight='bold',fontsize=11,color=tc); ax.text(x+0.95,1.4,b,ha='center',va='center',fontsize=6.6,color=tc); ax.text(x+0.95,0.65,c,ha='center',fontsize=8,color=tc,style='italic')
save(fig,'dmaic')
print('figures done')
